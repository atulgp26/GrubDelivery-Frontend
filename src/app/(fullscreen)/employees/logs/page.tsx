import { Suspense } from "react";
import EmployeeLogsScreen from "../../../../components/features/employees/EmployeeLogsScreen";

export default function EmployeeLogsPage() {
	return (
		<Suspense fallback={null}>
			<EmployeeLogsScreen />
		</Suspense>
	);
}