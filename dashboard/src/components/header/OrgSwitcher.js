import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export const OrgSwitcher = () => {
  const { organizations, activeOrg, switchOrg } = useAuth();
  const navigate = useNavigate();

  if (!activeOrg) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[180px] justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{activeOrg.name}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrg(org.id)}
            className="justify-between"
          >
            <span className="flex items-center gap-2 truncate">
              {org.id === activeOrg.id && (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
              <span className={org.id === activeOrg.id ? "font-medium" : ""}>
                {org.name}
              </span>
            </span>
            <Badge variant={ROLE_VARIANT[org.role]}>{org.role}</Badge>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/create-org")}>
          <Plus className="h-3.5 w-3.5" />
          New organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrgSwitcher;
