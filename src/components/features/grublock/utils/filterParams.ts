import type { FilterState } from "@/components/features/shared/filter/BoxFilterModal";
import type { GrubLockListParams } from "@/types/domain/grublock";

export function mapGrubLockFiltersToApiParams(filters: FilterState): GrubLockListParams {
  const params: GrubLockListParams = {};

  const connection = filters.connection ?? [];
  if (connection.length === 1) {
    const value = connection[0];
    if (value === "Connected") params.connection_status = "connected";
    if (value === "Disconnected") params.connection_status = "disconnected";
  }

  const health = filters.health ?? [];
  if (health.length === 1) {
    const value = health[0];
    if (value === "Critical") params.health_status = "critical";
    if (value === "Healthy") params.health_status = "healthy";
    if (value === "Needs attention") params.health_status = "atension";
  }

  const grubLockStatus = filters.grubLockStatus ?? [];
  if (grubLockStatus.length === 1) {
    const value = grubLockStatus[0];
    if (value === "Locked") params.grublock_status = "locked";
    if (value === "Unlocked") params.grublock_status = "unlocked";
    if (value === "No lock available") params.grublock_status = "not_available";
  }

  if (filters.restaurantAssigned) params.restaurant_assigned = "on";
  if (filters.vehicleAssigned) params.vehicle_assigned = "on";
  if (filters.ioniserOn) params.ioniser_status = "on";
  if (filters.dualZoneOn) params.dual_zone_status = "on";

  if (filters.zone1Min !== -20) params.zone1_min = filters.zone1Min;
  if (filters.zone1Max !== 30) params.zone1_max = filters.zone1Max;
  if (filters.zone2Min !== -20) params.zone2_min = filters.zone2Min;
  if (filters.zone2Max !== 30) params.zone2_max = filters.zone2Max;

  return params;
}
