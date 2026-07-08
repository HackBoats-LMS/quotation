"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50" 
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      <LogOut size={18} className="mr-2" />
      Sign out
    </Button>
  );
}
