import { Home, TrendingUp, Bell, MessageSquare, Search } from "lucide-react";

const RedditNav = () => (
  <div className="flex items-center justify-between px-4 py-2 bg-[hsl(0,0%,100%)] border-b border-[hsl(220,13%,90%)]">
    <div className="flex items-center gap-3">
      {/* Reddit logo */}
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-8 rounded-full bg-[hsl(16,100%,50%)] flex items-center justify-center">
          <span className="text-[hsl(0,0%,100%)] font-bold text-sm">r</span>
        </div>
        <span className="font-bold text-[hsl(220,9%,20%)] text-lg hidden sm:inline">reddit</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[hsl(220,16%,96%)] rounded-full px-4 py-1.5 w-64 border border-[hsl(220,13%,90%)] hover:border-[hsl(214,82%,51%)] transition-colors">
        <Search size={14} className="text-[hsl(220,9%,46%)]" />
        <span className="text-xs text-[hsl(220,9%,46%)]">Search Reddit</span>
      </div>
    </div>

    <div className="flex items-center gap-4 text-[hsl(220,9%,46%)]">
      <Home size={20} className="cursor-pointer hover:text-[hsl(220,9%,20%)]" />
      <TrendingUp size={20} className="cursor-pointer hover:text-[hsl(220,9%,20%)]" />
      <Bell size={20} className="cursor-pointer hover:text-[hsl(220,9%,20%)]" />
      <MessageSquare size={20} className="cursor-pointer hover:text-[hsl(220,9%,20%)]" />
      <div className="w-7 h-7 rounded-full bg-[hsl(256,97%,67%)] flex items-center justify-center">
        <span className="text-[hsl(0,0%,100%)] text-[10px] font-bold">U</span>
      </div>
    </div>
  </div>
);

export default RedditNav;
