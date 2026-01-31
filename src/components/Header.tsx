import { useState, useEffect } from "react";
import { Moon, Sun, RefreshCw, Zap, Wallet } from "lucide-react";
import { refreshBus } from "../utils/events";
import { sharedState } from "../utils/state";

export default function Header() {
  const [isDark, setIsDark] = useState(true); // Default to dark
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState<string | null>(
    sharedState.getBalance(),
  );

  useEffect(() => {
    const unsub = sharedState.subscribe(setBalance);
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    // Sync with the theme that was already set by the inline script
    const savedTheme = localStorage.getItem("theme") || "dark";
    setIsDark(savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDark(!isDark);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshBus.emit();
    // Reset icon rotation after a delay
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-orange-500 shadow-lg shadow-orange-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            QuaiScan
          </span>
        </div>

        <div className="flex items-center gap-6">
          {balance !== null && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-full border border-border/50 animate-in fade-in zoom-in-95 duration-500">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold tabular-nums">
                {balance.split(" ")[0]}{" "}
                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                  QUAI
                </span>
              </span>
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-xs"
            title="Refresh Dashboard"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </button>

          <button
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-xs"
          >
            {isDark ? (
              <Sun className="h-4 w-4 transition-all" />
            ) : (
              <Moon className="h-4 w-4 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </div>
    </header>
  );
}
