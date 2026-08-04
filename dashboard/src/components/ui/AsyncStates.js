import React from "react";
import PropTypes from "prop-types";
import { Inbox, AlertTriangle } from "lucide-react";
import { SkeletonRows } from "@/components/widgets/Skeleton";

export const LoadingBlock = ({ label, rows = 4 }) => (
  <div className="py-2">
    <SkeletonRows rows={rows} />
    {label && (
      <div className="mt-3 text-center text-xs text-muted-foreground">
        {label}
      </div>
    )}
  </div>
);
LoadingBlock.propTypes = { label: PropTypes.string, rows: PropTypes.number };

/** Polished empty state: icon chip + message + optional call to action,
 * used everywhere a list/table has no data yet. */
export const EmptyState = ({ children, icon: Icon = Inbox, action }) => (
  <div className="flex flex-col items-center justify-center px-3 py-10 text-center animate-in fade-in-0">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
      <Icon className="h-4.5 w-4.5" />
    </div>
    <div className="max-w-[280px] text-xs text-muted-foreground">
      {children}
    </div>
    {action && <div className="mt-3">{action}</div>}
  </div>
);
EmptyState.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType,
  action: PropTypes.node,
};

export const ErrorState = ({ message }) => (
  <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive">
    <AlertTriangle className="h-4 w-4 shrink-0" />
    <span className="text-xs">{message}</span>
  </div>
);
ErrorState.propTypes = { message: PropTypes.node.isRequired };

/** Renders loading / error / empty / content in one consistent order, so
 * pages built on useAsync() don't each re-derive this if/else chain. */
export const AsyncBoundary = ({
  loading,
  error,
  isEmpty,
  emptyMessage,
  loadingLabel,
  children,
}) => {
  if (loading) return <LoadingBlock label={loadingLabel} />;
  if (error) return <ErrorState message={error} />;
  if (isEmpty) return <EmptyState>{emptyMessage}</EmptyState>;
  return children;
};
AsyncBoundary.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.node,
  isEmpty: PropTypes.bool,
  emptyMessage: PropTypes.node,
  loadingLabel: PropTypes.string,
  children: PropTypes.node,
};

export default { LoadingBlock, EmptyState, ErrorState, AsyncBoundary };
