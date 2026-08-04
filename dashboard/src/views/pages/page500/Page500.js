import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Page500 = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
    <span className="text-4xl font-bold text-foreground">500</span>
    <h1 className="text-base font-semibold">Something went wrong</h1>
    <p className="max-w-sm text-xs text-muted-foreground">
      This page is temporarily unavailable. Try again in a moment.
    </p>
    <Button asChild size="sm" className="mt-2">
      <Link to="/dashboard">Back to dashboard</Link>
    </Button>
  </div>
);

export default Page500;
