import { Capacitor } from "@capacitor/core";

export const sendMobileLog = async (error: Error | string, context: string = "Global") => {
  if (!Capacitor.isNativePlatform()) return; // Only send logs from Mobile App

  try {
    const serverIp = localStorage.getItem("lastServerIp") || window.location.hostname;
    if (!serverIp || serverIp === "localhost") return;

    const message = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error);

    await fetch(`http://${serverIp}:5000/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    // Fail silently if logger fails
    console.error("Logger failed:", e);
  }
};
