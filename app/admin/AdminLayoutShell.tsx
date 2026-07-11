"use client";

import { ReactNode } from "react";

type AdminLayoutShellProps = {
  children: ReactNode;
};

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const preventGlobalDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden"
      onDragOver={preventGlobalDrop}
      onDrop={preventGlobalDrop}
    >
      {children}
    </div>
  );
}
