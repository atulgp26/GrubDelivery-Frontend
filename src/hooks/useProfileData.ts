"use client";

import type { ProfileData } from "@/types";

interface UseProfileDataResult {
  userData: ProfileData;
  loading: boolean;
}

import { useAccount } from "@/components/features/account/hooks/useAccount";

function getInitials(name: string): string {
  if (!name) return "GU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "GU";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function useProfileData(): UseProfileDataResult {
  const { userData, isLoading } = useAccount();

  const profileData: ProfileData = {
    name: userData?.name || "Guest User",
    initials: getInitials(userData?.name || ""),
  };

  return {
    userData: profileData,
    loading: isLoading,
  };
}

