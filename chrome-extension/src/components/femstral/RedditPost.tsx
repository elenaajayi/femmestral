import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, MoreHorizontal } from "lucide-react";

interface RedditPostProps {
  subreddit: string;
  author: string;
  timeAgo: string;
  title: string;
  content: string;
  upvotes: number;
  comments: number;
  children?: React.ReactNode;
}

const RedditPost = ({
  subreddit,
  author,
  timeAgo,
  title,
  content,
  upvotes,
  comments,
  children,
}: RedditPostProps) => {
  return (
    <div className="rounded-md border border-[hsl(var(--reddit-border))] bg-[hsl(var(--reddit-card))] hover:border-[hsl(0,0%,78%)] transition-colors">
      {/* Vote column + content */}
      <div className="flex">
        {/* Vote sidebar */}
        <div className="flex flex-col items-center gap-1 py-3 px-2 bg-[hsl(var(--reddit-bg))] rounded-l-md">
          <ArrowBigUp size={22} className="text-[hsl(var(--reddit-text-muted))] hover:text-[hsl(var(--reddit-upvote))] cursor-pointer" />
          <span className="text-xs font-bold text-[hsl(var(--reddit-text))]">{upvotes}</span>
          <ArrowBigDown size={22} className="text-[hsl(var(--reddit-text-muted))] hover:text-[hsl(240,60%,60%)] cursor-pointer" />
        </div>

        <div className="flex-1 p-3">
          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs mb-2">
            <div className="w-5 h-5 rounded-full bg-[hsl(16,100%,50%)] flex items-center justify-center">
              <span className="text-[8px] font-bold text-[hsl(0,0%,100%)]">r/</span>
            </div>
            <span className="font-bold text-[hsl(var(--reddit-text))] hover:underline cursor-pointer">{subreddit}</span>
            <span className="text-[hsl(var(--reddit-text-muted))]">·</span>
            <span className="text-[hsl(var(--reddit-text-muted))]">Posted by u/{author}</span>
            <span className="text-[hsl(var(--reddit-text-muted))]">{timeAgo}</span>
          </div>

          <h2 className="text-lg font-semibold text-[hsl(var(--reddit-text))] mb-2 leading-tight">{title}</h2>
          <p className="text-sm text-[hsl(var(--reddit-text))] leading-relaxed mb-3">{content}</p>

          {/* Actions */}
          <div className="flex items-center gap-1 -ml-2">
            <button className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-bold text-[hsl(var(--reddit-text-muted))] hover:bg-[hsl(var(--reddit-bg))]">
              <MessageSquare size={18} />
              {comments} Comments
            </button>
            <button className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-bold text-[hsl(var(--reddit-text-muted))] hover:bg-[hsl(var(--reddit-bg))]">
              <Share2 size={18} />
              Share
            </button>
            <button className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-bold text-[hsl(var(--reddit-text-muted))] hover:bg-[hsl(var(--reddit-bg))]">
              <Bookmark size={18} />
              Save
            </button>
            <button className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-bold text-[hsl(var(--reddit-text-muted))] hover:bg-[hsl(var(--reddit-bg))]">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {children && (
        <div className="border-t border-[hsl(var(--reddit-border))] px-4 py-3 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default RedditPost;
