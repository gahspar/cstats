import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const isPositive = tone === "positive";
  const isNegative = tone === "negative";
  const Icon = isNegative ? ArrowDownRight : ArrowUpRight;

  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold text-slate-50">{value}</div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isPositive && "text-emerald-300",
            isNegative && "text-red-300",
            tone === "neutral" && "text-slate-400",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {delta}
        </div>
      </div>
    </Card>
  );
}
