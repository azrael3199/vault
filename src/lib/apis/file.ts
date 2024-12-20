import { apiClient } from "../utils/api";

export const getAllFilesOfType = (
  type: "image" | "video" | "recording" | "text"
) => {
  return apiClient.get(`/files/get/${type}`);
};

export const downloadFile = (
  id: string,
  type: "image" | "video" | "text" | "recording"
) => {
  return apiClient.get(`/files/download/${type}/${id}`);
};

export const uploadFiles = (files: FileList) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  return apiClient.post(`/files/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const favoriteFile = async (id: string) => {
  return apiClient
    .put(`/files/update/${id}`, {
      isFavorite: true,
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

export const unfavoriteFile = async (id: string) => {
  return apiClient
    .put(`/files/update/${id}`, {
      isFavorite: false,
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

export const deleteFile = (id: string) => {
  return apiClient.delete(`/files/delete/${id}`);
};
