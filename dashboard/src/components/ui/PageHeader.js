import React from "react";
import PropTypes from "prop-types";

/** Consistent title + subtitle + trailing-action row, used at the top of
 * every page instead of each page hand-rolling its own header markup. */
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
};

export default PageHeader;
