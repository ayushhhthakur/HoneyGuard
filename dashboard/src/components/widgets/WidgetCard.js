import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * The one card shell every dashboard widget is built from — a plain shadcn
 * Card, small header (icon + uppercase label), no decorative glow/blur.
 * Consistency comes from every widget sharing this, not from ornamentation.
 */
export const WidgetCard = ({
  title,
  icon: Icon,
  actions,
  children,
  className = "",
  bodyClassName = "",
}) => (
  <Card className={cn("flex h-full flex-col", className)}>
    {(title || Icon || actions) && (
      <CardHeader className="flex-row items-center justify-between space-y-0 py-2.5">
        <CardTitle className="flex items-center gap-1.5 normal-case tracking-normal text-foreground/80">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          {title}
        </CardTitle>
        {actions}
      </CardHeader>
    )}
    <CardContent className={cn("flex-1 p-3.5", bodyClassName)}>
      {children}
    </CardContent>
  </Card>
);

WidgetCard.propTypes = {
  title: PropTypes.node,
  icon: PropTypes.elementType,
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
};

export default WidgetCard;
