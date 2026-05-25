import { Suspense } from "react";
import BoxDetails from "@/components/features/grublock/BoxDetails";

export default function GrubLockDetailsPage() {
  return (
    <Suspense fallback={<div>Loading details...</div>}>
      <BoxDetails />
    </Suspense>
  );
}

