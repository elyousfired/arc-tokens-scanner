import React, { useState, useEffect } from "react";
import { 
  Flame, RefreshCw, ExternalLink, Copy, Check, Search, ShieldCheck, 
  Trophy, TrendingUp, Filter, BarChart3, ArrowUpRight, Zap,
  AlertTriangle, Droplets, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { scanFreshHourlyBurns, TIMEFRAMES } from "../services/hourlyBurnsService";
import { fmtCompact, fmtNum } from "../lib/format";
import { TransactionModal } from "../components/TransactionModal";

export function HourlyBurnsPage({ token, allTokens = [], onNavigate, onSelectToken }) {
  const [timeframe, setTimeframe] = useState("1h");
  const [liquidityFilter, setLiquidityFilter] = useState("liquid"); // "liquid" | "all"
  const [data, setData] = useState({ tokens: [], stats: {}, currentBlock: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTx, setCopiedTx] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [secondsUntilNextScan, setSecondsUntilNextScan] = useState(12);
  const [isLivePaused, setIsLivePaused] = useState(false);

  const fetchFreshData = async (showLoading = false, tf = timeframe) => {
    try {
      if (showLoading) setRefreshing(true);
      const res = await scanFreshHourlyBurns(tf, showLoading);
      if (res && res.tokens) {
        setData(res);
      }
    } catch (err) {
      console.error("Hourly burns scan error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSecondsUntilNextScan(12);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFreshData(true, timeframe);
  }, [timeframe]);

  // 12s live polling ticker
  useEffect(() => {
    if (isLivePaused) return;

    const interval = setInterval(() => {
      setSecondsUntilNextScan((prev) => {
        if (prev <= 1) {
          fetchFreshData(false, timeframe);
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLivePaused, timeframe]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const handleTimeframeChange = (newTf) => {
    setTimeframe(newTf);
  };

  // Filter list
  const filteredTokens = (data.tokens || []).filter((t) => {
    const matchesSearch =
      t.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contract?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLiq = liquidityFilter === "liquid" ? t.liquidity >= 1000 : true;
    return matchesSearch && matchesLiq;
  });

  const activeTfConfig = TIMEFRAMES[timeframe] || TIMEFRAMES["1h"];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. Hero / Trust Section (styled like SupplyDonut & Screenshot) */}
      <div className="card p-5 sm:p-6 bg-[#111622] border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Circular Donut Gauge on Left */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-cyan-400"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black font-mono text-white tracking-tight">
                  {activeTfConfig.label.replace(/[^0-9A-Za-z]/g, "")}
                </span>
                <span className="text-[9px] uppercase font-mono font-bold text-cyan-400 tracking-wider">
                  RADAR
                </span>
              </div>
            </div>

            {/* Headline & Description */}
            <div>
              <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>MOMENTUM · TIME-LOCKED SCANNER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                Tokens Burning in {activeTfConfig.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xl font-mono leading-relaxed">
                Live on-chain radar detecting every ERC-20 token with active burn events in 0x00...dEaD over the selected window. Sub-second Arc Malachite consensus.
              </p>
            </div>
          </div>

          {/* Right Checklist (exact match of screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-mono pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Fixed initial supply</span>
              </span>
              <span className="text-slate-500 text-[11px]">1.00B minted once</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Mint authority renounced</span>
              </span>
              <span className="text-slate-500 text-[11px]">No new supply, ever</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Freeze authority renounced</span>
              </span>
              <span className="text-slate-500 text-[11px]">No wallet freeze</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Arc L1 AMM Hooks</span>
              </span>
              <span className="text-emerald-400 text-[11px] font-bold">100% USDC-Native</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>0% DEX transfer tax</span>
              </span>
              <span className="text-slate-500 text-[11px]">Standard ERC-20</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Target Wallet</span>
              </span>
              <span className="text-cyan-400 text-[11px] font-mono">0x00...dEaD</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scorecard Indicators Bar (Exact match of screenshot) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold font-mono text-white">
              {filteredTokens.length}{" "}
              <span className="text-sm font-normal text-slate-400">tokens burning in {activeTfConfig.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(10, filteredTokens.length))].map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" title="Active Burn" />
              ))}
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 inline-block" title="Monitoring" />
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" title="USDC Native" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Bullish Flow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> USDC AMM
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> High Velocity
            </span>
          </div>
        </div>

        {/* 5-Column Grid of indicator-card (exact CSS from index.css) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="indicator-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Burn Frequency</span>
              <span className="badge-bull">Bullish</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-2">
              {data.stats?.burnRatePerMinute || "0.0"} <span className="text-xs font-normal text-slate-400">/ min</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {data.stats?.totalLogs || 0} burn events in window
            </div>
          </div>

          <div className="indicator-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Timeframe Burn $</span>
              <span className="badge-bull">Bullish</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-2">
              ${fmtCompact(data.stats?.totalUsd || 0)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Real & estimated incinerated value
            </div>
          </div>

          <div className="indicator-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Tokens Detected</span>
              <span className="badge-bull">Bullish</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-2">
              {data.stats?.uniqueTokens || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Unique ERC-20s hitting dead wallet
            </div>
          </div>

          <div className="indicator-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Fresh Debuts</span>
              <span className="badge-bull">Bullish</span>
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-2">
              {data.stats?.freshDebuts || 0} <span className="text-xs font-normal text-slate-400">tokens</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Burned within last 3 minutes
            </div>
          </div>

          <div className="indicator-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Arc L1 Finality</span>
              <span className="badge-bull">Bullish</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
              0.51s
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Sub-second block confirmation
            </div>
          </div>
        </div>
      </section>

      {/* 3. Timeframe Selector & Liquidity Controls (Matching exact button style) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        {/* Timeframe Buttons: 15M, 30M, 1H, 4H, 24H */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500 flex items-center gap-1 mr-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Timeframe:
          </span>
          {Object.values(TIMEFRAMES).map((tf) => (
            <button
              key={tf.key}
              onClick={() => handleTimeframeChange(tf.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                timeframe === tf.key
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10 font-bold"
                  : "btn-outline hover:text-white"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Right side: Pool Filter + Search + Live Block Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Liquidity Toggle */}
          <div className="flex items-center gap-1.5 bg-[#111622] border border-slate-800 rounded-lg p-1 text-xs font-mono">
            <button
              onClick={() => setLiquidityFilter("liquid")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                liquidityFilter === "liquid"
                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Droplets className="w-3 h-3 text-emerald-400" />
              <span>&gt; $1K Liq</span>
            </button>
            <button
              onClick={() => setLiquidityFilter("all")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                liquidityFilter === "all"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>All ({data.tokens?.length || 0})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111622] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Block Ticker & Rescan */}
          <div className="flex items-center gap-2 bg-[#111622] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isLivePaused ? "bg-amber-400" : "bg-emerald-400 animate-ping"}`} />
            <span className="text-slate-400 text-[11px]">
              #{data.currentBlock ? data.currentBlock.toLocaleString() : "..."} ({secondsUntilNextScan}s)
            </span>
            <button
              onClick={() => fetchFreshData(true, timeframe)}
              disabled={refreshing}
              className="text-slate-400 hover:text-cyan-400 transition ml-1"
              title="Refresh now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Data Table */}
      <div className="card border-slate-800 bg-[#111622] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/70">
                <th className="py-3.5 px-4 font-semibold">Rank</th>
                <th className="py-3.5 px-4 font-semibold">Token</th>
                <th className="py-3.5 px-4 font-semibold text-right">Latest Burn</th>
                <th className="py-3.5 px-4 font-semibold text-right">Burn Count ({activeTfConfig.label})</th>
                <th className="py-3.5 px-4 font-semibold text-right">Tokens Incinerated</th>
                <th className="py-3.5 px-4 font-semibold text-right">USD Burned</th>
                <th className="py-3.5 px-4 font-semibold text-right">Spot Price</th>
                <th className="py-3.5 px-4 font-semibold text-right">DEX Liquidity</th>
                <th className="py-3.5 px-4 font-semibold text-right">Status / Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2.5">
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                      <span className="font-mono">Scanning Arc L1 Dead Wallet for {activeTfConfig.name}...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <p>No tokens found matching filter criteria in {activeTfConfig.name}.</p>
                      <button
                        onClick={() => setLiquidityFilter("all")}
                        className="text-xs text-cyan-400 hover:underline cursor-pointer"
                      >
                        Switch to "All Detected Tokens" to view micro-cap burns
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTokens.map((t, idx) => {
                  const medal =
                    idx === 0
                      ? "🥇"
                      : idx === 1
                      ? "🥈"
                      : idx === 2
                      ? "🥉"
                      : `#${idx + 1}`;

                  return (
                    <tr
                      key={t.contract}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-300 text-sm">
                        {medal}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            ${t.symbol}
                          </span>
                          <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                            {t.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{t.name}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {t.contract.slice(0, 6)}...{t.contract.slice(-4)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 text-slate-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${t.isFreshDebut ? "bg-cyan-400 animate-ping" : "bg-orange-400"}`} />
                          <span className={t.isFreshDebut ? "text-cyan-300 font-bold" : ""}>
                            {t.timeAgo}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600">
                          Block #{t.latestBlock ? t.latestBlock.toLocaleString() : "..."}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 font-black text-sm text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                          <span>{t.burnCount} burns</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                        <div>
                          {fmtCompact(t.burnedTokens, "")} {t.symbol}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {t.burnedTokens ? t.burnedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className={`font-black text-sm ${t.liquidity === 0 ? "text-slate-400 line-through decoration-rose-500/60" : "text-emerald-400"}`}>
                          ${(t.burnUsd || 0).toLocaleString()}
                        </div>
                        {t.liquidity === 0 ? (
                          <div className="text-[10px] text-rose-400">
                            ⚠️ Paper Val
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-400/80">
                            Real Buyback
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-300">
                        ${fmtNum(t.priceUsd, 6)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {t.liquidity === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                            $0 (Paper Val)
                          </span>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-200">
                              ${fmtCompact(t.liquidity)}
                            </div>
                            <div className="text-[10px] text-emerald-400">
                              {t.liquidity >= 50000 ? "Deep Pool" : "Active Pool"}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://arc.etherscan.io/token/${t.contract}?a=0x000000000000000000000000000000000000dEaD`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded transition"
                            title="Verify on Arcscan"
                          >
                            <span>Scan ↗</span>
                          </a>

                          <a
                            href={t.pairUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded transition"
                            title="Trade on DexScreener"
                          >
                            <span>DEX ↗</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Architectural Trust Box (Exact match of bottom box in screenshot) */}
      <div className="card p-4 bg-[#0c121e] border-cyan-900/50 rounded-xl space-y-2">
        <div className="flex items-center gap-2 font-bold text-cyan-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>Arc L1 Launchpad & Real-Time Burn Architecture</span>
        </div>
        <div className="text-xs text-slate-300 font-mono space-y-1.5 pl-6">
          <div>
            1. <strong>Sub-Second Finality:</strong> Every swap and fee distribution completes in under 1 second thanks to Arc Malachite consensus.
          </div>
          <div>
            2. <strong>USDC Gas Native:</strong> All buybacks execute directly against USDC liquidity without needing intermediate bridge wrappers or extra gas tokens.
          </div>
          <div>
            3. <strong>Direct Dead Incineration:</strong> Any token transfer to <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">0x000000000000000000000000000000000000dEaD</code> is immediately irreversibly destroyed from the circulating supply.
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        txData={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
