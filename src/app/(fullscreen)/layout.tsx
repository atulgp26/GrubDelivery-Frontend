import type { ReactNode } from "react";

export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-app-bg)]">
      {children}
    </div>
  );
}
