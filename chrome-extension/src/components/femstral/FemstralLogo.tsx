import { Shield } from "lucide-react";

interface FemstralLogoProps {
  size?: number;
  className?: string;
}

const FemstralLogo = ({ size = 20, className = "" }: FemstralLogoProps) => (
  <div className={`inline-flex items-center gap-1.5 ${className}`}>
    <div className="rounded-lg bg-primary p-1">
      <Shield size={size} className="text-primary-foreground" strokeWidth={2.5} />
    </div>
    <span className="font-semibold text-primary text-sm tracking-tight">Femstral</span>
  </div>
);

export default FemstralLogo;
