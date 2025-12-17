export default function CodeGroupsSkeleton() {
  return [1, 2, 3, 4].map((data) => (
    <div key={data} className="flex gap-2.5 mb-1.5">
      <div className="w-8 h-7 rounded-md animate-pulse bg-accent" />
      <div className="w-56 h-7 rounded-md animate-pulse bg-accent" />
    </div>
  ));
}
