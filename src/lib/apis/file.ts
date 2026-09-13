import { getStorage } from "../storage";

export const getAllFilesOfType = async (
  type: "image" | "video" | "recording" | "text"
) => {
  const files = await getStorage().getFiles(type);
  return { data: files };
};

export const downloadFile = async (
  id: string,
  type: "image" | "video" | "text" | "recording"
) => {
  const fileData = await getStorage().downloadFile(id, type);
  // Wrap in an axios-like response object for backward compatibility with Gallery.tsx
  return { data: fileData };
};

export const uploadFiles = async (files: FileList) => {
  await getStorage().uploadFiles(files);
  return { data: "Success" };
};

export const favoriteFile = async (id: string) => {
  const data = await getStorage().updateFile(id, { isFavorite: true });
  return { data };
};

export const unfavoriteFile = async (id: string) => {
  const data = await getStorage().updateFile(id, { isFavorite: false });
  return { data };
};

export const deleteFile = async (id: string) => {
  await getStorage().deleteFile(id);
  return { data: "Success" };
};

