import { Suspense } from "react";
import RestaurantListScreen from "@/components/features/restaurants/RestaurantListScreen";

export default function RestaurantListPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gp-color-brand-primary)]"></div>
      </div>
    }>
      <RestaurantListScreen />
    </Suspense>
  );
}