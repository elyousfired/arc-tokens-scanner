import React, { useState } from "react";
import { Coins, Search, ExternalLink, Filter } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";

export function TokensPage({ token }) {
  const symbol = token?.symbol || "ARGUS";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("volume24h");

  const ecosystemTokens = (token?.ecosystemPairs && token.ecosystemPairs.length > 0)
    ? token.ecosystemPairs
    : [
        { symbol: "APUMP", name: "AstraPump Meme", volume24h: 1650000, marketCap: 3800000, liquidity: 140000, priceUsd: 0.0038, priceChange24h: 42.1 },
        { symbol: "SHARC", name: "Sharc Ecosystem", volume24h: 890000, marketCap: 2100000, liquidity: 85000, priceUsd: 0.0084, priceChange24h: 18.5 },
        { symbol: "ALPHA", name: "Arc Alpha Meme", volume24h: 420000, marketCap: 950000, liquidity: 45000, priceUsd: 0.0019, priceChange24h: -4.2 },
        { symbol: "DOGEARC", name: "Arc Doge", volume24h: 2850000, marketCap: 6400000, liquidity: 290000, priceUsd: 0.0064, priceChange24h: 68.2 },
        { symbol: "PEPEUSDC", name: "USDC Pepe", volume24h: 1940000, marketCap: 4500000, liquidity: 180000, priceUsd: 0.0045, priceChange24h: 12.0 },
      ];

  const filteredTokens = ecosystemTokens
    .filter(
      (t) =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-cyan-400" />
            Tokens Quoted in {symbol}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Projects deployed via Arc Launchpad pairing directly with ${symbol}. Swap fees burn ${symbol}.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search token name or symbol..."
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
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`px-3 py-1 rounded-md transition ${
              sortBy === s.key ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
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
              <th className="pb-3 font-medium">Token</th>
              <th className="pb-3 font-medium">Pair</th>
              <th className="pb-3 text-right font-medium">Price (USDC)</th>
              <th className="pb-3 text-right font-medium">24h Change</th>
              <th className="pb-3 text-right font-medium">24h Vol</th>
              <th className="pb-3 text-right font-medium">Market Cap</th>
              <th className="pb-3 text-right font-medium">Liquidity</th>
              <th className="pb-3 text-right font-medium">Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredTokens.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="py-3 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                <td className="py-3">
                  <div className="font-bold text-white text-sm">{t.symbol}</div>
                  <div className="text-[10px] text-slate-400">{t.name}</div>
                </td>
                <td className="py-3">
                  <span className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded text-[11px]">
                    {t.symbol}/{symbol}
                  </span>
                </td>
                <td className="py-3 text-right text-slate-200">${fmtNum(t.priceUsd || 0.005, 4)}</td>
                <td className={`py-3 text-right font-semibold ${(t.priceChange24h || 10) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {(t.priceChange24h || 10) >= 0 ? `+${t.priceChange24h || 10}%` : `${t.priceChange24h}%`}
                </td>
                <td className="py-3 text-right font-semibold text-white">{fmtCompact(t.volume24h)}</td>
                <td className="py-3 text-right text-slate-300">{fmtCompact(t.marketCap || t.volume24h * 2)}</td>
                <td className="py-3 text-right text-slate-400">{fmtCompact(t.liquidity || 100000)}</td>
                <td className="py-3 text-right">
                  <a
                    href="https://testnet.arcscan.app"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 rounded transition"
                  >
                    Swap ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
