import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import FigIcon from "@/components/ui/FigIcon";

type EmptyStateType = "no-restaurants" | "all-boxes-assigned";

interface RestaurantListEmptyStateProps {
  onAddRestaurant: () => void;
  topRight?: ReactNode;
  emptyStateType?: EmptyStateType;
}

export default function RestaurantListEmptyState({
  onAddRestaurant,
  topRight,
  emptyStateType = "no-restaurants",
}: RestaurantListEmptyStateProps) {
  const renderDefaultEmptyState = () => (
    <div className="bg-white flex flex-col gap-6 px-6 py-6 relative h-full">
      {/* Section title header */}
      <div className="flex gap-4 items-start relative shrink-0 w-full -mt-8">
        <div className="flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative">
          <div className="flex flex-col font-semibold h-10 justify-center relative shrink-0 text-[#03130a] text-2xl w-full">
            <p className="leading-8">Restaurants</p>
          </div>
        </div>
        <div className="flex gap-4 items-center relative shrink-0">
          {topRight && <div className="shrink-0">{topRight}</div>}
        </div>
      </div>

      {/* Centered empty state content */}
      <div className="flex flex-1 flex-col gap-6 items-center justify-center relative mt-18 w-full">
        {/* Icon placeholder - 320px square */}
        <div className="bg-[#ffd9cc] w-80 h-80 shrink-0" />
        
        {/* Text content */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h3 
            className="font-semibold text-[#03130a]"
            style={{ fontSize: '18px', lineHeight: '28px', fontFamily: 'Inter' }}
          >
            Your business operates in multiple locations?
          </h3>
          <p
            className="font-normal text-[#37493f]"
            style={{ fontSize: '16px', lineHeight: '24px', fontFamily: 'Inter' }}
          >
            Add your restaurants to start managing your Grubpacs efficiently.
          </p>
        </div>

        {/* Action button */}
        <Button
          variant="primary"
          appearance="solid"
          state="press"
          onClick={onAddRestaurant}
          className="flex gap-3 h-10 items-center justify-center px-4 py-2 rounded-lg"
        >
          <FigIcon name="Restaurants/plus" size={20} />
          <span 
            className="font-medium text-white uppercase"
            style={{ fontSize: '16px', lineHeight: '20px', fontFamily: 'Inter' }}
          >
            ADD RESTAURANT
          </span>
        </Button>
      </div>
    </div>
  );

  const renderFigmaEmptyState = () => (
    <div className="bg-white flex flex-col">
      {/* Search bar */}
      <div className="p-6 pb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search restaurant"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            disabled
          />
          <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-600">200 entries</span>
          <button className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded">
            <span>FILTER</span>
          </button>
        </div>
      </div>

      {/* Collapsible sections */}
      <div className="px-6">
        {/* Restaurants with boxes section */}
        <div className="border border-gray-200 rounded-lg mb-4">
          <div className="flex items-center justify-between p-4 bg-gray-50">
            <span className="font-medium">Restaurants with boxes</span>
            <button className="text-gray-400">▲</button>
          </div>
          <div className="p-4 text-center text-gray-600">
            {emptyStateType === "all-boxes-assigned" 
              ? "All restaurants have assigned boxes." 
              : "Assign boxes to your restaurants to see the list here."}
          </div>
        </div>

        {/* Restaurants without boxes section */}
        <div className="border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between p-4 bg-gray-50">
            <span className="font-medium">Restaurants without boxes</span>
            <button className="text-gray-400">▼</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (emptyStateType === "no-restaurants") {
    return renderDefaultEmptyState();
  }

  return renderFigmaEmptyState();
}

