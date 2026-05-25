"use client";

// import WelcomeBox from "@/components/features/dashboard/WelcomeBox";
import InfoPanel from "@/components/ui/InfoPanel";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useProfileData } from "@/hooks/useProfileData";
import WelcomeBox from "@/components/features/dashboard/WelcomeBox";

export default function DashboardPage() {
  const { userData, loading } = useProfileData();
  const displayName = userData?.name?.trim();
  const greeting = loading
    ? "Good morning!"
    : `Good morning ${displayName || "Guest User"}!`;

  return (
    <>
      <InfoPanel
        title="Dashboard"
        name={greeting}
        description="Ready to start your day? Head over to boxes section to check your GrubPacs."
        className="ml-2"
      >
        <Button asChild variant="primary" appearance="solid" state="press" size="md" className="w-[177px] h-[40px] hover:underline">
          <Link href="/grubpacs">
            CHECK BOXES <Image src="/arrow-up-right.svg" alt="arrow" width={20} height={20} className="inline-block ml-1" />
          </Link>
        </Button>
      </InfoPanel>
      <WelcomeBox />
    </>
  );
}

