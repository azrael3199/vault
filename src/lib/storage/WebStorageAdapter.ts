import { StorageAdapter } from "./StorageAdapter";
import { apiClient } from "../utils/api";

export class WebStorageAdapter implements StorageAdapter {
  async init(): Promise<void> {
    // Web backend needs no explicit client-side init beyond standard axios config
    return Promise.resolve();
  }

  async getFiles(type: "image" | "video" | "recording" | "text"): Promise<Record<string, unknown>[]> {
    const userId = localStorage.getItem("userId");
    const response = await apiClient.get(`/files/get/${type}/${userId}`);
    return response.data;
  }

  async downloadFile(id: string, type: string): Promise<Record<string, unknown>> {
    const userId = localStorage.getItem("userId");
    const response = await apiClient.get(`/files/download/${type}/${id}/${userId}`);
    return response.data;
  }

  async uploadFiles(files: FileList): Promise<void> {
    const formData = new FormData();
    const userId = localStorage.getItem("userId");
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    await apiClient.post(`/files/upload/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deleteFile(id: string): Promise<void> {
    const userId = localStorage.getItem("userId");
    await apiClient.delete(`/files/delete/${id}/${userId}`);
  }

  async bulkDeleteFiles(ids: string[]): Promise<void> {
    const userId = localStorage.getItem("userId");
    await apiClient.post(`/files/bulk-delete/${userId}`, { ids });
  }

  async updateFile(id: string, updates: Partial<Record<string, unknown>>): Promise<Record<string, unknown>> {
    const userId = localStorage.getItem("userId");
    const response = await apiClient.put(`/files/update/${id}/${userId}`, updates);
    return response.data;
  }

  async login(username: string, passwordHash: string): Promise<Record<string, unknown>> {
    const response = await apiClient.post("/users/login", {
      username,
      password: passwordHash,
    });
    return response.data;
  }

  async register(username: string, passwordHash: string): Promise<Record<string, unknown>> {
    const response = await apiClient.post("/users/register", {
      username,
      password: passwordHash,
    });
    return response.data;
  }
}

