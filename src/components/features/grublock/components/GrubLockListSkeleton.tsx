export default function GrubLockListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="h-14 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}
