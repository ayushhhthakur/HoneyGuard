import React, { Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";

import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ProtectedRoute, GuestOnlyRoute } from "./components/RouteGuards";
import { Skeleton } from "./components/ui/skeleton";

// Containers
const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));

// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const ForgotPassword = React.lazy(
  () => import("./views/pages/forgotpassword/ForgotPassword"),
);
const CreateOrg = React.lazy(() => import("./views/pages/createorg/CreateOrg"));
const AcceptInvite = React.lazy(
  () => import("./views/pages/acceptinvite/AcceptInvite"),
);
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));

const FullPageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-8">
    <div className="w-full max-w-sm space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SidebarProvider>
          <HashRouter>
            <Suspense fallback={<FullPageFallback />}>
              <Routes>
                <Route
                  exact
                  path="/login"
                  name="Login Page"
                  element={
                    <GuestOnlyRoute>
                      <Login />
                    </GuestOnlyRoute>
                  }
                />
                <Route
                  exact
                  path="/register"
                  name="Register Page"
                  element={
                    <GuestOnlyRoute>
                      <Register />
                    </GuestOnlyRoute>
                  }
                />
                <Route
                  exact
                  path="/forgot-password"
                  name="Forgot Password"
                  element={<ForgotPassword />}
                />
                <Route
                  exact
                  path="/create-org"
                  name="Create Organization"
                  element={
                    <ProtectedRoute>
                      <CreateOrg />
                    </ProtectedRoute>
                  }
                />
                <Route
                  exact
                  path="/accept-invite"
                  name="Accept Invite"
                  element={<AcceptInvite />}
                />
                <Route
                  exact
                  path="/404"
                  name="Page 404"
                  element={<Page404 />}
                />
                <Route
                  exact
                  path="/500"
                  name="Page 500"
                  element={<Page500 />}
                />
                <Route
                  path="*"
                  name="Home"
                  element={
                    <ProtectedRoute>
                      <DefaultLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
            <ToastContainer
              position="bottom-right"
              theme="light"
              toastClassName="!text-sm !rounded-lg"
            />
          </HashRouter>
        </SidebarProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
