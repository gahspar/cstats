import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "border-sky-400/30 bg-sky-400/15 text-sky-100 hover:bg-sky-400/22",
  secondary: "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800",
  ghost: "border-transparent bg-transparent text-slate-300 hover:bg-slate-800/70",
};

export function Button({
  className,
  variant = "secondary",
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
