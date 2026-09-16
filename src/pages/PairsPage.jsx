import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Coins, ExternalLink } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";
import { TradingPairsTable } from "../components/TradingPairsTable";

export function PairsPage({ token }) {
  const symbol = token?.symbol || "ARGUS";
  const totalVol = token?.volume24h || 18420000;

  const categoryData = [
    { name: "USDC Native", volume: totalVol * 0.70, fill: "#00f2fe" },
    { name: "Cross AMM", volume: totalVol * 0.20, fill: "#38bdf8" },
    { name: "Bridge (WETH)", volume: totalVol * 0.10, fill: "#818cf8" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Coins className="w-6 h-6 text-cyan-400" />
          {symbol} AMM Trading Pairs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Liquidity pools and market pairs routing through Arc L1 sub-second AMM ·{" "}
          <span className="text-white font-mono font-medium">{fmtCompact(totalVol)} 24h volume</span>
        </p>
      </div>

      {/* Volume by Category Bar Chart */}
      <div className="card p-5 border-slate-800 bg-[#111622]">
        <h2 className="text-sm font-bold text-white mb-1">Volume by DEX & Asset Type</h2>
        <p className="text-xs text-slate-400 mb-4">
          Breakdown of 24h trading volume across Arc liquidity venues
        </p>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 80, right: 30 }}>
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111622", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v) => [`$${Number(v).toLocaleString()} USD`, "24h Volume"]}
              />
              <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pairs Table Component */}
      <TradingPairsTable token={token} />
    </div>
  );
}
