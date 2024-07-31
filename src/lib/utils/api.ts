import axios from "axios";

const BASE_URL = process.env.VITE_BACKEND_URI || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    // You can add other headers like authorization token here
  },
});
