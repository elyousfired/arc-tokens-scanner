import React from "react";
import { DailyBuybacksChart } from "../components/DailyBuybacksChart";
import { RecentBurnsTable } from "../components/RecentBurnsTable";
import { FlywheelSimulator } from "../components/FlywheelSimulator";
import { Zap, Coins, PieChart, ShieldCheck, Gift, Users } from "lucide-react";
import { fmtCompact } from "../lib/format";

export function FlywheelPage({ token }) {
  const symbol = token?.symbol || "ARGUS";
  const price = token?.basePrice || 0;
  const supply = token?.currentSupply || (token?.initialSupply || 1000000000);
  const burned = token?.totalBurned ?? 0;
  const burnedUsd = burned * price;
  const totalVol = token?.volume24h || 0;
  const dailyFees = (totalVol * (token?.feeRatePct || 1.0)) / 100;
  const burnPct = token?.feeDistribution?.burnPct || 50;
  const holdersPct = token?.feeDistribution?.holdersPct || 25;
  const rewardsPct = token?.feeDistribution?.rewardsPct || 15;
  const teamPct = token?.feeDistribution?.teamPct || 10;
  const dailyBuybackPressure = dailyFees * (burnPct / 100);

  // Quote asset fee sweeps for Arc L1 (USDC Native)
  const quoteAssetSweeps = [
    { asset: "USDC (Native)", amountUsd: dailyFees * 0.72, sharePct: 72.0, color: "#00f2fe" },
    { asset: "EURC (Circle)", amountUsd: dailyFees * 0.15, sharePct: 15.0, color: "#38bdf8" },
    { asset: "WETH (Arc Bridge)", amountUsd: dailyFees * 0.08, sharePct: 8.0, color: "#818cf8" },
    { asset: "AMM Hook Dual", amountUsd: dailyFees * 0.05, sharePct: 5.0, color: "#c084fc" },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-cyan-400" />
          {symbol} Flywheel & Burn Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Fee revenue → buybacks → burns. Powered directly by Arc L1 AMM Hooks with native USDC settlement.
        </p>
      </div>

      {/* Fee Split Explainer Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 uppercase font-mono">🔥 {burnPct}% On-Chain Burn</span>
            <span className="text-[10px] text-slate-400">Primary</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {fmtCompact(dailyBuybackPressure)} / day
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Directly swapped into ${symbol} and permanently incinerated to the dead contract address.
          </p>
        </div>

        <div className="card p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase font-mono">💰 {holdersPct}% Holders Yield</span>
            <span className="text-[10px] text-slate-400">Dividends</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {fmtCompact(dailyFees * (holdersPct / 100))} / day
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Redistributed proportionally to long-term ${symbol} holders directly in native USDC.
          </p>
        </div>

        <div className="card p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase font-mono">🎰 {rewardsPct}% SuperLotto</span>
            <span className="text-[10px] text-slate-400">Jackpot</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {fmtCompact(dailyFees * (rewardsPct / 100))} / day
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Accumulated into weekly decentralized prize pools for active community participants.
          </p>
        </div>

        <div className="card p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase font-mono">👥 {teamPct}% Infrastructure</span>
            <span className="text-[10px] text-slate-400">Ops</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {fmtCompact(dailyFees * (teamPct / 100))} / day
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Funds continuous RPC infrastructure, developer grants, and launchpad security audits.
          </p>
        </div>
      </section>

      {/* Section 1: Recent buyback spend by quote asset */}
      <section className="card p-5 border-slate-800 bg-[#111622]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-cyan-400" />
              Recent Buyback Spend by Quote Asset (Arc L1)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Which fee currencies the protocol swept and converted to ${symbol} for incineration
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Past 24h</span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-900 gap-[2px] p-0.5 border border-slate-800 my-4">
          {quoteAssetSweeps.map((s) => (
            <div
              key={s.asset}
              title={`${s.asset}: $${s.amountUsd.toLocaleString()}`}
              style={{ width: `${s.sharePct}%`, background: s.color }}
              className="transition-all"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {quoteAssetSweeps.map((s) => (
            <div key={s.asset} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="font-bold">{s.asset}</span>
              </div>
              <div className="text-base font-bold text-white mt-1.5">{fmtCompact(s.amountUsd)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{s.sharePct}% of buybacks</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Daily Buybacks & Burns Timeline + Recent Burns Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyBuybacksChart
          token={token}
          dailyBuybackPressure={dailyBuybackPressure}
          currentPrice={price}
          totalBurnedTokens={burned}
          totalBurnedUsd={burnedUsd}
        />

        <RecentBurnsTable
          token={token}
          burnWallet={token?.burnWallet}
        />
      </div>

      {/* Section 3: Interactive AMM Flywheel Simulator */}
      <FlywheelSimulator
        token={token}
        price={price}
        supply={supply}
        volume24h={totalVol}
      />
    </div>
  );
}
