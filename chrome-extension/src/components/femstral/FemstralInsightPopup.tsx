import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import FemstralLogo from "./FemstralLogo";
import FactCheckBadge, { type FactCheckStatus } from "./FactCheckBadge";
import { cn } from "@/lib/utils";

interface FemstralInsightPopupProps {
  status: FactCheckStatus;
  explanation: string;
  whyItMatters: string;
  learnMoreUrl?: string;
  className?: string;
}

const FemstralInsightPopup = ({
  status,
  explanation,
  whyItMatters,
  learnMoreUrl = "#",
  className,
}: FemstralInsightPopupProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "w-[300px] rounded-xl border border-border bg-card shadow-lg shadow-primary/5 p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <FemstralLogo size={14} />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Insight
        </span>
      </div>

      <FactCheckBadge status={status} />

      <p className="text-sm text-foreground/80 leading-relaxed">{explanation}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        Why this matters
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <p className="text-xs text-muted-foreground leading-relaxed pl-1 border-l-2 border-primary/30 ml-1">
          {whyItMatters}
        </p>
      )}

      <a
        href={learnMoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Learn More
        <ExternalLink size={12} />
      </a>
    </div>
  );
};

export default FemstralInsightPopup;
