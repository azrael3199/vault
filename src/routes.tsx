import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";

const routes = [
  {
    path: "/login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <Main />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/gallery",
    element: (
      <ProtectedRoute>
        <Layout>
          <Gallery />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
