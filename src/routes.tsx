import { lazy, Suspense } from "react";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import LoadingSpinner from "./components/GlobalLoader/LoadingSpinner";

import Audio from "./pages/Audio";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";
import Recover from "./pages/Recover";
import Register from "./pages/Register";
import SyncReview from "./components/SyncReview";

const SuspenseLayout = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const routes = [
  {
    path: "/login",
    element: (
      <Layout>
        <SuspenseLayout>
          <Login />
        </SuspenseLayout>
      </Layout>
    ),
  },
  {
    path: "/register",
    element: (
      <Layout>
        <SuspenseLayout>
          <Register />
        </SuspenseLayout>
      </Layout>
    ),
  },
  {
    path: "/recover",
    element: (
      <Layout>
        <SuspenseLayout>
          <Recover />
        </SuspenseLayout>
      </Layout>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <SuspenseLayout>
            <Main />
          </SuspenseLayout>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/gallery",
    element: (
      <ProtectedRoute>
        <Layout>
          <SuspenseLayout>
            <Gallery />
          </SuspenseLayout>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/audio",
    element: (
      <ProtectedRoute>
        <Layout>
          <SuspenseLayout>
            <Audio />
          </SuspenseLayout>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/sync",
    element: (
      <ProtectedRoute>
        <Layout>
          <SuspenseLayout>
            <SyncReview />
          </SuspenseLayout>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: (
      <SuspenseLayout>
        <NotFound />
      </SuspenseLayout>
    ),
  },
];

export default routes;

