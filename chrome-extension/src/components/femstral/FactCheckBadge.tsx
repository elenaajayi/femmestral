import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type FactCheckStatus = "supported" | "partial" | "unsupported";

interface FactCheckBadgeProps {
  status: FactCheckStatus;
  className?: string;
}

const statusConfig = {
  supported: {
    label: "Supported by Clinical Evidence",
    Icon: CheckCircle,
    bg: "bg-femstral-supported-bg",
    text: "text-femstral-supported",
    border: "border-femstral-supported/20",
  },
  partial: {
    label: "Partially Supported",
    Icon: AlertTriangle,
    bg: "bg-femstral-partial-bg",
    text: "text-femstral-partial",
    border: "border-femstral-partial/20",
  },
  unsupported: {
    label: "Not Evidence-Based",
    Icon: XCircle,
    bg: "bg-femstral-unsupported-bg",
    text: "text-femstral-unsupported",
    border: "border-femstral-unsupported/20",
  },
};

const FactCheckBadge = ({ status, className }: FactCheckBadgeProps) => {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default FactCheckBadge;
export { statusConfig };
