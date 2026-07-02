import { cn, toTitleCase } from "@/lib/utils";
import { ExamEventStatus } from "@/lib/types";

export default function ExamEventPeriode({
  type = "default",
  variant,
  className,
  children,
  ...props
}: {
  type?: "small" | "default";
  variant: ExamEventStatus;
} & React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-full flex justify-center items-center gap-2 px-3 py-1.5 text-xs font-medium",
        {
          "bg-[#B5D4F4] text-[#042C53] border border-[#378ADD]":
            variant === "akan datang",
          "bg-[#FAC775] text-[#412402] border border-[#BA7517]":
            variant === "berlangsung",
          "bg-[#C0DD97] text-[#173404] border border-[#639922]":
            variant === "selesai",
        },
        {
          "gap-1.5 px-2 py-1 text-[11px] border-none": type === "small",
        },
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          {
            "bg-[#185FA5]": variant === "akan datang",
            "bg-[#854F0B] animate-pulse": variant === "berlangsung",
            "bg-[#3B6D11]": variant === "selesai",
          },
          { "w-1.5 h-1.5": type === "small" },
        )}
      ></div>
      <div className={className} {...props}>
        <p>{toTitleCase(variant)}</p>
        {children}
      </div>
    </div>
  );
}
