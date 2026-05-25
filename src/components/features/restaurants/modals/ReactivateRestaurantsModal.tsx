"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface ReactivateRestaurantsModalProps {
    open: boolean;
    onClose: () => void;
    onReassign: () => void;
    onActivateLater: () => void;
    restaurantNames: string[];
    totalBoxes: number;
    totalDrivers: number;
    totalManagers: number;
    isActivateAll?: boolean;
    loading?: boolean;
    totalCount?: number;
}

export default function ReactivateRestaurantsModal({
    open,
    onClose,
    onReassign,
    onActivateLater,
    restaurantNames,
    totalBoxes,
    totalDrivers,
    totalManagers,
    isActivateAll = false,
    loading = false,
    totalCount = 0,
}: ReactivateRestaurantsModalProps) {
    const [clickedAction, setClickedAction] = useState<"reassign" | "later" | null>(null);

    useEffect(() => {
        if (!open) {
            setClickedAction(null);
        }
    }, [open]);

    const handleReassign = () => {
        setClickedAction("reassign");
        onReassign();
    };

    const handleLater = () => {
        setClickedAction("later");
        onActivateLater();
    };

    const truncateName = (name: string) => name.length > 25 ? `${name.substring(0, 25)}...` : name;

    const getTitle = () => {
        const displayCount = isActivateAll ? totalCount : restaurantNames.length;
        if (displayCount === 0) return "Reactivate restaurants?";
        if (displayCount === 1) {
            return `Reactivate ${truncateName(restaurantNames[0] || "restaurant")}?`;
        }
        const firstRestaurant = truncateName(restaurantNames[0] || "Restaurant");
        const otherCount = displayCount - 1;
        return `Activate ${firstRestaurant} and ${otherCount} other${otherCount > 1 ? "s" : ""}?`;
    };

    const getResourceText = () => {
        const parts: string[] = [];
        if (totalBoxes > 0) {
            parts.push(`${totalBoxes} box${totalBoxes > 1 ? "es" : ""}`);
        }
        if (totalDrivers > 0) {
            parts.push(`${totalDrivers} driver${totalDrivers > 1 ? "s" : ""}`);
        }
        if (totalManagers > 0) {
            parts.push(`${totalManagers} manager${totalManagers > 1 ? "s" : ""}`);
        }

        if (parts.length === 0) {
            return "resources";
        }

        if (parts.length === 1) {
            return parts[0];
        }

        if (parts.length === 2) {
            return `${parts[0]} and ${parts[1]}`;
        }

        return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
    };

    const hasResources = (totalBoxes || 0) + (totalDrivers || 0) + (totalManagers || 0) > 0;

    const getActivateButtonText = () => {
        if (isActivateAll) {
            return `YES, ACTIVATE ALL ${totalCount} RESTAURANTS`;
        }
        if (restaurantNames.length === 1) {
            return `YES, ACTIVATE ${truncateName(restaurantNames[0]).toUpperCase()}`;
        }
        return `YES, ACTIVATE RESTAURANT ${restaurantNames.length}`;
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            width="w-[600px]"
            height="h-auto"
            closeOnOutsideClick={false}
            noXPadding={true}
        >
            <div className="flex flex-col px-[var(--gp-padding-xl,24px)] pb-[var(--gp-padding-xl,24px)] pt-2 relative">

                <div className="flex items-center justify-between text-center mx-auto">
                    <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] text-center">
                        {getTitle()}
                    </h2>
                </div>

                <div className="py-2">
                    {hasResources ? (
                        <p className="text-lg font-normal text-[var(--color-neutral-secondary)] leading-relaxed text-center">
                            {getResourceText()} previously assigned to the restaurant{isActivateAll || restaurantNames.length > 1 ? "s" : ""} are waiting as suspended.
                            <br />
                            Would you like to activate & reassign them to the same restaurant{isActivateAll || restaurantNames.length > 1 ? "s" : ""}?
                        </p>
                    ) : (
                        <p className="text-lg font-normal text-[var(--color-neutral-secondary)] leading-relaxed text-center">
                            The action will reactivate the restaurant{isActivateAll || restaurantNames.length > 1 ? "s" : ""} and {isActivateAll || restaurantNames.length > 1 ? "they" : "it"} will show up in your list.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    {hasResources ? (
                        <>
                            <Button
                                variant="primary"
                                state="press"
                                onClick={handleReassign}
                                disabled={loading}
                                className="w-full !text-lg h-[48px] font-medium"
                            >
                                <span>{loading && clickedAction === "reassign" ? "REASSIGNING..." : "YES, REASSIGN THEM"}</span>
                            </Button>
                            <Button
                                variant="primary"
                                appearance="outlined"
                                state="press"
                                onClick={handleLater}
                                disabled={loading}
                                className="w-full !text-lg border-[var(--color-brand-default)] h-[48px] font-medium"
                            >
                                <span>{loading && clickedAction === "later" ? "ACTIVATING..." : "NO, I'LL ACTIVATE THEM LATER"}</span>
                            </Button>
                            <Button
                                variant="neutral"
                                appearance="ghost"
                                onClick={onClose}
                                disabled={loading}
                                className="text-lg font-medium mx-auto cursor-pointer disabled:opacity-50"
                            >
                                <span>CANCEL</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="primary"
                                appearance="solid"
                                state="press"
                                onClick={handleReassign}
                                disabled={loading}
                                className="w-full !text-lg h-[48px] font-medium"
                            >
                                <span>{loading && clickedAction === "reassign" ? "ACTIVATING..." : getActivateButtonText()}</span>
                            </Button>
                            <Button
                                variant="neutral"
                                appearance="ghost"
                                onClick={onClose}
                                disabled={loading}
                                className="text-lg font-medium mx-auto cursor-pointer disabled:opacity-50"
                            >
                                <span>CANCEL</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}

