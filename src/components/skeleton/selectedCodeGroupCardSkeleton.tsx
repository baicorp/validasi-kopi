export default function SelectedCodeGroupCardSkeleton() {
  return (
    <div className="p-2.5 rounded-lg border space-y-3">
      <div className="rounded-full w-28 h-4 bg-muted"></div>
      <div className="flex gap-2">
        <div className="rounded-full w-10 h-4 bg-muted"></div>
        <div className="rounded-full w-10 h-4 bg-muted"></div>
      </div>
      <div className="flex gap-4">
        <div className="rounded-full w-36 h-4 bg-muted"></div>
        <div className="rounded-full w-24 h-4 bg-muted"></div>
      </div>
    </div>
  );
}
