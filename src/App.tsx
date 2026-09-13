import AuthProvider from "./components/providers/AuthProvider";
import { createHashRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { AppStateProvider } from "./components/providers/AppStateProvider";
import { useEffect, useState } from "react";
import { getStorage } from "./lib/storage";
import { sendMobileLog } from "./lib/utils/logger";
import { Capacitor } from "@capacitor/core";
import { BackgroundMode } from "@anuradev/capacitor-background-mode";

function App() {
  const hashRouter = createHashRouter(routes);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Global error traps for unhandled exceptions on the mobile device
    const handleGlobalError = (event: ErrorEvent) => {
      sendMobileLog(event.error || event.message, "GlobalErrorBoundary");
    };
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      sendMobileLog(event.reason, "UnhandledPromiseRejection");
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    if (Capacitor.isNativePlatform()) {
      BackgroundMode.enable();
    }

    getStorage().init().then(() => {
      setIsReady(true);
    }).catch((e) => {
      console.error("Failed to initialize storage:", e);
      sendMobileLog(e, "StorageInit");
      setIsReady(true); // Attempt to render anyway
    });

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, []);

  if (!isReady) {
    return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Initializing Vault...</div>;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppStateProvider>
        <AuthProvider>
          <RouterProvider router={hashRouter} />
        </AuthProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;

