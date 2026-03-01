const RedditSidebar = () => (
  <div className="space-y-4">
    {/* Community info */}
    <div className="rounded-lg border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] overflow-hidden">
      <div className="h-8 bg-primary" />
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-[hsl(0,0%,100%)] -mt-6 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">r/</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[hsl(220,9%,20%)]">r/Perimenopause</p>
            <p className="text-[10px] text-[hsl(220,9%,46%)]">r/Perimenopause</p>
          </div>
        </div>
        <p className="text-xs text-[hsl(220,9%,40%)] leading-relaxed">
          A supportive community for those navigating perimenopause. Share experiences, ask questions, and find resources.
        </p>
        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-[hsl(220,13%,90%)]">
          <div>
            <p className="text-sm font-bold text-[hsl(220,9%,20%)]">48.2k</p>
            <p className="text-[10px] text-[hsl(220,9%,46%)]">Members</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[hsl(220,9%,20%)]">312</p>
            <p className="text-[10px] text-[hsl(220,9%,46%)]">Online</p>
          </div>
        </div>
      </div>
    </div>

    {/* Rules */}
    <div className="rounded-lg border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-3">
      <p className="text-xs font-bold text-[hsl(220,9%,20%)] mb-2">Community Rules</p>
      <div className="space-y-1.5 text-[10px] text-[hsl(220,9%,40%)]">
        <p>1. Be respectful and supportive</p>
        <p>2. No medical advice — share experiences only</p>
        <p>3. No spam or self-promotion</p>
      </div>
    </div>

  </div>
);

export default RedditSidebar;
