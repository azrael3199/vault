import { apiClient } from "../utils/api";

export const getAllFilesOfType = (
  type: "image" | "video" | "recording" | "text"
) => {
  const userId = sessionStorage.getItem("userId");
  return apiClient.get(`/files/get/${type}/${userId}`);
};

export const downloadFile = (
  id: string,
  type: "image" | "video" | "text" | "recording"
) => {
  const userId = sessionStorage.getItem("userId");
  return apiClient.get(`/files/download/${type}/${id}/${userId}`);
};

export const uploadFiles = (files: FileList) => {
  const formData = new FormData();
  const userId = sessionStorage.getItem("userId");
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  return apiClient.post(`/files/upload/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const favoriteFile = async (id: string) => {
  const userId = sessionStorage.getItem("userId");
  return apiClient
    .put(`/files/update/${id}/${userId}`, {
      isFavorite: true,
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

export const unfavoriteFile = async (id: string) => {
  const userId = sessionStorage.getItem("userId");
  return apiClient
    .put(`/files/update/${id}/${userId}`, {
      isFavorite: false,
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

export const deleteFile = (id: string) => {
  const userId = sessionStorage.getItem("userId");
  return apiClient.delete(`/files/delete/${id}/${userId}`);
};
