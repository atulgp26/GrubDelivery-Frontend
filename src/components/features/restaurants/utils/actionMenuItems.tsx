import { FiEdit3, FiRefreshCw, FiXCircle, FiTrash2 } from "react-icons/fi";
import type { ActionsMenuItem } from "@/components/ui/ActionsMenu";
import type { Restaurant } from "@/types/domain/restaurants";

interface CreateActionMenuItemsParams {
  restaurant: Restaurant;
  onEdit?: (restaurant: Restaurant) => void;
  onDelete?: (restaurant: Restaurant) => void;
  onRowClick: (restaurant: Restaurant) => void;
  onReassignResources?: (restaurant: Restaurant) => void;
  onSuspendRestaurant?: (restaurant: Restaurant) => void;
  isWithoutBoxesGroup?: boolean;
}

export const createActionMenuItems = ({
  restaurant,
  onEdit,
  onDelete,
  onRowClick,
  onReassignResources,
  onSuspendRestaurant,
  isWithoutBoxesGroup = false,
}: CreateActionMenuItemsParams): ActionsMenuItem[] => {
  const menuItems: ActionsMenuItem[] = [];

  if (isWithoutBoxesGroup) {
    menuItems.push(
      {
        label: "Edit details",
        icon: <FiEdit3 className="w-5 h-5" />,
        onClick: () => {
          if (onEdit) {
            onEdit(restaurant);
          } else {
            onRowClick(restaurant);
          }
        },
      },
      {
        label: "Suspend restaurant",
        icon: <FiXCircle className="w-5 h-5" />,
        onClick: () => {
          if (onSuspendRestaurant) {
            onSuspendRestaurant(restaurant);
          }
        },
      },
      {
        label: "Delete restaurant",
        icon: <FiTrash2 className="w-5 h-5" />,
        onClick: () => {
          if (onDelete) {
            onDelete(restaurant);
          }
        },
      }
    );
  } else {
    menuItems.push(
      {
        label: "Edit details",
        icon: <FiEdit3 className="w-5 h-5" />,
        onClick: () => {
          if (onEdit) {
            onEdit(restaurant);
          } else {
            onRowClick(restaurant);
          }
        },
      }
    );

    // Only show Reassign resources if restaurant has boxes or drivers
    if (restaurant.boxes > 0 || restaurant.drivers > 0) {
      menuItems.push({
        label: "Reassign resources",
        icon: <FiRefreshCw className="w-5 h-5" />,
        onClick: () => {
          if (onReassignResources) {
            onReassignResources(restaurant);
          }
        },
      });
    }

    menuItems.push(
      {
        label: "Suspend restaurant",
        icon: <FiXCircle className="w-5 h-5" />,
        onClick: () => {
          if (onSuspendRestaurant) {
            onSuspendRestaurant(restaurant);
          }
        },
      },
      {
        label: "Delete restaurant",
        icon: <FiTrash2 className="w-5 h-5" />,
        onClick: () => {
          if (onDelete) {
            onDelete(restaurant);
          }
        },
      }
    );
  }

  return menuItems;
};

