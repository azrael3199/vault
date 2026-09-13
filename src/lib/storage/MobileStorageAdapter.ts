import { StorageAdapter } from "./StorageAdapter";
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { MobileCrypto, buf2hex, hex2buf } from "./MobileCrypto";

export class MobileStorageAdapter implements StorageAdapter {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  
  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  public getRawDb(): SQLiteDBConnection {
    return this.db;
  }

  async init(): Promise<void> {
    try {
      this.db = await this.sqlite.createConnection("vault_db", false, "no-encryption", 1, false);
      await this.db.open();

      const query = `
        CREATE TABLE IF NOT EXISTS users (
          username TEXT PRIMARY KEY,
          passwordHash TEXT NOT NULL,
          masterKeyHex TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS secure_files (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          filename TEXT NOT NULL,
          uploadedAt INTEGER NOT NULL,
          type TEXT NOT NULL,
          size INTEGER NOT NULL,
          isFavorite INTEGER DEFAULT 0,
          isDeleted INTEGER DEFAULT 0,
          updatedAt INTEGER NOT NULL,
          encryptedKey TEXT NOT NULL,
          keyIv TEXT NOT NULL,
          keyAuthTag TEXT NOT NULL,
          fileIv TEXT NOT NULL,
          fileAuthTag TEXT NOT NULL
        );
      `;
      await this.db.execute(query);
    } catch (e) {
      console.error("SQLite Init Error", e);
    }
  }

  async getFiles(type: "image" | "video" | "recording" | "text" | "audio"): Promise<Record<string, unknown>[]> {
    const userId = localStorage.getItem("userId");
    const res = await this.db.query(
      `SELECT id, filename, uploadedAt, type, size, isFavorite, updatedAt FROM secure_files WHERE userId = ? AND type LIKE ? AND isDeleted = 0`,
      [userId, `%${type}%`]
    );
    return (res.values as Record<string, unknown>[]) || [];
  }

  async downloadFile(id: string, type: string): Promise<Record<string, unknown>> {
    const userId = localStorage.getItem("userId");
    const res = await this.db.query(`SELECT * FROM secure_files WHERE id = ? AND userId = ? AND isDeleted = 0`, [id, userId]);
    if (!res.values || res.values.length === 0) throw new Error("File not found");
    const file = res.values[0];

    // Read the encrypted file from Filesystem
    const fsRes = await Filesystem.readFile({
      path: `vault_files/${id}`,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    const encryptedContentHex = fsRes.data as string;
    const encryptedContent = hex2buf(encryptedContentHex);

    // KEK Generation
    const masterKey = localStorage.getItem("masterKeyHex") || "default_local_master_key_for_now";
    const passwordHash = localStorage.getItem("passwordHash") || "";
    const kek = await MobileCrypto.deriveKEK(masterKey, passwordHash);

    // Decrypt DEK
    const encryptedKey = hex2buf(file.encryptedKey);
    const keyIv = hex2buf(file.keyIv);
    const keyAuthTag = hex2buf(file.keyAuthTag);
    
    const keyCiphertextWithTag = new Uint8Array(encryptedKey.length + keyAuthTag.length);
    keyCiphertextWithTag.set(encryptedKey);
    keyCiphertextWithTag.set(keyAuthTag, encryptedKey.length);
    
    const dekBuffer = await MobileCrypto.decryptData(kek, keyCiphertextWithTag, keyIv);
    
    // Decrypt File Content
    const dekKey = await window.crypto.subtle.importKey("raw", dekBuffer, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    const fileIv = hex2buf(file.fileIv);
    const fileAuthTag = hex2buf(file.fileAuthTag);
    
    const fileCiphertextWithTag = new Uint8Array(encryptedContent.length + fileAuthTag.length);
    fileCiphertextWithTag.set(encryptedContent);
    fileCiphertextWithTag.set(fileAuthTag, encryptedContent.length);

    const decryptedContentBuffer = await MobileCrypto.decryptData(dekKey, fileCiphertextWithTag, fileIv);
    
    let contentStr = "";
    if (type === "image" || type === "audio") {
      // Convert ArrayBuffer to base64
      let binary = "";
      const bytes = new Uint8Array(decryptedContentBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      contentStr = btoa(binary);
    } else {
      contentStr = new TextDecoder().decode(decryptedContentBuffer);
    }

    return {
      uploadedAt: file.uploadedAt,
      filename: file.filename,
      type: file.type,
      size: file.size,
      content: contentStr,
    };
  }

  async uploadFiles(files: FileList, onProgress?: (progress: number) => void): Promise<void> {
    const userId = localStorage.getItem("userId");
    const masterKey = localStorage.getItem("masterKeyHex") || "default_local_master_key_for_now";
    const passwordHash = localStorage.getItem("passwordHash") || "";
    const kek = await MobileCrypto.deriveKEK(masterKey, passwordHash);

    for (let i = 0; i < files.length; i++) {
      if (onProgress) onProgress(Math.round((i / files.length) * 100));
      const file = files[i];
      const buffer = await file.arrayBuffer();
      const contentUint8 = new Uint8Array(buffer);

      // Generate DEK
      const rawDek = MobileCrypto.generateRandomBytes(32);
      const dekKey = await window.crypto.subtle.importKey("raw", rawDek, { name: "AES-GCM" }, false, ["encrypt"]);
      
      // Encrypt Content
      const encryptedFile = await MobileCrypto.encryptData(dekKey, contentUint8);
      // WebCrypto appends auth tag to the end of ciphertext
      const fileAuthTag = encryptedFile.ciphertext.slice(-16);
      const pureFileCiphertext = encryptedFile.ciphertext.slice(0, -16);

      // Encrypt DEK with KEK
      const encryptedDek = await MobileCrypto.encryptData(kek, rawDek);
      const keyAuthTag = encryptedDek.ciphertext.slice(-16);
      const pureKeyCiphertext = encryptedDek.ciphertext.slice(0, -16);

      const id = crypto.randomUUID();
      const now = Date.now();

      // Save to SQLite
      await this.db.run(
        `INSERT INTO secure_files (id, userId, filename, uploadedAt, type, size, updatedAt, encryptedKey, keyIv, keyAuthTag, fileIv, fileAuthTag) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, userId, file.name, now, file.type, file.size, now,
          buf2hex(pureKeyCiphertext), buf2hex(encryptedDek.iv), buf2hex(keyAuthTag),
          buf2hex(encryptedFile.iv), buf2hex(fileAuthTag)
        ]
      );

      // Save to Filesystem
      // We must ensure the directory exists first
      try {
        await Filesystem.mkdir({ path: "vault_files", directory: Directory.Data });
      } catch (e) {
        // Directory already exists
      }
      await Filesystem.writeFile({
        path: `vault_files/${id}`,
        data: buf2hex(pureFileCiphertext),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
    }
    if (onProgress) onProgress(100);
  }

  async deleteFile(id: string): Promise<void> {
    const userId = localStorage.getItem("userId");
    // Hard delete from DB
    await this.db.run(`DELETE FROM secure_files WHERE id = ? AND userId = ?`, [id, userId]);
    // Delete from filesystem
    try {
      await Filesystem.deleteFile({
        path: `vault_files/${id}`,
        directory: Directory.Data,
      });
    } catch (e) {
      console.warn("File already missing on disk", e);
    }
  }

  async bulkDeleteFiles(ids: string[]): Promise<void> {
    const userId = localStorage.getItem("userId");
    for (const id of ids) {
      await this.db.run(`DELETE FROM secure_files WHERE id = ? AND userId = ?`, [id, userId]);
      try {
        await Filesystem.deleteFile({
          path: `vault_files/${id}`,
          directory: Directory.Data,
        });
      } catch (e) {
        console.warn("File already missing on disk", e);
      }
    }
  }

  async updateFile(id: string, updates: Partial<Record<string, unknown>>): Promise<Record<string, unknown>> {
    const userId = localStorage.getItem("userId");
    if (updates.isFavorite !== undefined) {
      await this.db.run(`UPDATE secure_files SET isFavorite = ?, updatedAt = ? WHERE id = ? AND userId = ?`, [updates.isFavorite ? 1 : 0, Date.now(), id, userId]);
    }
    return { success: true };
  }

  async login(username: string, passwordHash: string): Promise<Record<string, unknown>> {
    const res = await this.db.query(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!res.values || res.values.length === 0) {
      throw new Error("Invalid username");
    }
    const user = res.values[0];
    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid password");
    }
    
    // Cache the masterKeyHex and passwordHash in localStorage for the session
    localStorage.setItem("masterKeyHex", user.masterKeyHex);
    localStorage.setItem("passwordHash", passwordHash);
    
    return {
      success: true,
      authenticated: true,
      username: user.username,
      masterKeyHex: user.masterKeyHex,
    };
  }

  async register(username: string, passwordHash: string): Promise<Record<string, unknown>> {
    // Check if user already exists
    const check = await this.db.query(`SELECT * FROM users WHERE username = ?`, [username]);
    if (check.values && check.values.length > 0) {
      throw new Error("User already exists locally");
    }

    // Generate a new random master key for this device
    const rawKey = MobileCrypto.generateRandomBytes(32);
    const masterKeyHex = buf2hex(rawKey);

    await this.db.run(
      `INSERT INTO users (username, passwordHash, masterKeyHex) VALUES (?, ?, ?)`,
      [username, passwordHash, masterKeyHex]
    );

    return { success: true };
  }
}

