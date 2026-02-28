import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, RotateCw, Star, MoreHorizontal, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChromeTab {
  title: string;
  active?: boolean;
  favicon?: React.ReactNode;
}

interface ChromeFrameProps {
  tabs: ChromeTab[];
  url: string;
  children: React.ReactNode;
  className?: string;
  onTabClick?: (index: number) => void;
}

const ChromeFrame = ({ tabs, url, children, className, onTabClick }: ChromeFrameProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("flex flex-col rounded-xl border border-[hsl(220,13%,82%)] bg-[hsl(220,14%,96%)] shadow-2xl shadow-black/20 overflow-hidden relative", className)}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-0 bg-[hsl(220,14%,92%)]">
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(0,80%,65%)]" />
          <div className="w-3 h-3 rounded-full bg-[hsl(44,90%,60%)]" />
          <div className="w-3 h-3 rounded-full bg-[hsl(130,55%,55%)]" />
        </div>
        <div className="flex items-end gap-0.5 flex-1 min-w-0">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => onTabClick?.(i)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg min-w-0 max-w-[200px] transition-colors",
                tab.active
                  ? "bg-[hsl(0,0%,100%)] text-[hsl(220,9%,20%)]"
                  : "bg-[hsl(220,14%,88%)] text-[hsl(220,9%,46%)] hover:bg-[hsl(220,14%,90%)]"
              )}
            >
              {tab.favicon}
              <span className="truncate">{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,100%)] border-b border-[hsl(220,13%,90%)]">
        <div className="flex items-center gap-1 text-[hsl(220,9%,60%)]">
          <ChevronLeft size={16} className="cursor-pointer hover:text-[hsl(220,9%,30%)]" />
          <ChevronRight size={16} className="cursor-pointer hover:text-[hsl(220,9%,30%)]" />
          <RotateCw size={14} className="cursor-pointer hover:text-[hsl(220,9%,30%)] ml-1" />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-[hsl(220,14%,96%)] rounded-full px-4 py-1.5 text-xs text-[hsl(220,9%,40%)]">
          <Search size={12} className="text-[hsl(220,9%,60%)] shrink-0" />
          <span className="truncate">{url}</span>
        </div>
        <div className="flex items-center gap-1 text-[hsl(220,9%,60%)]">
          <Star size={14} className="cursor-pointer hover:text-[hsl(220,9%,30%)]" />
          <MoreHorizontal size={16} className="cursor-pointer hover:text-[hsl(220,9%,30%)]" />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-[hsl(0,0%,100%)] relative">
        {children}
      </div>

      {/* Femstral floating icon — outside scroll container */}
      <div className="absolute bottom-4 right-4 z-50">
        {expanded ? (
          <div className="animate-in fade-in zoom-in-95 duration-200 mb-2">
            <div
              className="rounded-lg border border-primary/20 bg-[hsl(0,0%,100%)] shadow-lg shadow-primary/10 p-3 max-w-[260px] cursor-pointer"
              onClick={() => setExpanded(false)}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center shrink-0">
                  <Shield size={11} className="text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold text-primary">Femstral Active</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed pl-7">
                Scanning this thread for health claims and providing evidence-based fact-checks.
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="w-10 h-10 rounded-full bg-primary shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Shield size={18} className="text-primary-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChromeFrame;
