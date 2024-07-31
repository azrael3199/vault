import { apiClient } from "../utils/api";

export const userLogin = (username: string, password: string) => {
  return apiClient.post("/users/login", {
    username,
    password,
  });
};
