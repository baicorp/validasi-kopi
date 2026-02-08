import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center pt-10">
      <LoaderCircle className="animate-spin mr-2" />
    </div>
  );
}
