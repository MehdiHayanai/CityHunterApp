export default function DashboardLoading() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-divider/10 border-t-accent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <i className="fa-solid fa-satellite-dish text-secondary/50 text-2xl"></i>
        </div>
      </div>
      <div className="mt-6 font-mono text-sm text-secondary animate-pulse tracking-widest uppercase">
        Loading Dashboard...
      </div>
      <div className="mt-2 font-mono text-xs text-secondary/50">
        Connecting to backend API
      </div>
    </div>
  );
}
