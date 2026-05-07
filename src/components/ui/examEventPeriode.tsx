import { cn, toTitleCase } from "@/lib/utils";
import { examEventPeriode } from "@/lib/types";

export default function ExamEventPeriode({
  variant,
  className,
  children,
  ...props
}: {
  variant: examEventPeriode;
} & React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-full flex justify-center items-center gap-2 px-3 py-1.5",
        {
          "bg-[#B5D4F4] text-[#042C53] border border-[#378ADD]":
            variant === "akan datang",
          "bg-[#FAC775] text-[#412402] border border-[#BA7517]":
            variant === "berlangsung",
          "bg-[#C0DD97] text-[#173404] border border-[#639922]":
            variant === "selesai",
        },
      )}
    >
      <div
        className={cn("w-2 h-2 rounded-full", {
          "bg-[#185FA5]": variant === "akan datang",
          "bg-[#854F0B] animate-pulse": variant === "berlangsung",
          "bg-[#3B6D11]": variant === "selesai",
        })}
      ></div>
      <div className={className} {...props}>
        <p className="text-xs font-medium">{toTitleCase(variant)}</p>
        {children}
      </div>
    </div>
  );
}
