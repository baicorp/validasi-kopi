import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export default function Callout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-sm bg-orange-100 border border-orange-200 rounded-md text-orange-500 flex gap-3 px-3 py-5",
        className,
      )}
      {...props}
    >
      <Info />
      {props.children}
    </div>
  );
}
