import React from "react";
import { Zap, Flame, ArrowUpRight, TrendingUp, Layers, Coins } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";

export function AllTokensHub({ tokens, onSelectToken }) {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-cyan-400" />
          Arc L1 Launchpad Multi-Token Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Comparative live dashboard across all 4 flagship launchpad tokens running on Arc L1 with USDC-native settlement.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tokens.map((t) => {
          const burnedPct = (t.totalBurned / t.initialSupply) * 100;
          return (
            <div
              key={t.id}
              className="card p-5 border-slate-800 bg-[#111622] hover:border-cyan-500/50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className="font-bold text-white text-base font-mono">${t.symbol}</div>
                      <div className="text-[11px] text-slate-400">{t.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                    {t.tag}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Spot Price (USDC)</div>
                  <div className="text-xl font-extrabold font-mono text-white mt-0.5">
                    ${fmtNum(t.basePrice, 4)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">Market Cap</div>
                    <div className="font-bold text-slate-200 mt-0.5">{fmtCompact(t.marketCap)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">24h Volume</div>
                    <div className="font-bold text-slate-200 mt-0.5">{fmtCompact(t.volume24h)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Burned Supply</div>
                    <div className="font-bold text-orange-400 mt-0.5">{fmtNum(burnedPct, 2)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Pool Liquidity</div>
                    <div className="font-bold text-slate-200 mt-0.5">{fmtCompact(t.liquidity)}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectToken(t)}
                className="mt-5 w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Full Ember-Style Suite →</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Cross-Token Comparison Table */}
      <div className="card p-6 border-slate-800 bg-[#111622] overflow-x-auto">
        <h2 className="text-sm font-bold text-white mb-4">Benchmark Comparison Table</h2>
        <table className="w-full text-xs text-left font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-medium">Token</th>
              <th className="pb-3 text-right font-medium">Spot Price</th>
              <th className="pb-3 text-right font-medium">Market Cap</th>
              <th className="pb-3 text-right font-medium">24h Volume</th>
              <th className="pb-3 text-right font-medium">Burn %</th>
              <th className="pb-3 text-right font-medium">Daily Buybacks</th>
              <th className="pb-3 text-right font-medium">Pool Liquidity</th>
              <th className="pb-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {tokens.map((t) => {
              const burnedPct = (t.totalBurned / t.initialSupply) * 100;
              const dailyFees = (t.volume24h * (t.feeRatePct || 1.0)) / 100;
              const dailyBuybacks = dailyFees * ((t.feeDistribution?.burnPct || 50) / 100);

              return (
                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{t.icon}</span>
                      <div>
                        <div className="font-bold text-white">${t.symbol}</div>
                        <div className="text-[10px] text-slate-400">{t.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right font-bold text-white">${fmtNum(t.basePrice, 4)}</td>
                  <td className="py-3 text-right font-semibold text-slate-200">{fmtCompact(t.marketCap)}</td>
                  <td className="py-3 text-right text-slate-200">{fmtCompact(t.volume24h)}</td>
                  <td className="py-3 text-right font-bold text-orange-400">{fmtNum(burnedPct, 2)}%</td>
                  <td className="py-3 text-right font-semibold text-green-400">${fmtCompact(dailyBuybacks)}</td>
                  <td className="py-3 text-right text-slate-300">{fmtCompact(t.liquidity)}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onSelectToken(t)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold transition cursor-pointer"
                    >
                      Audit →
                    </button>
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
