import React from "react";
import { Coins, ExternalLink } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";

export function TradingPairsTable({ token, pairs = [] }) {
  const symbol = token?.symbol || "ARGUS";
  const displayPairs = pairs.length > 0 ? pairs : (token?.directPairs || []);

  return (
    <section className="card p-6 border-slate-800 bg-[#111622]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-cyan-400" />
            {symbol} Official Liquidity & Trading Pools
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active AMM pools routed through Arc L1 sub-second settlement.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
          {displayPairs.length} Active Pools
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-medium">#</th>
              <th className="pb-3 font-medium">Pool Pair</th>
              <th className="pb-3 font-medium">DEX / Venue</th>
              <th className="pb-3 text-right font-medium">Price (USDC)</th>
              <th className="pb-3 text-right font-medium">24h Volume</th>
              <th className="pb-3 text-right font-medium">Fees Accrued</th>
              <th className="pb-3 text-right font-medium">Liquidity</th>
              <th className="pb-3 text-right font-medium">Explorer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {displayPairs.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="py-3 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                <td className="py-3">
                  <span className="font-bold text-white text-sm">{p.pair}</span>
                </td>
                <td className="py-3 text-slate-400">{p.dex}</td>
                <td className="py-3 text-right text-slate-200">
                  ${fmtNum(token?.basePrice || 0.0482, 4)}
                </td>
                <td className="py-3 text-right font-semibold text-white">
                  {fmtCompact(p.volume24h)}
                </td>
                <td className="py-3 text-right text-green-400">
                  ${fmtNum(p.fees, 0)}
                </td>
                <td className="py-3 text-right text-slate-400">
                  {fmtCompact(p.liquidity)}
                </td>
                <td className="py-3 text-right">
                  <a
                    href="https://testnet.arcscan.app"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                  >
                    Arcscan <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
