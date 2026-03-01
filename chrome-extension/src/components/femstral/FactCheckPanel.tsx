import { ExternalLink } from "lucide-react";
import FemstralLogo from "./FemstralLogo";
import FactCheckBadge, { type FactCheckStatus } from "./FactCheckBadge";

interface FactCheckPanelProps {
  status: FactCheckStatus;
  summary: string;
  confidence: number;
  citations: string[];
  resourceUrl?: string;
}

const FactCheckPanel = ({
  status,
  summary,
  confidence,
  citations,
  resourceUrl = "#",
}: FactCheckPanelProps) => {
  return (
    <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-start gap-3">
        <FemstralLogo size={16} />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <FactCheckBadge status={status} />
            <span className="text-xs text-muted-foreground font-medium">
              {confidence}% confidence
            </span>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>

          <div className="flex flex-wrap items-center gap-1.5">
            {citations.map((cite) => (
              <span
                key={cite}
                className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {cite}
              </span>
            ))}
          </div>

          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View Trusted Resource
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FactCheckPanel;
