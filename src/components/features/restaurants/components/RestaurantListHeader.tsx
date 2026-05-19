import ResourceListHeader from "@/components/ui/ResourceListHeader";

interface RestaurantListHeaderProps {
  onAddNew: () => void;
  onViewSuspended?: () => void;
}

export default function RestaurantListHeader({
  onAddNew,
  onViewSuspended,
}: RestaurantListHeaderProps) {
  return (
    <ResourceListHeader
      title="Restaurants"
      onAddNew={onAddNew}
      onViewSuspended={onViewSuspended}
    />
  );
}

