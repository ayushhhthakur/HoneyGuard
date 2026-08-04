import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import routes from "@/routes";

const PageFallback = () => (
  <div className="space-y-3 p-6">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

export const DefaultLayout = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      {/* Content is offset by the fixed sidebar's width on large screens —
          this is the "segregation" between nav and content: distinct
          backgrounds, a hard border, independent scroll regions. */}
      <div className="flex min-h-screen flex-col lg:pl-56">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {routes.map(
                (route) =>
                  route.element && (
                    <Route
                      key={route.path}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      element={<route.element />}
                    />
                  ),
              )}
              <Route path="/" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
