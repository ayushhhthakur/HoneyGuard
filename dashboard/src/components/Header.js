import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { OrgSwitcher } from "./header/OrgSwitcher";
import { NotificationDropdown } from "./header/NotificationDropdown";
import { UserMenu } from "./header/UserMenu";
import { Breadcrumb } from "./Breadcrumb";

export const Header = () => {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-2.5 py-1 text-[11px] font-medium text-success md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Monitoring active
        </span>
        <OrgSwitcher />
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
