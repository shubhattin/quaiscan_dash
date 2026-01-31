import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { api, QuaiTransaction } from "../utils/api";
import { refreshBus } from "../utils/events";
import { sharedState } from "../utils/state";
import { AlertCircle, History, Activity } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "QuaiScan Dashboard" }],
  }),
});

const WALLET_ID = "0x002624Fa55DFf0ca53aF9166B4d44c16a294C4e0";

function Dashboard() {
  const [transactions, setTransactions] = useState<QuaiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(api.getTrackerStats());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, txRes] = await Promise.all([
        api.getBalance(WALLET_ID),
        api.getTransactions(WALLET_ID),
      ]);

      if (balanceRes.status === "1") {
        const formatted = formatQuai(balanceRes.result);
        sharedState.setBalance(formatted);
      } else {
        sharedState.setBalance("0 QUAI");
      }

      if (txRes.status === "1") {
        setTransactions(txRes.result);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError("Failed to fetch dashboard data. Check console for details.");
    } finally {
      setLoading(false);
      setStats(api.getTrackerStats());
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsub = refreshBus.subscribe(fetchData);
    return () => {
      unsub();
    };
  }, [fetchData]);

  const formatQuai = (wei: string) => {
    if (!wei) return "0";
    try {
      const val = BigInt(wei);
      const divisor = BigInt(10 ** 18);
      const integerPart = val / divisor;
      const remainder = val % divisor;
      const paddedRemainder = remainder.toString().padStart(18, "0");
      return `${integerPart}.${paddedRemainder.slice(0, 4)} QUAI`;
    } catch (e) {
      return wei + " (raw)";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground transition-colors duration-300">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Address Header - Optional context, keeping it minimal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Account:</span>
            <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono select-all">
              {WALLET_ID}
            </code>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Activity/Stats Card */}
          <div className="relative group bg-card p-6 rounded-2xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Session Activity
              </h2>
            </div>
            <div className="flex gap-8">
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight">
                  {stats.requests}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Requests
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-destructive">
                  {stats.errors}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Failures
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-green-500">
                  {transactions.length}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Visible Txs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-bold text-lg">Transaction History</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background px-3 py-1 border border-border rounded-full">
              Network: Mainnet
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold">Hash</th>
                  <th className="px-6 py-4 font-bold">Block</th>
                  <th className="px-6 py-4 font-bold">Details</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                  <th className="px-6 py-4 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <Skeleton className="h-4 w-24 rounded-full" />
                      </td>
                      <td className="px-6 py-5">
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </td>
                      <td className="px-6 py-5">
                        <Skeleton className="h-4 w-48 rounded-full" />
                      </td>
                      <td className="px-6 py-5">
                        <Skeleton className="h-4 w-16 ml-auto rounded-full" />
                      </td>
                      <td className="px-6 py-5">
                        <Skeleton className="h-4 w-20 ml-auto rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <History className="w-8 h-8 opacity-20" />
                        <p className="font-medium">
                          No records found for this address
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.hash}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td
                        className="px-6 py-5 text-primary font-mono text-xs max-w-[120px]"
                        title={tx.hash}
                      >
                        <a
                          href={`https://quaiscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {tx.hash.substring(0, 10)}...
                        </a>
                      </td>
                      <td className="px-6 py-5 font-medium tabular-nums">
                        {tx.blockNumber}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">
                            From / To
                          </span>
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span
                              className={
                                tx.from === WALLET_ID.toLowerCase()
                                  ? "text-orange-500 font-bold"
                                  : "text-muted-foreground"
                              }
                            >
                              {tx.from.substring(0, 8)}...
                            </span>
                            <span className="text-muted-foreground/30">→</span>
                            <span
                              className={
                                tx.to === WALLET_ID.toLowerCase()
                                  ? "text-green-500 font-bold"
                                  : "text-muted-foreground"
                              }
                            >
                              {tx.to.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-foreground tabular-nums">
                            {formatQuai(tx.value).split(" ")[0]}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                            QUAI
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right text-muted-foreground font-medium">
                        {new Date(
                          parseInt(tx.timeStamp) * 1000,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
