import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, DollarSign, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OptimizationTip } from "@/types/dashboard";

interface TipConfig {
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

const getTipConfig = (type: OptimizationTip["type"]): TipConfig => {
  const configs: Record<OptimizationTip["type"], TipConfig> = {
    keyword: {
      icon: <Target className="h-5 w-5" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    bid: {
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    budget: {
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    ad: {
      icon: <FileText className="h-5 w-5" />,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  };

  return (
    configs[type] || {
      icon: <Zap className="h-5 w-5" />,
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
    }
  );
};

const getImpactColor = (impact: OptimizationTip["impact"]): string => {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return colors[impact] || colors.medium;
};

interface AiTipsModernProps {
  tips: OptimizationTip[];
}

export function AiTipsModern({ tips }: AiTipsModernProps) {
  if (!tips?.length) {
    return null;
  }

  const handleApply = (tipId: string) => {
    console.log("Apply tip:", tipId);
    // Add your apply logic here
  };

  return (
    <Card className="border-0 shadow-none ">
      <CardHeader className="">
        <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span>AI Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-2">
        {tips.map((tip) => {
          const { icon, bgColor, iconColor } = getTipConfig(tip.type);

          return (
            <div key={tip.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                    bgColor,
                  )}
                >
                  <div className={iconColor}>{icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {tip.title}
                    </h4>
                    <Badge
                      className={cn(
                        "text-xs font-medium border whitespace-nowrap",
                        getImpactColor(tip.impact),
                      )}
                    >
                      {tip.impact} impact
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {tip.description}
                  </p>
                  {"estimatedSavings" in tip && tip.estimatedSavings && (
                    <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs sm:text-sm">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium">
                        ${tip.estimatedSavings} potential savings
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs sm:text-sm text-purple-600 hover:bg-purple-50 px-2 sm:px-3 h-7 sm:h-8"
                      onClick={() => handleApply(tip.id)}
                    >
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
