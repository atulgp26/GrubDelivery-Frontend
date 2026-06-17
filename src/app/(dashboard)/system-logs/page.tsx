import { Suspense } from "react";
import SystemLogsScreen from "../../../components/features/system-logs/SystemLogsScreen";
import LoadingDetails from "@/components/ui/LoadingDetails";

export default function SystemLogsPage() {
  return (
    <Suspense fallback={<LoadingDetails entity="system logs" />}>
      <SystemLogsScreen />
    </Suspense>
  );
}
