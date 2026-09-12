import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

let masterKeyCache: string | null = null;

export const initializeKeyManager = (): void => {
  if (masterKeyCache) return;

  const vaultDir = path.join(os.homedir(), ".vault");
  const keyPath = path.join(vaultDir, "master.key");

  // Ensure directory exists
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }

  // If key file exists, read it
  if (fs.existsSync(keyPath)) {
    const key = fs.readFileSync(keyPath, "utf-8").trim();
    if (key.length === 64) {
      masterKeyCache = key;
      console.log(`[KeyManager] Loaded Master Key from ${keyPath}`);
      return;
    } else {
      console.warn("[KeyManager] Invalid master.key file detected.");
    }
  }

  // Fallback: Check if we have it in .env (migration phase)
  if (process.env.MASTER_ENCRYPTION_KEY && process.env.MASTER_ENCRYPTION_KEY.length === 64) {
    masterKeyCache = process.env.MASTER_ENCRYPTION_KEY;
    fs.writeFileSync(keyPath, masterKeyCache, "utf-8");
    console.log(`[KeyManager] Migrated MASTER_ENCRYPTION_KEY from .env to ${keyPath}`);
    return;
  }

  // Otherwise, generate a brand new key
  console.log("[KeyManager] No master key found. Generating a new one...");
  const newKey = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(keyPath, newKey, { encoding: "utf-8", mode: 0o600 });
  masterKeyCache = newKey;
  console.log(`[KeyManager] New master key saved to ${keyPath}`);
};

export const getMasterKey = (): string => {
  if (!masterKeyCache) {
    // Failsafe if accessed before initialization
    initializeKeyManager(); 
  }
  if (!masterKeyCache) {
    throw new Error("Master Encryption Key is not initialized.");
  }
  return masterKeyCache;
};
