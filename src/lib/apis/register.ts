import { apiClient } from "../utils/api";

export const userRegister = (username: string, password: string) => {
  return apiClient.post("/users/register", {
    username,
    password,
  });
};
