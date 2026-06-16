"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors group"
    >
      <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span>Logout</span>
    </button>
  );
}
