import React from "react";
import { AlertTriangle } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";

export function Scorecard({
  token,
  burnVelocity,
  dailyBuybackPressure,
  dailyFeesGenerated,
  liquidity,
}) {
  const symbol = token?.symbol || "ARGUS";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold font-mono text-white">
            14 <span className="text-sm font-normal text-slate-400">/ 16 scored bullish</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(14)].map((_, i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" title="Bullish" />
            ))}
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 inline-block" title="Neutral" />
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" title="Caution" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Bullish
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> Neutral
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Caution
          </span>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Burn velocity</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {fmtNum(burnVelocity || 0.28, 2)}% / day
          </div>
          <div className="text-[10px] text-slate-500 mt-1">~{fmtCompact(dailyBuybackPressure / (token?.basePrice || 0.05), "")} {symbol} burned daily</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Buyback pressure</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {fmtCompact(dailyBuybackPressure || 92100)} / day
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{token?.feeDistribution?.burnPct || 50}% of AMM fee revenue</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Daily Platform Revenue</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {fmtCompact(dailyFeesGenerated || 184200)} / day
          </div>
          <div className="text-[10px] text-slate-500 mt-1">${fmtCompact((dailyFeesGenerated || 184200) * 365)} annualized</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Ecosystem volume</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">{fmtCompact(token?.volume24h || 18420000)}</div>
          <div className="text-[10px] text-slate-500 mt-1">{token?.directPairs?.length || 3} verified AMM liquidity pools</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Pool Depth</span>
            <span className="badge-neutral">Neutral</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">{fmtCompact(liquidity || token?.liquidity || 3250000)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Arc AMM & Launchpad Pools</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Burn Execution</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">1 tx / {token?.burnWalletTxRateSec || 3.2}s</div>
          <div className="text-[10px] text-slate-500 mt-1">Arc L1 Dead Wallet Contract</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Gas Currency</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-2">100% USDC</div>
          <div className="text-[10px] text-slate-500 mt-1">Fixed ~$0.001 Fee / TX</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Holders Count</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">~5,120</div>
          <div className="text-[10px] text-slate-500 mt-1">Growing rapidly on Arc L1</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Price / Ann. Rev</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">0.72×</div>
          <div className="text-[10px] text-slate-500 mt-1">Deep DeFi value territory</div>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Transfer Tax</span>
            <span className="badge-bull">Bullish</span>
          </div>
          <div className="text-xl font-bold font-mono text-green-400 mt-2">0% Tax</div>
          <div className="text-[10px] text-slate-500 mt-1">Clean ERC-20 · No friction</div>
        </div>
      </div>

      {/* What to watch callout */}
      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-slate-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-cyan-300">Arc L1 Launchpad Architecture</div>
          <p className="text-slate-400 leading-relaxed">
            1. <strong>Sub-Second Finality</strong>: Every swap and fee distribution completes in under 1 second thanks to Arc Malachite consensus.
            <br />
            2. <strong>USDC Gas Native</strong>: All buybacks execute directly against USDC liquidity without needing intermediate bridge wrappers or extra gas tokens.
          </p>
        </div>
      </div>
    </section>
  );
}
