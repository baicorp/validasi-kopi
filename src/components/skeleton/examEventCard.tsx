export function ExamEventCardSkeleton({ user }: { user?: true }) {
  return (
    <div className="flex flex-col md:flex-row gap-2.5">
      {[1, 2].map((num) =>
        user ? <UserCardSkeleton key={num} /> : <CardSkeleton key={num} />,
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse bg-accent min-w-72 md:w-72 h-104 rounded-lg"></div>
  );
}

function UserCardSkeleton() {
  return (
    <div className="animate-pulse bg-accent min-w-67.5 md:w-67.5 h-76 md:h-101 rounded-lg"></div>
  );
}
