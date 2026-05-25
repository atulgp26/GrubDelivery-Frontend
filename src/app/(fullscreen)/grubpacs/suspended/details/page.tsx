import SuspendedBoxDetailsPage from "@/components/features/grubpacs/details/SuspendedBoxDetailsPage";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { id } = await searchParams;
  return <SuspendedBoxDetailsPage boxId={id} />;
}
