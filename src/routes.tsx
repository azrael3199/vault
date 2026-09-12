import { lazy, Suspense } from "react";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import LoadingSpinner from "./components/GlobalLoader/LoadingSpinner";

const Gallery = lazy(() => import("./pages/Gallery"));
const Login = lazy(() => import("./pages/Login"));
const Main = lazy(() => import("./pages/Main"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Register = lazy(() => import("./pages/Register"));

const SuspenseLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><LoadingSpinner className="w-8 h-8"/></div>}>
    {children}
  </Suspense>
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
    path: "*",
    element: (
      <SuspenseLayout>
        <NotFound />
      </SuspenseLayout>
    ),
  },
];

export default routes;
