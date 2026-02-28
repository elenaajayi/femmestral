import { useState } from "react";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal, Shield } from "lucide-react";
import FactCheckPanel from "./FactCheckPanel";
import { type FactCheckStatus } from "./FactCheckBadge";

interface RedditCommentProps {
  author: string;
  timeAgo: string;
  content: string;
  upvotes: number;
  image?: { src: string; alt: string };
  factCheck?: {
    status: FactCheckStatus;
    summary: string;
    confidence: number;
    citations: string[];
  };
  highlightedText?: string;
  children?: React.ReactNode;
}

const RedditComment = ({
  author,
  timeAgo,
  content,
  upvotes,
  image,
  factCheck,
  highlightedText,
  children,
}: RedditCommentProps) => {
  const [showFactCheck, setShowFactCheck] = useState(false);

  const renderContent = () => {
    if (!highlightedText) {
      return <p className="text-sm text-[hsl(var(--reddit-text))] leading-relaxed">{content}</p>;
    }

    const parts = content.split(highlightedText);
    if (parts.length === 1) {
      return <p className="text-sm text-[hsl(var(--reddit-text))] leading-relaxed">{content}</p>;
    }

    return (
      <p className="text-sm text-[hsl(var(--reddit-text))] leading-relaxed">
        {parts[0]}
        <mark className="bg-primary/25 text-foreground rounded px-0.5 py-0.5">{highlightedText}</mark>
        {parts.slice(1).join(highlightedText)}
      </p>
    );
  };

  return (
    <div className="flex gap-2 py-2 relative group">
      {/* Thread line */}
      <div className="flex flex-col items-center">
        <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary shrink-0">
          {author[0].toUpperCase()}
        </div>
        <div className="w-0.5 flex-1 bg-[hsl(var(--reddit-border))] mt-1 hover:bg-[hsl(var(--reddit-link))] cursor-pointer transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-bold text-[hsl(var(--reddit-text))]">{author}</span>
          <span className="text-xs text-[hsl(var(--reddit-text-muted))]">· {timeAgo}</span>
        </div>

        {renderContent()}

        {image && (
          <div className="mt-2 rounded-lg overflow-hidden border border-[hsl(var(--reddit-border))] max-w-sm">
            <img src={image.src} alt={image.alt} className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="flex items-center gap-1 mt-1.5 -ml-1.5">
          <div className="flex items-center gap-0.5 rounded-sm px-1.5 py-1">
            <ArrowBigUp size={18} className="text-[hsl(var(--reddit-text-muted))] hover:text-[hsl(var(--reddit-upvote))] cursor-pointer" />
            <span className="text-xs font-bold text-[hsl(var(--reddit-text-muted))]">{upvotes}</span>
            <ArrowBigDown size={18} className="text-[hsl(var(--reddit-text-muted))] hover:text-[hsl(240,60%,60%)] cursor-pointer" />
          </div>
          <button className="flex items-center gap-1 rounded-sm px-1.5 py-1 text-xs font-bold text-[hsl(var(--reddit-text-muted))] hover:bg-[hsl(var(--reddit-bg))]">
            <MessageSquare size={14} />
            Reply
          </button>
          <button className="flex items-center gap-1 rounded-sm px-1.5 py-1 text-xs font-bold text-[hsl(var(--reddit-text-muted))] hover:bg-[hsl(var(--reddit-bg))]">
            <Share2 size={14} />
            Share
          </button>
          <button className="rounded-sm px-1.5 py-1 text-[hsl(var(--reddit-text-muted))] hover:bg-[hsl(var(--reddit-bg))]">
            <MoreHorizontal size={14} />
          </button>

          {/* Femstral fact-check trigger */}
          {factCheck && (
            <button
              onClick={() => setShowFactCheck((v) => !v)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all duration-200 ${
                showFactCheck
                  ? "bg-primary/10 text-primary"
                  : "bg-primary/5 text-primary/70"
              }`}
            >
              <Shield size={13} />
              {showFactCheck ? "Hide" : "Fact-check"}
            </button>
          )}
        </div>

        {factCheck && showFactCheck && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <FactCheckPanel
              status={factCheck.status}
              summary={factCheck.summary}
              confidence={factCheck.confidence}
              citations={factCheck.citations}
            />
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default RedditComment;
