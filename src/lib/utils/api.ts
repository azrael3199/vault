import axios from "axios";

export const apiClient = axios.create({
  baseURL:
    process.env.MODE === "development"
      ? "/api"
      : `${process.env.VITE_BACKEND_URI}/api`,
  headers: {
    "Content-Type": "application/json",
    // You can add other headers like authorization token here
  },
});
