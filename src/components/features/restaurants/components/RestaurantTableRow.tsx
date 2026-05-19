"use client";

import { TableCell, TableRow } from "@/components/ui/Table";
import TableCheckbox from "@/components/ui/TableCheckbox";
import BoxCountBadge from "@/components/ui/BoxCountBadge";
import CustomTooltip from "@/components/ui/CustomTooltip";
import ActionsMenu, { type ActionsMenuItem } from "@/components/ui/ActionsMenu";
import { getResourceTooltipContent, getManagerTooltipContent } from "../utils/tooltipContent";
import { getManagerButtonStyles } from "../utils/managerButtonStyles";
import { createActionMenuItems } from "../utils/actionMenuItems";
import type { Restaurant } from "@/types/domain/restaurants";

interface RestaurantTableRowProps {
    restaurant: Restaurant;
    isSelected: boolean;
    onSelect: (id: string, selected: boolean) => void;
    onRowClick: (restaurant: Restaurant) => void;
    onEdit?: (restaurant: Restaurant) => void;
    onDelete?: (restaurant: Restaurant) => void;
    onAssignManager: (restaurant: Restaurant) => void;
    onSuspendRestaurant?: (restaurant: Restaurant) => void;
    onReassignResources?: (restaurant: Restaurant) => void;
    isWithoutBoxesGroup?: boolean;
}

export default function RestaurantTableRow({
    restaurant,
    isSelected,
    onSelect,
    onRowClick,
    onEdit,
    onDelete,
    onAssignManager,
    onSuspendRestaurant,
    onReassignResources,
    isWithoutBoxesGroup = false,
}: RestaurantTableRowProps) {
    const hasManager = Boolean(restaurant.manager);
    const managerName = restaurant.manager || "No manager";

    const actionsMenuItems = createActionMenuItems({
        restaurant,
        onEdit,
        onDelete,
        onRowClick,
        onSuspendRestaurant,
        onReassignResources,
        isWithoutBoxesGroup,
    });

    return (
        <TableRow
            key={restaurant.id}
            className="cursor-pointer"
            onClick={() => onRowClick(restaurant)}
        >
            <TableCell className="px-6 py-4">
                <div onClick={(e) => e.stopPropagation()}>
                    <TableCheckbox
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onSelect(restaurant.id, e.target.checked);
                        }}
                    />
                </div>
            </TableCell>
            <TableCell className="px-6 py-4 text-base font-semibold text-[var(--color-neutral-secondary)]">
                {restaurant.name}
            </TableCell>
            <TableCell className="px-6 py-4 text-base font-normal text-[var(--color-neutral-secondary)]">
                {restaurant.address}
            </TableCell>
            <TableCell className="px-6 py-4">
                <CustomTooltip
                    placement="bottom"
                    arrowPosition="left"
                    title={getManagerTooltipContent(hasManager)}
                    className={hasManager ? "min-w-[200px]" : ""}
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!hasManager) {
                                onAssignManager(restaurant);
                            }
                        }}
                        className={getManagerButtonStyles(hasManager)}
                    >
                        {managerName}
                    </button>
                </CustomTooltip>
            </TableCell>
            <TableCell className="px-6 py-4">
                <CustomTooltip
                    placement="bottom"
                    arrowPosition="left"
                    title={getResourceTooltipContent(restaurant.drivers, "drivers")}
                >
                    <BoxCountBadge
                        count={restaurant.drivers}
                        iconName="two_users"
                        className="!rounded-full"
                    />
                </CustomTooltip>
            </TableCell>
            <TableCell className="px-6 py-4">
                <CustomTooltip
                    placement="bottom"
                    arrowPosition="left"
                    title={getResourceTooltipContent(restaurant.boxes, "boxes")}
                >
                    <BoxCountBadge
                        count={restaurant.boxes}
                        iconName="box"
                        className="!rounded-full"
                    />
                </CustomTooltip>
            </TableCell>
            <TableCell className="px-6 py-4 text-base font-normal text-[var(--color-neutral-secondary)]">
                {restaurant.updated}
            </TableCell>
            <TableCell className="px-6 py-4">
                <ActionsMenu itemId={restaurant.id} items={actionsMenuItems} />
            </TableCell>
        </TableRow>
    );
}

