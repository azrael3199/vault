import AuthProvider from "./components/providers/AuthProvider";
import { createHashRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { AppStateProvider } from "./components/providers/AppStateProvider";
function App() {
  const hashRouter = createHashRouter(routes);

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
