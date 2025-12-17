import { Checkbox } from "../ui/checkbox";

export default function ListCheckboxSkeleton() {
  return [1, 2, 3].map((data) => (
    <li key={data} className="flex items-center gap-2">
      <Checkbox />
      <span className="h-2.5 w-52 animate-pulse bg-accent" />
    </li>
  ));
}
