"use client";

interface LoadingDetailsProps {
  entity?: string;
}

export default function LoadingDetails({ entity }: LoadingDetailsProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--gp-color-brand-primary)]" />
        <p className="text-[var(--gp-color-neutral-secondary)] font-medium animate-pulse">
          {entity ? `Loading ${entity}...` : "Loading..."}
        </p>
      </div>
    </div>
  );
}
