import React, { useState } from "react";
import { Coins, Search, ExternalLink, Filter, ShieldCheck, Copy, Check } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";
import { INITIAL_TOKENS } from "../data/tokens";

export function TokensPage({ token, allTokens, onSelectToken }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("volume24h");
  const [copiedContract, setCopiedContract] = useState(null);

  const copyContract = (contract, id) => {
    navigator.clipboard.writeText(contract);
    setCopiedContract(id);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  const tokenList = allTokens && allTokens.length > 0 ? allTokens : INITIAL_TOKENS;
  const filteredTokens = tokenList
    .filter(
      (t) =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contract?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-cyan-400" />
            Verified Arc L1 Ecosystem Tokens
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official launchpad and protocol tokens deployed natively on Arc L1 with sub-second USDC settlement.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search token or contract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111622] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
          />
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono pb-1">
        <span className="text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> Sort:
        </span>
        {[
          { key: "volume24h", label: "Volume 24h" },
          { key: "marketCap", label: "Market Cap" },
          { key: "liquidity", label: "Liquidity" },
          { key: "totalBurned", label: "Total Burned" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`px-3 py-1 rounded-md transition ${
              sortBy === s.key
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tokens Table */}
      <div className="card p-5 border-slate-800 bg-[#111622] overflow-x-auto">
        <table className="w-full text-xs text-left font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-medium">#</th>
              <th className="pb-3 font-medium">Token Name</th>
              <th className="pb-3 font-medium">Contract Address</th>
              <th className="pb-3 text-right font-medium">Price (USDC)</th>
              <th className="pb-3 text-right font-medium">24h Change</th>
              <th className="pb-3 text-right font-medium">24h Volume</th>
              <th className="pb-3 text-right font-medium">Market Cap</th>
              <th className="pb-3 text-right font-medium">Burned Supply</th>
              <th className="pb-3 text-right font-medium">Explorer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredTokens.map((t, idx) => {
              const burnedPct = (t.totalBurned / t.initialSupply) * 100;
              const chg = t.priceChanges?.h24 ? parseFloat(t.priceChanges.h24) : 0;
              return (
                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                  <td className="py-3">
                    <button
                      onClick={() => onSelectToken && onSelectToken(t)}
                      className="flex items-center gap-2 text-left hover:opacity-80 transition cursor-pointer"
                    >
                      <span className="text-lg">{t.icon}</span>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          ${t.symbol}
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                            Verified
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">{t.name}</div>
                      </div>
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300 select-all font-mono text-[11px]">
                        {t.contract.slice(0, 6)}...{t.contract.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyContract(t.contract, t.id)}
                        className="text-slate-500 hover:text-cyan-400 p-0.5 cursor-pointer"
                        title="Copy Contract"
                      >
                        {copiedContract === t.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 text-right text-white font-bold">${fmtNum(t.basePrice, 4)}</td>
                  <td className={`py-3 text-right font-semibold ${chg >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {chg >= 0 ? `+${fmtNum(chg, 1)}%` : `${fmtNum(chg, 1)}%`}
                  </td>
                  <td className="py-3 text-right font-semibold text-white">{fmtCompact(t.volume24h)}</td>
                  <td className="py-3 text-right text-slate-200">{fmtCompact(t.marketCap)}</td>
                  <td className="py-3 text-right text-orange-400 font-semibold">{fmtNum(burnedPct, 2)}%</td>
                  <td className="py-3 text-right">
                    <a
                      href={`https://arc.etherscan.io/token/${t.contract}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded transition"
                    >
                      Arcscan <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
