import { Capacitor } from "@capacitor/core";
import { StorageAdapter } from "./StorageAdapter";
import { WebStorageAdapter } from "./WebStorageAdapter";
import { MobileStorageAdapter } from "./MobileStorageAdapter";

let storageInstance: StorageAdapter;

export const getStorage = (): StorageAdapter => {
  if (!storageInstance) {
    if (Capacitor.isNativePlatform()) {
      storageInstance = new MobileStorageAdapter();
    } else {
      storageInstance = new WebStorageAdapter();
    }
  }
  return storageInstance;
};

