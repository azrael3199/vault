import { apiClient } from "../utils/api";

export const userLogin = (username: string, password: string) => {
  return apiClient.post("/users/login", {
    username,
    password,
  });
};
export const userRecover = (username: string, recoveryKey: string, newPassword: string) => {
  return apiClient.post("/users/recover", {
    username,
    recoveryKey,
    newPassword,
  });
};
