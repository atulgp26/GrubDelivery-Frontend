"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import RestaurantListContent from "@/components/features/restaurants/RestaurantListContent";
import AddRestaurantModal, { type RestaurantFormData } from "@/components/features/restaurants/modals/AddRestaurantModal";
import { useRestaurantGroups } from "@/hooks/useRestaurantGroups";
import type { Restaurant, RestaurantRequest } from "@/types/domain/restaurants";
import type { RestaurantData } from "@/types/domain/restaurants";
import foodService from "@/services/food";
import { showError, showSuccess } from "@/components/ui/toast";
import { Button } from "@/components/ui/Button";
import type { ResourceFilterType } from "@/components/features/restaurants/modals/RestaurantFilterModal";

export default function RestaurantListScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const editId = searchParams.get("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResources, setSelectedResources] = useState<ResourceFilterType[]>([]);
  const { groups, reload, totalEntries, isLoading, isPageLoading, isDebouncing, isInitialized, refetchGroup } = useRestaurantGroups({ 
    status: "active",
    searchTerm,
    manager: selectedResources.includes("manager") ? true : undefined,
    driver: selectedResources.includes("driver") ? true : undefined,
    boxFilter: selectedResources.includes("box") ? true : undefined,
    groupByBoxes: true
  });

  const isTableLoading = !isInitialized || (isLoading && searchTerm.trim().length === 0);

  const handleRefresh = async () => {
    await reload();
  };

  const editingRestaurant = useMemo(() => {
    if (!editId) return null;
    for (const group of groups) {
      const found = group.items?.find((item) => item.id === editId);
      if (found) return found;
    }
    return null;
  }, [editId, groups]);

  const isAddModalOpen = action === "add" || !!editingRestaurant;

  const handleAddRestaurant = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("action", "add");
    newParams.delete("edit");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("edit", restaurant.id);
    newParams.delete("action");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleViewSuspended = () => {
    router.push("/restaurants/suspended");
  };

  const handleSubmit = async (data: RestaurantFormData) => {

    setIsSubmitting(true);
    try {
      const payload: RestaurantRequest = {
        id: editingRestaurant?.id,
        name: data.name,
        state: data.state || "",
        city: data.city || "",
        pincode: data.pincode || "",
        line_one: data.line1 || "",
        line_two: data.line2 || "",
        // line_two: data.line2?.trim() || null,
        latitude: data.latitude?.trim() || undefined,
        longitude: data.longitude?.trim() || undefined,
        status: data.status,
        google_place_id: data.google_place_id?.trim() || undefined,
      };

      let response;
      if (editingRestaurant) {
        response = await foodService.updateRestaurant(payload);
      } else {
        response = await foodService.addRestaurant(payload);
      }

      if (!response.success) {
        throw new Error(response.error || response.message || "Failed to save restaurant details");
      }

      if (editingRestaurant) {
        showSuccess(
          `${data.name} updated successfully!`,
          "Your restaurant details have been saved.",
          false
        );
      } else {
        showSuccess(
          `${data.name} created successfully!`,
          "You can now assign GrubPacs to this restaurant to get started.",
          false,
          "/grubpacs/list?expandGroup=unassigned",
          "VIEW GRUBPACS"
        );
      }

      await handleRefresh();
      handleCloseModal();
    } catch (error: any) {
      showError(
        error?.message || `Failed to ${editingRestaurant ? "update" : "add"} restaurant`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("action");
    newParams.delete("edit");
    router.push(`${pathname}${newParams.toString() ? "?" + newParams.toString() : ""}`);
  };

  return (
    <div className="space-y-6 ml-4">
      <RestaurantListContent
        groups={groups}
        onAddRestaurant={handleAddRestaurant}
        onEditRestaurant={handleEditRestaurant}
        onViewSuspended={handleViewSuspended}
        forceListLayout
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalEntries={totalEntries}
        isLoading={isTableLoading}
        isPageLoading={isPageLoading}
        onRefresh={handleRefresh}
        selectedResources={selectedResources}
        onFilterChange={setSelectedResources}
        onPageChange={refetchGroup}
      />

      <AddRestaurantModal
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        restaurant={editingRestaurant}
        loading={isSubmitting}
      />
    </div>
  );
}

