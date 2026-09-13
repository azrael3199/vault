import axios from "axios";

const getBaseUrl = () => {
  // Use Vite's local proxy if in development mode
  if (import.meta.env.MODE === "development") {
    return "/api";
  }
  
  // Dynamically resolve the backend URL to the host's IP address.
  // The frontend Vite server is at port 3000, and the Express backend is at port 5000.
  // This ensures phones on the same WiFi hit the PC's IP, not their own localhost!
  return `http://${window.location.hostname}:5000/api`;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

