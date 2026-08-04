import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/contexts/NotificationContext";

export const NotificationDropdown = () => {
  const { notifications } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.alerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {notifications.alerts}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          {notifications.alerts} open alert
          {notifications.alerts === 1 ? "" : "s"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.recent.length === 0 ? (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            Nothing to see here.
          </div>
        ) : (
          notifications.recent.map((a) => (
            <DropdownMenuItem key={a.id} asChild>
              <a href="#/alerts" className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-medium">{a.message}</span>
              </a>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href="#/alerts"
            className="justify-center text-xs font-medium text-primary"
          >
            View all alerts
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
