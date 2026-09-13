import { createContext, Dispatch, SetStateAction, useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Toaster } from "../ui/toaster";
import GlobalLoader from "../GlobalLoader/GlobalLoader";

export type File = {
  id: string;
  filename: string;
  uploadedAt: string;
  content: string | null;
  type: string;
  size: number;
  isFavorite: boolean;
};

interface AppState {
  galleryFiles: File[];
  selectedFile: File | null;
  loading: string | null;
  serverIp: string | null;
  serverStatus: "offline" | "scanning" | "connected";
  setGalleryFiles: Dispatch<SetStateAction<File[]>>;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  updateFileContent: (id: string, content: string) => void;
  setLoading: Dispatch<SetStateAction<string | null>>;
  setServerIp: Dispatch<SetStateAction<string | null>>;
  setServerStatus: Dispatch<SetStateAction<"offline" | "scanning" | "connected">>;
  forceScan: () => Promise<void>;
}

export const AppStateContext = createContext<AppState>({
  galleryFiles: [],
  selectedFile: null,
  loading: null,
  serverIp: null,
  serverStatus: "offline",
  setGalleryFiles: () => null,
  setSelectedFile: () => null,
  updateFileContent: () => null,
  setLoading: () => null,
  setServerIp: () => null,
  setServerStatus: () => null,
  forceScan: async () => {},
});

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [serverIp, setServerIp] = useState<string | null>(localStorage.getItem("lastServerIp"));
  const [serverStatus, setServerStatus] = useState<"offline" | "scanning" | "connected">("offline");

  const updateFileContent = (id: string, content: string) => {
    const index = galleryFiles.findIndex((file) => file.id === id);
    if (index !== -1) {
      galleryFiles[index].content = content;
      setGalleryFiles([...galleryFiles]);
    }
  };

  const scanSubnet = async (subnet: string) => {
    return new Promise<string | null>(async (resolve) => {
      let foundIp: string | null = null;
      const ips = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);
      for (let i = 0; i < ips.length; i += 30) {
        if (foundIp) break;
        const batch = ips.slice(i, i + 30);
        await Promise.all(batch.map((ip) => {
          return new Promise<void>((res) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => { controller.abort(); res(); }, 800);
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

  const forceScan = async () => {
    if (!Capacitor.isNativePlatform()) {
      setServerStatus("connected");
      setServerIp("localhost");
      return;
    }
    setServerStatus("scanning");
    const subnets = ["192.168.31", "192.168.1", "192.168.0", "192.168.29", "10.0.0"];
    let foundIp: string | null = null;
    
    // Check last IP first if available
    const lastIp = localStorage.getItem("lastServerIp");
    if (lastIp) {
       try {
         const controller = new AbortController();
         const timeout = setTimeout(() => controller.abort(), 1000);
         const res = await fetch(`http://${lastIp}:5000/api/ping`, { signal: controller.signal }).then(r => r.json());
         clearTimeout(timeout);
         if (res.success && res.service === "vault-server") {
            foundIp = lastIp;
         }
       } catch(e) {}
    }

    if (!foundIp) {
      for (const subnet of subnets) {
        foundIp = await scanSubnet(subnet);
        if (foundIp) break;
      }
    }

    if (foundIp) {
      setServerIp(foundIp);
      setServerStatus("connected");
      localStorage.setItem("lastServerIp", foundIp);
    } else {
      setServerStatus("offline");
      setServerIp(null);
    }
  };

  useEffect(() => {
    forceScan();
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        galleryFiles,
        selectedFile,
        loading,
        serverIp,
        serverStatus,
        setGalleryFiles,
        setSelectedFile,
        updateFileContent,
        setLoading,
        setServerIp,
        setServerStatus,
        forceScan,
      }}
    >
      {children}
      <GlobalLoader message={loading} />
      <Toaster />
    </AppStateContext.Provider>
  );
};

