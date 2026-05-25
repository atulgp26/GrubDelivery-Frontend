import { Suspense } from "react";
import SystemLogsScreen from "../../../components/features/system-logs/SystemLogsScreen";

export default function SystemLogsPage() {
  return (
    <Suspense fallback={null}>
      <SystemLogsScreen />
    </Suspense>
  );
}
