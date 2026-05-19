import BoxFilterModal from "@/components/features/shared/filter/BoxFilterModal";

export type { FilterState } from "@/components/features/shared/filter/BoxFilterModal";

export default function GrubLockFilterModal(
	props: React.ComponentProps<typeof BoxFilterModal>,
) {
	return <BoxFilterModal {...props} showPowerStatus={false} />;
}
