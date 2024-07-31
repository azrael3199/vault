import AuthProvider from "./components/providers/AuthProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { AppStateProvider } from "./components/providers/AppStateProvider";
function App() {
  const browserRouter = createBrowserRouter(routes);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppStateProvider>
        <AuthProvider>
          <RouterProvider router={browserRouter} />
        </AuthProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;
