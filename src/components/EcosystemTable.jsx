import React from "react";
import { Layers, ExternalLink } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";

export function EcosystemTable({ token, ecosystemPairs = [] }) {
  const symbol = token?.symbol || "ARGUS";
  const pairs = ecosystemPairs.length > 0 ? ecosystemPairs : (token?.ecosystemPairs || []);

  return (
    <section className="card p-6 border-slate-800 bg-[#111622]" id="ecosystem">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Tokens Quoted & Launched in {symbol}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            New tokens launched on Arc L1 pairing with ${symbol}. Their AMM hook swap fees contribute directly to ${symbol} burns.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
          {pairs.length} ecosystem projects
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono">
              <th className="pb-3 font-medium">#</th>
              <th className="pb-3 font-medium">Token</th>
              <th className="pb-3 font-medium">Pair</th>
              <th className="pb-3 text-right font-medium">Price USD</th>
              <th className="pb-3 text-right font-medium">24h Vol</th>
              <th className="pb-3 text-right font-medium">Market Cap</th>
              <th className="pb-3 text-right font-medium">Liquidity</th>
              <th className="pb-3 text-right font-medium">Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono">
            {pairs.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="py-3 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                <td className="py-3">
                  <div className="font-bold text-white text-sm">{p.symbol}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{p.name}</div>
                </td>
                <td className="py-3">
                  <span className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded text-[11px]">
                    {p.symbol}/{symbol}
                  </span>
                </td>
                <td className="py-3 text-right text-slate-200">
                  ${fmtNum(p.priceUsd || 0.0050, 4)}
                </td>
                <td className="py-3 text-right font-semibold text-white">
                  {fmtCompact(p.volume24h)}
                </td>
                <td className="py-3 text-right text-slate-300">
                  {fmtCompact(p.marketCap || (p.volume24h * 2))}
                </td>
                <td className="py-3 text-right text-slate-400">
                  {fmtCompact(p.liquidity)}
                </td>
                <td className="py-3 text-right">
                  <a
                    href="https://arc.etherscan.io"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded transition"
                  >
                    Arc AMM ↗
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
