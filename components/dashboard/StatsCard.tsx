import type React from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define modern outline color variants
const cardVariants = [
  {
    // Blue outline
    border: "border-blue-200",
    bg: "bg-white/80",
    iconBorder: "border-blue-200",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accent: "bg-blue-500",
  },
  {
    // Emerald outline
    border: "border-emerald-200",
    bg: "bg-white/80",
    iconBorder: "border-emerald-200",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accent: "bg-emerald-500",
  },
  {
    // Violet outline
    border: "border-violet-200",
    bg: "bg-white/80",
    iconBorder: "border-violet-200",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accent: "bg-violet-500",
  },
  {
    // Amber outline
    border: "border-amber-200",
    bg: "bg-white/80",
    iconBorder: "border-amber-200",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "bg-amber-500",
  },
  {
    // Rose outline
    border: "border-rose-200",
    bg: "bg-white/80",
    iconBorder: "border-rose-200",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    accent: "bg-rose-500",
  },
  {
    // Indigo outline
    border: "border-indigo-200",
    bg: "bg-white/80",
    iconBorder: "border-indigo-200",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    accent: "bg-indigo-500",
  },
  {
    // Teal outline
    border: "border-teal-200",
    bg: "bg-white/80",
    iconBorder: "border-teal-200",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    accent: "bg-teal-500",
  },
  {
    // Fuchsia outline
    border: "border-fuchsia-200",
    bg: "bg-white/80",
    iconBorder: "border-fuchsia-200",
    iconBg: "bg-fuchsia-50",
    iconColor: "text-fuchsia-600",
    accent: "bg-fuchsia-500",
  },
];

interface SimpleStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: "currency" | "percentage" | "number";
  icon?: React.ReactNode;
  colorIndex?: number;
}

export function SimpleStatsCard({
  title,
  value,
  change,
  format = "number",
  icon,
  colorIndex = 0,
}: SimpleStatsCardProps) {
  const colors =
    cardVariants[colorIndex % cardVariants.length] || cardVariants[0];

  const formatValue = (val: string | number) => {
    if (format === "currency") {
      return `$${
        typeof val === "number"
          ? val.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : val
      }`;
    }
    if (format === "percentage") {
      const numVal = typeof val === "string" ? parseFloat(val) : val;
      return `${numVal.toFixed(1)}%`;
    }
    return typeof val === "number" ? val.toLocaleString() : val;
  };

  const isPositive = change !== undefined ? change >= 0 : true;
  const changeValue = change !== undefined ? Math.abs(change) : 0;

  return (
    <div className="relative group">
      <div />

      <Card
        className={cn(
          " rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm",
          colors.border,
          colors.bg,
          "hover:shadow-slate-200/50 group"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            {/* Icon */}
            <div
              className={cn(
                "p-3 rounded-xl border-2 transition-all duration-300 group-hover:scale-110",
                colors.iconBorder,
                colors.iconBg,
                colors.iconColor
              )}
            >
              <div className="h-5 w-5 flex items-center justify-center">
                {icon}
              </div>
            </div>

            {change !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-300",
                  isPositive
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700",
                  "group-hover:shadow-sm"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1 flex-shrink-0" />
                )}
                {changeValue}%
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Title */}
            <p className="text-sm font-medium text-slate-600 whitespace-normal break-words leading-relaxed">
              {title}
            </p>

            {/* Value */}
            <p className="text-3xl font-bold text-slate-800 leading-tight">
              {formatValue(value)}
            </p>

            {/* Change description */}
            {change !== undefined && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isPositive ? "↗" : "↘"} {changeValue}%
                </span>
                <span className="text-sm text-slate-400">vs last month</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
