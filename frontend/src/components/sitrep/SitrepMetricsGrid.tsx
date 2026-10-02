import {
  Target,
  AlertTriangle,
  Flame,
  Activity,
  ShieldCheck,
  Clock,
  Zap,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { useAccent } from "../../context/AccentContext";
import { useLanguage } from "../../context/LanguageContext";

export interface SitrepMetrics {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

interface SitrepMetricsGridProps {
  metrics: SitrepMetrics;
}

export function SitrepMetricsGrid({ metrics }: SitrepMetricsGridProps) {
  const { theme } = useAccent();
  const { t } = useLanguage();

  const priorityCards = [
    {
      key: "total",
      label: t.sitrepModal.totalTargets,
      value: metrics.total,
      icon: Target,
      bg: "bg-zinc-950/80 border-zinc-800",
      textColor: "text-zinc-100",
      labelColor: "text-zinc-400",
    },
    {
      key: "critical",
      label: t.sitrepModal.critical,
      value: metrics.critical,
      icon: AlertTriangle,
      bg: "bg-red-950/20 border-red-800/40",
      textColor: "text-red-300",
      labelColor: "text-red-400",
    },
    {
      key: "high",
      label: t.sitrepModal.high,
      value: metrics.high,
      icon: Flame,
      bg: "bg-orange-950/20 border-orange-800/40",
      textColor: "text-orange-300",
      labelColor: "text-orange-400",
    },
    {
      key: "medium",
      label: t.sitrepModal.medium,
      value: metrics.medium,
      icon: Activity,
      bg: "bg-amber-950/20 border-amber-800/40",
      textColor: "text-amber-300",
      labelColor: "text-amber-400",
    },
    {
      key: "low",
      label: t.sitrepModal.low,
      value: metrics.low,
      icon: ShieldCheck,
      bg: "bg-blue-950/20 border-blue-800/40",
      textColor: "text-blue-300",
      labelColor: "text-blue-400",
    },
  ];

  const statusCards = [
    {
      key: "pending",
      label: t.sitrepModal.pending,
      value: metrics.pending,
      icon: Clock,
      bg: "bg-zinc-900/40 border-zinc-800",
      textColor: "text-zinc-200",
      labelColor: "text-zinc-400",
    },
    {
      key: "inProgress",
      label: t.sitrepModal.inProgress,
      value: metrics.inProgress,
      icon: Zap,
      bg: "bg-cyan-950/20 border-cyan-800/40",
      textColor: "text-cyan-300",
      labelColor: "text-cyan-400",
    },
    {
      key: "completed",
      label: t.sitrepModal.completed,
      value: metrics.completed,
      icon: CheckCircle2,
      bg: "bg-emerald-950/20 border-emerald-800/40",
      textColor: "text-emerald-300",
      labelColor: "text-emerald-400",
    },
    {
      key: "cancelled",
      label: t.sitrepModal.cancelled,
      value: metrics.cancelled,
      icon: Ban,
      bg: "bg-zinc-950/40 border-zinc-800/60",
      textColor: "text-zinc-400",
      labelColor: "text-zinc-500",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-0.5">
          <span className="flex items-center gap-1.5 font-bold">
            <Flame size={12} className={theme.textAccent} />
            {t.sitrepModal.priorityVolumeTitle}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {priorityCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`p-2.5 rounded-lg border flex flex-col justify-between ${card.bg}`}
              >
                <span className={`text-[10px] font-mono uppercase flex items-center gap-1 ${card.labelColor}`}>
                  <Icon size={11} />
                  {card.label}
                </span>
                <span className={`text-xl font-mono font-bold mt-1 ${card.textColor}`}>
                  {card.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-0.5">
          <span className="flex items-center gap-1.5 font-bold">
            <Activity size={12} className={theme.textAccent} />
            {t.sitrepModal.statusBreakdownTitle}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`p-2.5 rounded-lg border flex flex-col justify-between ${card.bg}`}
              >
                <span className={`text-[10px] font-mono uppercase flex items-center gap-1 ${card.labelColor}`}>
                  <Icon size={11} />
                  {card.label}
                </span>
                <span className={`text-xl font-mono font-bold mt-1 ${card.textColor}`}>
                  {card.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
