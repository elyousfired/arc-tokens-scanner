import React, { useState } from "react";
import { Rocket, CheckCircle2, Clock, ArrowUpRight, Filter } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";

import { INITIAL_TOKENS } from "../data/tokens";

export function LaunchesPage({ token, allTokens }) {
  const symbol = token?.symbol || "ARGUS";
  const [filterStatus, setFilterStatus] = useState("all");

  const sourceTokens = allTokens && allTokens.length > 0 ? allTokens : INITIAL_TOKENS;
  const launches = sourceTokens.map((t) => ({
    name: t.name,
    symbol: t.symbol,
    icon: t.icon,
    contract: t.contract,
    createdAgo: t.symbol === "WARP" ? "1h ago" : t.symbol === "ELLIPS" ? "2d ago" : t.symbol === "ARGUS" ? "3d ago" : "4d ago",
    bondingProgress: t.curveProgress || 100,
    graduated: (t.curveProgress || 100) >= 100,
    mcap: t.marketCap,
    volume24h: t.volume24h,
    creator: `${t.contract.slice(0, 6)}...${t.contract.slice(-4)}`,
    dexTarget: t.dex || "Arc L1 AMM Hooks",
    url: `https://arc.etherscan.io/token/${t.contract}`,
  }));

  const filtered = launches.filter((l) => {
    if (filterStatus === "graduated") return l.graduated;
    if (filterStatus === "bonding") return !l.graduated;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Rocket className="w-6 h-6 text-cyan-400" />
          Arc L1 Launchpad & Bonding Curves
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time tracking of new token launches and automatic graduation to decentralized AMM pools at $69K USDC market cap.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        {[
          { key: "all", label: "All Launches" },
          { key: "graduated", label: "Graduated to AMM (100%)" },
          { key: "bonding", label: "Bonding Curves In Progress" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 rounded-md transition ${
              filterStatus === f.key
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of launch cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((l, idx) => (
          <div key={idx} className="card p-5 border-slate-800 bg-[#111622] space-y-4 hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base font-mono">{l.symbol}</span>
                  {l.graduated ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 font-bold font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Graduated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold font-mono">
                      <Clock className="w-3 h-3" /> Bonding
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{l.name}</div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{l.createdAgo}</span>
            </div>

            {/* Bonding Curve Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Curve Progress</span>
                <span className={l.graduated ? "text-green-400 font-bold" : "text-cyan-400 font-bold"}>
                  {l.bondingProgress}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    l.graduated ? "bg-green-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"
                  }`}
                  style={{ width: `${l.bondingProgress}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
              <div>
                <div className="text-[10px] text-slate-500">Market Cap</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{fmtCompact(l.mcap)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">24h Volume</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{fmtCompact(l.volume24h)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-2 text-slate-500">
              <span>Venue: {l.dexTarget}</span>
              <a
                href={l.url || `https://arc.etherscan.io/token/${l.contract}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                Arcscan ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
