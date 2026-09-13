export interface StorageAdapter {
  /**
   * Initialize the storage adapter (e.g., connect to SQLite for mobile)
   */
  init(): Promise<void>;

  /**
   * Get all files of a specific type (excluding content)
   */
  getFiles(type: "image" | "video" | "recording" | "text" | "audio"): Promise<Record<string, unknown>[]>;

  /**
   * Download a specific file's content
   */
  downloadFile(id: string, type: string): Promise<{
    uploadedAt: string;
    filename: string;
    type: string;
    size: number;
    content: string; // Base64 for images, utf-8 for text
  }>;

  /**
   * Upload and encrypt new files
   */
  uploadFiles(files: FileList, onProgress?: (progress: number) => void): Promise<void>;

  /**
   * Soft-delete a file
   */
  deleteFile(id: string): Promise<void>;

  /**
   * Update file metadata (e.g., isFavorite)
   */
  updateFile(id: string, updates: Partial<Record<string, unknown>>): Promise<Record<string, unknown>>;

  /**
   * Login user and cache session/keys
   */
  login(username: string, passwordHash: string): Promise<Record<string, unknown>>;

  /**
   * Register user
   */
  register(username: string, passwordHash: string): Promise<Record<string, unknown>>;

  /**
   * Recover user password
   */
  recover(username: string, recoveryKey: string, newPasswordHash: string): Promise<Record<string, unknown>>;

  /**
   * Generate a new recovery key for an existing user
   */
  generateRecoveryKey(username: string, passwordHash: string): Promise<Record<string, unknown>>;
}

