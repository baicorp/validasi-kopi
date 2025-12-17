import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex gap-2">
      <span>Loading</span>
      <LoaderCircle className="animate-spin mr-2" />
    </div>
  );
}
