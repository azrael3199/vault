import { getStorage } from "../storage";
import { MobileStorageAdapter } from "../storage/MobileStorageAdapter";
import { Capacitor } from "@capacitor/core";

export interface SyncMetadata {
  id: string;
  filename: string;
  uploadedAt: string;
  type: string;
  size: number;
  isFavorite: boolean;
  isDeleted: boolean;
  updatedAt: string;
  isCorrupted?: boolean;
}

export interface SyncPlan {
  pullFromPC: SyncMetadata[];
  pushToPC: SyncMetadata[];
  deleteLocal: SyncMetadata[];
  deleteRemote: SyncMetadata[];
  corruptLocal: SyncMetadata[];
}

export class DiffEngine {
  static async getRemoteMetadata(serverIp: string, userId: string): Promise<SyncMetadata[]> {
    const response = await fetch(`http://${serverIp}:5000/api/sync/metadata/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch remote metadata");
    return response.json();
  }

  static async getLocalMetadata(): Promise<SyncMetadata[]> {
    if (!Capacitor.isNativePlatform()) return [];
    
    const storage = getStorage() as MobileStorageAdapter;
    const res = await storage.getRawDb().query(`SELECT * FROM secure_files WHERE userId = ?`, [localStorage.getItem("userId")]);
    
    // Integrity Scanner: Fast disk verification
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const filesOnDisk = new Map<string, number>();
    
    try {
      const fsRes = await Filesystem.readdir({ path: "vault_files", directory: Directory.Data });
      // In newer Capacitor versions, readdir returns { files: FileInfo[] } where FileInfo has a .size and .name
      for (const file of fsRes.files) {
        // Simple type check since Capacitor API might return objects or strings depending on version
        const name = typeof file === 'string' ? file : file.name;
        // If string (legacy Capacitor), size is unknown so we mock it as -1
        const size = typeof file === 'string' ? -1 : Number(file.size || 0);
        filesOnDisk.set(name, size);
      }
    } catch (e) {
      // Directory doesn't exist yet, all files are corrupt/missing
    }

    return (res.values || []).map((row: Record<string, unknown>) => {
      let isCorrupted = false;
      
      if (!row.isDeleted) {
        const id = row.id as string;
        if (!filesOnDisk.has(id)) {
          isCorrupted = true; // Missing entirely
        } else {
          const sizeOnDisk = filesOnDisk.get(id);
          const expectedSizeOnDisk = Number(row.size) * 2;
          
          if (sizeOnDisk === 0 || (sizeOnDisk !== -1 && sizeOnDisk !== expectedSizeOnDisk)) {
            isCorrupted = true;
          }
        }
      }
      
      return {
        id: row.id as string,
        filename: row.filename as string,
        uploadedAt: new Date(row.uploadedAt as number).toISOString(),
        type: row.type as string,
        size: row.size as number,
        isFavorite: row.isFavorite === 1,
        isDeleted: row.isDeleted === 1,
        // Artificially reset timestamp if missing/corrupted so the Engine sees it as outdated
        updatedAt: isCorrupted ? new Date(0).toISOString() : new Date(row.updatedAt as number).toISOString(),
        isCorrupted
      };
    });
  }

  static async generatePlan(serverIp: string, userId: string): Promise<SyncPlan> {
    const remote = await this.getRemoteMetadata(serverIp, userId);
    const local = await this.getLocalMetadata();

    const remoteMap = new Map(remote.map(m => [m.id, m]));
    const localMap = new Map(local.map(m => [m.id, m]));

    const plan: SyncPlan = {
      pullFromPC: [],
      pushToPC: [],
      deleteLocal: [],
      deleteRemote: [],
      corruptLocal: []
    };

    // Check remote against local
    for (const r of remote) {
      const l = localMap.get(r.id);
      
      if (!l) {
        // Exists on remote but not local
        if (!r.isDeleted) {
          plan.pullFromPC.push(r);
        }
      } else {
        // Exists on both, check timestamps
        const rTime = new Date(r.updatedAt).getTime();
        const lTime = new Date(l.updatedAt).getTime();

        if (l.isCorrupted) {
          plan.corruptLocal.push(l);
        }

        if (rTime > lTime) {
          // Remote is newer
          if (r.isDeleted && !l.isDeleted) {
            plan.deleteLocal.push(l);
          } else if (!r.isDeleted) {
            plan.pullFromPC.push(r); // E.g., isFavorite toggled, or content changed (or corrupted)
          }
        } else if (lTime > rTime) {
          // Local is newer
          if (l.isDeleted && !r.isDeleted) {
            plan.deleteRemote.push(r);
          } else if (!l.isDeleted) {
            plan.pushToPC.push(l);
          }
        }
      }
    }

    // Check local against remote (for items only existing locally)
    for (const l of local) {
      if (!remoteMap.has(l.id)) {
        if (!l.isDeleted) {
          plan.pushToPC.push(l);
        }
      }
    }

    return plan;
  }
}

