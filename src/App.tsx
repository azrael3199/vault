import "./App.css";
import AuthProvider from "./components/providers/AuthProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";

function App() {
  const browserRouter = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <RouterProvider router={browserRouter} />
    </AuthProvider>
  );
}

export default App;
