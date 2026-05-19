import BoxSettingsPage from "@/components/features/grubpacs/details/BoxSettingsPage";

interface PageProps {
  searchParams: Promise<{ id?: string; pinSelected?: string; from?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { id, pinSelected, from } = await searchParams;
  const shouldPinSelectedOnLoad = pinSelected === "1";

  return <BoxSettingsPage boxId={id} pinSelectedOnLoad={shouldPinSelectedOnLoad} backPath={from} />;
}
