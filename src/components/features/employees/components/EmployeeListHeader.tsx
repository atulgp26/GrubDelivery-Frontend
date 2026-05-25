import ResourceListHeader from "@/components/ui/ResourceListHeader";

interface EmployeeListHeaderProps {
  onAddNew: () => void;
  onViewSuspended?: () => void;
}

export default function EmployeeListHeader({
  onAddNew,
  onViewSuspended,
}: EmployeeListHeaderProps) {
  return (
    <ResourceListHeader
      title="Employees"
      titleClassName="text-[24px]"
      onAddNew={onAddNew}
      onViewSuspended={onViewSuspended}
    />
  );
}

