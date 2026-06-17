"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import RestaurantListContent from "@/components/features/restaurants/RestaurantListContent";
import AddRestaurantModal, { type RestaurantFormData } from "@/components/features/restaurants/modals/AddRestaurantModal";
import { useRestaurantGroups } from "@/hooks/useRestaurantGroups";
import { Button } from "@/components/ui/Button";

import type { Restaurant, RestaurantRequest } from "@/types/domain/restaurants";
import foodService from "@/services/food";
import { showError, showSuccess } from "@/components/ui/toast";

function RestaurantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const action = searchParams.get("action");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSuspendedRestaurants, setHasSuspendedRestaurants] = useState(false);
  const [isSuspendedCheckComplete, setIsSuspendedCheckComplete] = useState(false);
  const { groups, totalEntries, reload, isInitialized } = useRestaurantGroups({ 
    limit: 1, 
    status: "active",
    groupByBoxes: false,
  });

  const isAddModalOpen = action === "add";

  const handleRefresh = async () => {
    await reload();
  };

  const hasRestaurants = totalEntries > 0;
  const hasAnyRestaurants = hasRestaurants || hasSuspendedRestaurants;

  useEffect(() => {
    let mounted = true;

    const checkSuspendedRestaurants = async () => {
      try {
        const response = await foodService.getRestaurants({
          status: "suspended",
          limit: 1,
          page: 1,
        });

        if (!mounted) return;

        if (response.success) {
          const totalCount =
            ((response.pagination as { total_count?: number } | undefined)?.total_count)
            ?? (response.data as { total_count?: number } | undefined)?.total_count
            ?? response.data?.count
            ?? response.data?.restaurants?.length
            ?? 0;

          setHasSuspendedRestaurants(totalCount > 0);
        } else {
          setHasSuspendedRestaurants(false);
        }
      } catch {
        if (!mounted) return;
        setHasSuspendedRestaurants(false);
      } finally {
        if (mounted) {
          setIsSuspendedCheckComplete(true);
        }
      }
    };

    void checkSuspendedRestaurants();

    return () => {
      mounted = false;
    };
  }, []);

  const getEmptyStateType = useMemo((): "no-restaurants" | "all-boxes-assigned" => {
    if (!hasRestaurants) {
      return "no-restaurants";
    }

    const withBoxes = groups.find(g => g.name === "Restaurants with boxes")?.items?.length ?? 0;
    const withoutBoxes = groups.find(g => g.name === "Restaurants without boxes")?.items?.length ?? 0;

    // If all restaurants have boxes and none are without boxes
    if (withBoxes > 0 && withoutBoxes === 0) {
      return "all-boxes-assigned";
    }

    // Default to no-restaurants for other cases or when there are restaurants without boxes
    return "no-restaurants";
  }, [hasRestaurants, groups]);

  useEffect(() => {
    if (isInitialized && isSuspendedCheckComplete && hasAnyRestaurants) {
      router.replace("/restaurants/list");
    }
  }, [hasAnyRestaurants, isInitialized, isSuspendedCheckComplete, router]);

  const handleAddRestaurant = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("action", "add");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleCloseModal = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("action");
    router.push(`${pathname}${newParams.toString() ? "?" + newParams.toString() : ""}`);
  };

  const handleSubmit = async (data: RestaurantFormData) => {
    setIsSubmitting(true);
    try {
      const payload: RestaurantRequest = {
        name: data.name,
        state: data.state || "",
        city: data.city || "",
        pincode: data.pincode || "",
        line_one: data.line1 || "",
        // line_two: data.line2 || "",
        line_two: data.line2?.trim() || undefined,
        latitude: data.latitude?.trim() || undefined,
        longitude: data.longitude?.trim() || undefined,
        status: data.status,
        google_place_id: data.google_place_id?.trim() || "",
      };

      const response = await foodService.addRestaurant(payload);

      if (!response.success) {
        throw new Error(response.error || response.message || "Failed to save restaurant details");
      }

      showSuccess(
        `${data.name} created successfully!`,
        "You can now assign GrubPacs to this restaurant to get started.",
        false,
        "/grubpacs/list?grouped=true&expandGroup=unassigned",
        "VIEW GRUBPACS"
      );

      await handleRefresh();
      router.replace("/restaurants/list");
    } catch (error: any) {
      showError(`Failed to add restaurant: ${error?.message || "Something went wrong"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isInitialized || !isSuspendedCheckComplete) {
    return null;
  }

  if (hasAnyRestaurants) {
    return null;
  }

  return (
    <div className="">
      <RestaurantListContent
        groups={groups}
        onAddRestaurant={handleAddRestaurant}
        emptyStateTopRight={
          <Button
            variant="primary"
            appearance="ghost"
            state="press"
            onClick={() => {
              router.push("/restaurants/list");
            }}
            className="text-[var(--gp-color-brand-primary)] font-medium uppercase"
          >
            <span>KNOW MORE</span>
          </Button>
        }
        emptyStateType={getEmptyStateType}
        onRefresh={handleRefresh}
      />

      <AddRestaurantModal
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={null}>
      <RestaurantsContent />
    </Suspense>
  );
}