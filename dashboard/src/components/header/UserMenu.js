import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_VARIANT = {
  owner: "warning",
  admin: "default",
  analyst: "success",
  viewer: "secondary",
};

const initialsOf = (text) =>
  (text || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const UserMenu = () => {
  const { profile, activeOrg, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {initialsOf(profile?.full_name || profile?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-xs font-medium text-foreground">
            {profile?.full_name || profile?.email}
          </span>
          <span className="flex items-center gap-2 text-[11px] font-normal text-muted-foreground">
            {activeOrg?.name}
            {role && <Badge variant={ROLE_VARIANT[role]}>{role}</Badge>}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="#/alerts">
            <Bell className="h-3.5 w-3.5" /> Alerts
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="#/team">
            <Users className="h-3.5 w-3.5" /> Team
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
