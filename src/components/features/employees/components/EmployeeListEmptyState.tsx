import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import FigIcon from "@/components/ui/FigIcon";

interface EmployeeListEmptyStateProps {
  onAddEmployee: () => void;
  onBulkUpload?: () => void;
  topRight?: ReactNode;
}

export default function EmployeeListEmptyState({
  onAddEmployee,
  onBulkUpload,
  topRight = (
    <Button variant="primary"
      appearance="ghost"
      state="press" className="hover:underline">
      KNOW MORE
    </Button>
  ),
}: EmployeeListEmptyStateProps) {
  return (
    <div className="bg-white flex flex-col gap-6 px-6 py-6 relative h-full">
      {/* Section title */}
      <div className="flex gap-4 items-start relative shrink-0 w-full -mt-8">
        <div className="flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative">
          <div className="flex flex-col font-semibold h-10 justify-center relative shrink-0 text-[#03130a] text-2xl w-full">
            <p className="leading-8">Employees</p>
          </div>
        </div>
        <div className="flex gap-4 items-center relative shrink-0">
          {topRight && <div className="shrink-0">{topRight}</div>}
        </div>
      </div>

      {/* Centered empty state */}
      <div className="flex flex-1 flex-col gap-6 items-center justify-center relative mt-18 w-full">
        {/* Illustration placeholder */}
        <div className="bg-[#ffd9cc] w-80 h-80 shrink-0" />

        {/* Text */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h3
            className="font-semibold text-[#03130a]"
            style={{ fontSize: "18px", lineHeight: "28px", fontFamily: "Inter" }}
          >
            No employees added yet
          </h3>
          <p
            className="font-normal text-[#37493f]"
            style={{ fontSize: "16px", lineHeight: "24px", fontFamily: "Inter" }}
          >
            Start by adding managers/drivers to your team.
            <br />
            Once added, they can start accessing and managing your GrubPacs.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 items-center">
          <Button
            variant="primary"
            appearance="solid"
            state="press"
            onClick={onAddEmployee}
            className="flex gap-3 h-10 items-center justify-center px-4 py-2 rounded-lg"
          >
            <FigIcon name="Restaurants/plus" size={20} />
            <span
              className="font-medium text-white uppercase"
              style={{ fontSize: "16px", lineHeight: "20px", fontFamily: "Inter" }}
            >
              ADD EMPLOYEE
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

