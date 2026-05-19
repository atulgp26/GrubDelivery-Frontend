import { Suspense } from "react";
import GrubPacsListScreen from "@/components/features/grubpacs/GrubPacsListScreen";

export default function GrubPacsListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GrubPacsListScreen />
    </Suspense>
  );
}
