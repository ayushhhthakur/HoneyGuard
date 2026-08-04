import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Page404 = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
    <span className="text-4xl font-bold text-foreground">404</span>
    <h1 className="text-base font-semibold">Page not found</h1>
    <p className="max-w-sm text-xs text-muted-foreground">
      The page you&apos;re looking for doesn&apos;t exist or has moved.
    </p>
    <Button asChild size="sm" className="mt-2">
      <Link to="/dashboard">Back to dashboard</Link>
    </Button>
  </div>
);

export default Page404;
