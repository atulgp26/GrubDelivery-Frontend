"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "./sidebar";
import ToastProvider from "@/components/ui/ToastProvider";
import type { ClientLayoutProps } from "@/types";

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const pathname = usePathname();

  const toggleSidebar = (): void =>
    setSidebarCollapsed((prev) => !prev);
  const closeSidebar = (): void => setSidebarCollapsed(true);

  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <>
      <ToastProvider />
      <div 
        className="flex"
        style={{
          '--table-action-bar-left': sidebarCollapsed ? '1rem' : 'calc(240px + 1rem)'
        } as React.CSSProperties}
      >
        <Sidebar collapsed={sidebarCollapsed} onClose={closeSidebar} />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? "ml-0" : "ml-60"
          }`}
        >
          <Header
            onToggleSidebarAction={toggleSidebar}
            collapsed={sidebarCollapsed}
          />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
