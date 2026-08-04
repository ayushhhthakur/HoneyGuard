import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/contexts/SidebarContext";
import getNav from "@/_nav";

const Brand = () => (
  <div className="flex h-14 items-center gap-2 border-b border-border px-4">
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
      <Shield className="h-4 w-4" />
    </span>
    <span className="text-sm font-semibold tracking-tight">
      Honey<span className="text-primary">Guard</span>
    </span>
  </div>
);

const NavItems = ({ onNavigate }) => {
  const nav = getNav();
  return (
    <nav className="flex flex-col gap-4 px-2 py-3">
      {nav.map((group, i) => (
        <div key={group.section || `group-${i}`}>
          {group.section && (
            <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.section}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
};

NavItems.propTypes = {
  onNavigate: PropTypes.func,
};

export const Sidebar = () => {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-white lg:flex">
        <Brand />
        <ScrollArea className="flex-1">
          <NavItems />
        </ScrollArea>
      </aside>

      {/* Mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Brand />
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <NavItems onNavigate={() => setMobileOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
