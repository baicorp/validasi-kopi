export function ExamEventCardSkeleton({ user }: { user?: true }) {
  return (
    <div className="flex gap-2.5">
      {[1, 2].map((num) =>
        user ? <UserCardSkeleton key={num} /> : <CardSkeleton key={num} />,
      )}
    </div>
  );
}

function CardSkeleton() {
  return <div className="animate-pulse bg-accent w-72 h-104 rounded-lg"></div>;
}

function UserCardSkeleton() {
  return (
    <div className="animate-pulse bg-accent w-67.5 h-101 rounded-lg"></div>
  );
}
