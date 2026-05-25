interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "No devices found." }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg p-8 text-center">
      <p className="text-[var(--color-neutral-light)] text-sm">{message}</p>
    </div>
  );
}

