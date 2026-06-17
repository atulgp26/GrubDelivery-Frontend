import BoxSettingsPage from "@/components/features/grubpacs/details/BoxSettingsPage";
import type { Tab } from "@/components/features/grubpacs/details/types";

interface PageProps {
  searchParams: Promise<{ id?: string; pinSelected?: string; from?: string; tab?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { id, pinSelected, from, tab } = await searchParams;
  const shouldPinSelectedOnLoad = pinSelected === "1";
  const initialTab = tab === "logs" || tab === "track" ? (tab as Tab) : undefined;

  return (
    <BoxSettingsPage boxId={id} pinSelectedOnLoad={shouldPinSelectedOnLoad} backPath={from} initialTab={initialTab} />
  );
}
