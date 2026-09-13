import { useState, useRef, useEffect, useContext } from "react";
import { DiffEngine, SyncPlan, SyncMetadata } from "../lib/sync/DiffEngine";
import { AppStateContext } from "./providers/AppStateProvider";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import LoadingSpinner from "./GlobalLoader/LoadingSpinner";
import { Capacitor } from "@capacitor/core";
import { getStorage } from "../lib/storage";
import { MobileStorageAdapter } from "../lib/storage/MobileStorageAdapter";
import { useNavigate } from "react-router-dom";
import { sendMobileLog } from "../lib/utils/logger";
import {
  Server,
  Zap,
  HardDriveUpload,
  HardDriveDownload,
  Trash2,
  ShieldAlert,
  Terminal as TerminalIcon,
  AlertCircle,
  ArrowLeft,
  XCircle
} from "lucide-react";

async function processInBatches<T>(items: T[], batchSize: number, processFn: (item: T) => Promise<void>, shouldCancel?: () => boolean) {
  for (let i = 0; i < items.length; i += batchSize) {
    if (shouldCancel && shouldCancel()) {
      break;
    }
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(item => processFn(item)));
  }
}

export default function SyncReview() {
  const navigate = useNavigate();
  const { serverIp: globalServerIp, setServerIp: setGlobalServerIp } = useContext(AppStateContext);
  const [serverIp, setServerIp] = useState<string>(globalServerIp || "");
  const [syncPlan, setSyncPlan] = useState<SyncPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const cancelSyncRef = useRef(false);
  
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const scanSubnet = async (subnet: string) => {
    addLog(`Scanning subnet ${subnet}.x...`);
    return new Promise<string | null>(async (resolve) => {
      let foundIp: string | null = null;
      const ips = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);

      // Process in batches of 30 to prevent native socket exhaustion via CapacitorHttp
      for (let i = 0; i < ips.length; i += 30) {
        if (foundIp) break;
        const batch = ips.slice(i, i + 30);
        
        await Promise.all(batch.map((ip) => {
          return new Promise<void>((res) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
              controller.abort();
              res();
            }, 800);

            fetch(`http://${ip}:5000/api/ping`, { signal: controller.signal })
              .then((r) => r.json())
              .then((data) => {
                if (data.success && data.service === "vault-server" && !foundIp) {
                  foundIp = ip;
                  clearTimeout(timeout);
                  resolve(ip);
                }
              })
              .catch(() => {})
              .finally(() => res());
          });
        }));
      }
      
      if (!foundIp) resolve(null);
    });
  };

  const autoDiscover = async () => {
    setIsScanning(true);
    setLogs([]);
    addLog("Starting Auto-Discovery Engine...");
    toast({
      title: "Scanning Network",
      description: "Looking for PC Server...",
    });

    // Most common home network subnets
    const subnets = [
      "192.168.31",
      "192.168.1",
      "192.168.0",
      "192.168.29",
      "10.0.0",
    ];

    try {
      let foundIp: string | null = null;
      for (const subnet of subnets) {
        foundIp = await scanSubnet(subnet);
        if (foundIp) break;
      }

      if (foundIp) {
        setServerIp(foundIp);
        setGlobalServerIp(foundIp);
        localStorage.setItem("lastServerIp", foundIp);
        addLog(`SUCCESS: Locked onto Vault Server at ${foundIp}`);
        toast({
          title: "Server Found!",
          description: `Locked onto ${foundIp}`,
        });
        handleGenerate(foundIp);
      } else {
        addLog(`FAILED: Could not find Vault PC Server on any common subnet.`);
        toast({
          variant: "destructive",
          title: "Discovery Failed",
          description: "Could not find Vault PC Server on network.",
        });
      }
    } catch (e) {
      addLog(`ERROR: Network scan failed - ${(e as Error).message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network scan failed.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerate = async (ipToUse: string = serverIp) => {
    if (!ipToUse) {
      toast({ title: "Wait", description: "No IP address found or entered." });
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({ title: "Error", description: "Not logged in" });
      return;
    }

    setIsGenerating(true);
    localStorage.setItem("lastServerIp", ipToUse);
    addLog(`Connecting to ${ipToUse} to fetch metadata...`);
    try {
      const plan = await DiffEngine.generatePlan(ipToUse, userId);
      setSyncPlan(plan);
      addLog(
        `Diff Engine Complete: Pull ${plan.pullFromPC.length} | Push ${plan.pushToPC.length} | Corrupted ${plan.corruptLocal.length} | DelL ${plan.deleteLocal.length} | DelR ${plan.deleteRemote.length}`,
      );
    } catch (e) {
      sendMobileLog(e as Error, "SyncEngine_Generate");
      addLog(`ERROR: Failed to fetch metadata - ${(e as Error).message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to fetch sync metadata. Make sure the server is running.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const cancelSync = () => {
    if (isSyncing) {
      cancelSyncRef.current = true;
      addLog("Cancelling sync after current batch...");
      toast({ title: "Cancelling", description: "Stopping sync cleanly..." });
    }
  };

  const executeSync = async (corruptOnly: boolean = false) => {
    if (!syncPlan) return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    setIsSyncing(true);
    cancelSyncRef.current = false;
    addLog(corruptOnly ? `Initiating Corrupted Repair mode...` : `Initiating bulk concurrent delta sync...`);

    try {
      const storage = getStorage() as MobileStorageAdapter;
      const db = storage.getRawDb();
      const { MobileCrypto, hex2buf, buf2hex } =
        await import("../lib/storage/MobileCrypto");
      const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");

      const masterKey = localStorage.getItem("masterKeyHex") || "";
      const passwordHash = localStorage.getItem("passwordHash") || "";
      addLog(`Deriving cryptographic keys...`);
      const kek = await MobileCrypto.deriveKEK(masterKey, passwordHash);

      if (!corruptOnly) {
        // 1. Delete Locally
        for (const item of syncPlan.deleteLocal) {
          if (cancelSyncRef.current) break;
          const formatStr = item.type?.startsWith("audio") ? "[Audio]" : "[Image]";
          addLog(`[Local Delete] Soft-deleting ${formatStr} ${item.filename}`);
          const safeUpdatedAt = item.updatedAt || new Date().toISOString();
          await db.run(
            `UPDATE secure_files SET isDeleted = 1, updatedAt = ? WHERE id = ? AND userId = ?`,
            [safeUpdatedAt, item.id, userId],
          );
        }

        // 2. Delete Remote
        for (const item of syncPlan.deleteRemote) {
          if (cancelSyncRef.current) break;
          const formatStr = item.type?.startsWith("audio") ? "[Audio]" : "[Image]";
          addLog(`[Remote Delete] Soft-deleting ${formatStr} ${item.filename}`);
          await fetch(
            `http://${serverIp}:5000/api/files/delete/${item.id}/${userId}`,
            { method: "DELETE" },
          );
        }
      }

      // 3. Pull from PC (Batched concurrency 25)
      const pullQueue = corruptOnly ? syncPlan.corruptLocal : syncPlan.pullFromPC;
      await processInBatches(pullQueue, 25, async (item) => {
        if (cancelSyncRef.current) return;
        const formatStr = item.type?.startsWith("audio") ? "[Audio]" : "[Image]";
        addLog(`[Pulling] Fetching ${formatStr} ${item.filename}...`);
        const res = await fetch(
          `http://${serverIp}:5000/api/sync/pull/${item.id}/${userId}`,
        );
        const data = await res.json();

        addLog(`[Crypto] Re-wrapping DEK for ${item.filename}...`);
        const rawDek = hex2buf(data.rawDekHex);
        const encryptedDek = await MobileCrypto.encryptData(kek, rawDek);
        const keyAuthTag = encryptedDek.ciphertext.slice(-16);
        const pureKeyCiphertext = encryptedDek.ciphertext.slice(0, -16);

        const safeUpdatedAt =
          data.updatedAt || data.uploadedAt || new Date().toISOString();

        try {
          await Filesystem.mkdir({
            path: "vault_files",
            directory: Directory.Data,
          });
        } catch (e) {
          // ignore
        }
        await Filesystem.writeFile({
          path: `vault_files/${data.id}`,
          data: data.contentHex,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });

        await db.run(
          `INSERT OR REPLACE INTO secure_files (id, userId, filename, uploadedAt, type, size, isFavorite, isDeleted, updatedAt, encryptedKey, keyIv, keyAuthTag, fileIv, fileAuthTag) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            userId,
            data.filename,
            data.uploadedAt,
            data.type,
            data.size,
            data.isFavorite ? 1 : 0,
            data.isDeleted ? 1 : 0,
            safeUpdatedAt,
            buf2hex(pureKeyCiphertext),
            buf2hex(encryptedDek.iv),
            buf2hex(keyAuthTag),
            data.fileIv,
            data.fileAuthTag,
          ],
        );

        addLog(`[Saved] ${item.filename} stored locally.`);
      }, () => cancelSyncRef.current);

      if (!corruptOnly) {
        // 4. Push to PC (Batched concurrency 25)
        await processInBatches(syncPlan.pushToPC, 25, async (item) => {
          if (cancelSyncRef.current) return;
          const formatStr = item.type?.startsWith("audio") ? "[Audio]" : "[Image]";
          addLog(`[Pushing] Preparing ${formatStr} ${item.filename} for push...`);
          const res = await db.query(`SELECT * FROM secure_files WHERE id = ?`, [
            item.id,
          ]);
          const file = res.values[0];

          const fsRes = await Filesystem.readFile({
            path: `vault_files/${item.id}`,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
          });
          const contentHex = fsRes.data as string;

          addLog(`[Crypto] Unwrapping DEK for transit...`);
          const encryptedKey = hex2buf(file.encryptedKey);
          const keyIv = hex2buf(file.keyIv);
          const keyAuthTag = hex2buf(file.keyAuthTag);

          const keyCiphertextWithTag = new Uint8Array(
            encryptedKey.length + keyAuthTag.length,
          );
          keyCiphertextWithTag.set(encryptedKey);
          keyCiphertextWithTag.set(keyAuthTag, encryptedKey.length);

          const dekBuffer = await MobileCrypto.decryptData(
            kek,
            keyCiphertextWithTag,
            keyIv,
          );
          const rawDekHex = buf2hex(new Uint8Array(dekBuffer));

          addLog(`[Uploading] Sending ${item.filename} to PC...`);
          await fetch(`http://${serverIp}:5000/api/sync/push/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: file.id,
              filename: file.filename,
              uploadedAt: file.uploadedAt,
              type: file.type,
              size: file.size,
              isFavorite: file.isFavorite === 1,
              isDeleted: file.isDeleted === 1,
              updatedAt: file.updatedAt,
              contentHex,
              fileIv: file.fileIv,
              fileAuthTag: file.fileAuthTag,
              rawDekHex,
            }),
          });
          addLog(`[Sent] ${item.filename} successfully pushed.`);
        }, () => cancelSyncRef.current);
      }

      if (cancelSyncRef.current) {
        addLog(`Sync was cancelled.`);
        toast({ title: "Cancelled", description: "Sync process was halted." });
      } else {
        addLog(`Sync completely successful!`);
        toast({ title: "Success", description: "Sync completed!" });
      }
      
      // Auto-refresh metadata
      await handleGenerate();

    } catch (e) {
      sendMobileLog(e as Error, "SyncEngine_Execute");
      addLog(`ERROR: Sync failed - ${(e as Error).message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: (e as Error).message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="h-full w-full p-4 flex flex-col justify-center items-center relative overflow-hidden animate-fade-in">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Mobile Sync Only
        </h2>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 flex flex-col items-center relative overflow-y-auto animate-fade-in bg-black/5 dark:bg-black/20">
      <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:20px_20px] pointer-events-none" />

      <div className="w-full max-w-md flex justify-start mb-2 relative z-50">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 animate-slide-up text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-background/90 backdrop-blur-md rounded-[14px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Delta Sync
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect to your PC to securely synchronize your offline vault.
          </p>
        </div>

        <div
          className="glass-panel p-6 rounded-3xl border border-white/10 dark:border-white/5 space-y-4 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <Button
            onClick={autoDiscover}
            disabled={isScanning || isGenerating || isSyncing}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-blue-500/30 transition-all border-0 flex items-center gap-2"
          >
            {isScanning ? (
              <LoadingSpinner className="w-5 h-5 text-white" />
            ) : (
              <Server className="w-5 h-5" />
            )}
            {isScanning ? "Scanning Local Network..." : "Auto-Discover PC"}
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center uppercase tracking-wider font-semibold py-2">
            <span className="w-12 h-px bg-white/10"></span>
            OR MANUAL ENTRY
            <span className="w-12 h-px bg-white/10"></span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
              disabled={isSyncing}
              className="flex-1 min-w-0 bg-background/50 border border-white/10 dark:border-white/5 focus-visible:ring-blue-500/50 rounded-xl px-4 text-base transition-all hover:bg-background/80"
              placeholder="e.g. 192.168.1.100"
            />
            <Button
              onClick={() => {
                setLogs([]);
                handleGenerate(serverIp);
              }}
              disabled={isGenerating || !serverIp || isSyncing}
              className="h-full rounded-xl bg-white/10 hover:bg-white/20 text-foreground border-0 backdrop-blur-md"
            >
              {isGenerating ? <LoadingSpinner className="w-4 h-4" /> : "Verify"}
            </Button>
          </div>
        </div>

        {syncPlan && (
          <div
            className="flex flex-col gap-4 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="grid grid-cols-2 gap-3">
              <SyncMetric
                icon={
                  <HardDriveDownload className="w-4 h-4 text-emerald-400" />
                }
                title="Pull"
                items={syncPlan.pullFromPC}
              />
              <SyncMetric
                icon={<HardDriveUpload className="w-4 h-4 text-blue-400" />}
                title="Push"
                items={syncPlan.pushToPC}
              />
              <SyncMetric
                icon={<AlertCircle className="w-4 h-4 text-orange-400" />}
                title="Corrupted"
                items={syncPlan.corruptLocal}
              />
              <SyncMetric
                icon={<Trash2 className="w-4 h-4 text-rose-400" />}
                title="Del Local"
                items={syncPlan.deleteLocal}
              />
              <SyncMetric
                icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
                title="Del Remote"
                items={syncPlan.deleteRemote}
              />
            </div>

            {isSyncing ? (
              <Button
                onClick={cancelSync}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white font-bold text-lg shadow-lg hover:shadow-red-500/30 transition-all border-0 mt-2 flex items-center justify-center gap-2"
              >
                <XCircle className="w-6 h-6 text-white" />
                Cancel Sync
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => executeSync(false)}
                  disabled={isGenerating}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transition-all border-0 mt-2"
                >
                  {isGenerating ? (
                    <LoadingSpinner className="w-6 h-6 text-white" />
                  ) : (
                    "Execute Secure Sync"
                  )}
                </Button>

                {syncPlan.corruptLocal.length > 0 && (
                  <Button
                    onClick={() => executeSync(true)}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-orange-500/50 text-orange-400 hover:bg-orange-500/10 font-bold shadow-lg transition-all"
                  >
                    {isGenerating ? (
                      <LoadingSpinner className="w-5 h-5" />
                    ) : (
                      "Repair Corrupt Files Only"
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        <div
          className="glass-panel p-4 rounded-3xl border border-white/10 dark:border-white/5 space-y-2 animate-slide-up mb-8"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-2 mb-2 text-foreground/80 font-semibold px-2">
            <TerminalIcon className="w-4 h-4" />
            <span>Terminal</span>
          </div>
          <div 
            ref={logsContainerRef}
            className="bg-black/80 dark:bg-black/90 rounded-2xl p-4 h-48 overflow-y-auto font-mono text-xs text-green-400 space-y-1.5 custom-scrollbar shadow-inner scroll-smooth"
          >
            {logs.length === 0 ? (
              <span className="text-muted-foreground/50 italic">
                Awaiting commands...
              </span>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncMetric({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: any[];
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 hover:bg-white/10 transition-colors cursor-default">
      <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <span className="text-lg font-bold text-foreground">
          {items.length}
        </span>
      </div>
    </div>
  );
}
