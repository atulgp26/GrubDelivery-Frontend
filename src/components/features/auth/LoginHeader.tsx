"use client";

import { Button } from "@/components/ui/Button";
import FigIcon from "@/components/ui/FigIcon";

function LogoMark() {
  return (
    <div className="relative rounded-[100px] size-[56px]">
      <div className="absolute inset-[10.71%]">
        <FigIcon name="logomark" size={64} />
      </div>
    </div>
  );
}

export default function LoginHeader() {
  return (
    <div className="bg-[var(--gp-color-bg-white)] border-b border-[var(--gp-color-border-neutral)] content-stretch flex h-[64px] items-center justify-between px-[var(--gp-padding-xl)] py-[var(--gp-padding-m)] relative w-full z-[2] max-w-[1486px] mx-auto">
      <LogoMark />
      <Button variant="neutral" appearance="outlined" size="default" state="press">
        <span>Visit Website</span>
      </Button>
    </div>
  );
}
