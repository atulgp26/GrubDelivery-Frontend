import type { ReactNode } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

interface DashboardRoutesLayoutProps {
  children: ReactNode;
}

export default function DashboardRoutesLayout({ children }: DashboardRoutesLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

