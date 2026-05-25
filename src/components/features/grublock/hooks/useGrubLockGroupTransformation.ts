import { useMemo } from "react";
import type { GrubLockBox, GrubLockGroup } from "@/types/domain/grublock";

interface UseGrubLockGroupTransformationProps {
  groups: GrubLockGroup[];
  isGrouped: boolean;
  showUnlockedBoxes: boolean;
}

export function useGrubLockGroupTransformation({
  groups,
  isGrouped,
  showUnlockedBoxes,
}: UseGrubLockGroupTransformationProps) {
  const allBoxes = useMemo(() => {
    return groups.flatMap((group) => group.items || []);
  }, [groups]);

  const transformedGroups = useMemo(() => {
    if (isGrouped) {
      if (showUnlockedBoxes) {
        return groups;
      }

      return groups
        .map((group) => ({
          ...group,
          items: (group.items ?? []).filter((box) => box.status === "locked"),
        }))
        .filter((group) => (group.items ?? []).length > 0);
    }

    const lockedGroup = groups.find((group) =>
      String(group.name).toLowerCase().includes("locked") &&
      !String(group.name).toLowerCase().includes("unlocked"),
    ) ?? {
      name: "Box locked",
      items: allBoxes.filter((box) => box.status === "locked"),
      emptyMessage: "Set GrubLock for your boxes to see the list here!",
    };

    const unlockedGroup = groups.find((group) =>
      String(group.name).toLowerCase().includes("unlocked"),
    ) ?? {
      name: "Box unlocked",
      items: allBoxes.filter((box) => box.status === "unlocked"),
      emptyMessage: "All boxes are locked! :)",
    };

    if (isGrouped && !showUnlockedBoxes) {
      return [lockedGroup];
    }

    return [lockedGroup, unlockedGroup];
  }, [isGrouped, allBoxes, showUnlockedBoxes, groups]);

  return { allBoxes, transformedGroups };
}

