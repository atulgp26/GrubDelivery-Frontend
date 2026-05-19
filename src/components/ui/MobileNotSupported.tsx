"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import type { MobileNotSupportedProps } from "@/types";

const MobileNotSupported = ({
  title = "Mobile Not Supported",
  description = "This application is designed for desktop and laptop computers. Please access it from a laptop or desktop device for the best experience.",
  illustration,
}: MobileNotSupportedProps) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();

      const phoneRegex = /iphone|ipod|android.*mobile|webos|blackberry|iemobile|opera mini/i;
      const isPhoneUA = phoneRegex.test(ua);
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isPhoneUA && isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--color-neutral-primary)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-neutral-secondary-bg)] flex items-center justify-center">
            {illustration ?? (
              <Icon
                name="computer_access"
                className="w-10 h-10 text-[var(--color-stroke-brand)]"
              />
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            {title}
          </h1>
          <p className="text-base text-[var(--color-stroke-brand)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileNotSupported;

