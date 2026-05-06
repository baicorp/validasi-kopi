import { cn } from "@/lib/utils";

export function CardSectionTitle({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(`text-muted-foreground text-xs mb-0.5`, className)}
      {...props}
    >
      {children}
    </p>
  );
}
