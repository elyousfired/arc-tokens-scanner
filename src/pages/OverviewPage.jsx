import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { SupplyDonut } from "../components/SupplyDonut";
import { Scorecard } from "../components/Scorecard";
import { PriceCandleChart } from "../components/PriceCandleChart";
import { DailyBuybacksChart } from "../components/DailyBuybacksChart";
import { RecentBurnsTable } from "../components/RecentBurnsTable";
import { FlywheelSimulator } from "../components/FlywheelSimulator";
import { TradingPairsTable } from "../components/TradingPairsTable";
import { RevenueVaultsCard } from "../components/RevenueVaultsCard";

export function OverviewPage({ token, onNavigate }) {
  const price = token?.basePrice || 0;
  const priceChange = token?.priceChanges?.h24 ? parseFloat(token.priceChanges.h24) : 0;
  const supply = token?.currentSupply || (token?.initialSupply || 1000000000);
  const burned = token?.totalBurned ?? 0;
  const burnedPct = (burned / (token?.initialSupply || 1000000000)) * 100;
  const burnedUsd = burned * price;
  const vol24h = token?.volume24h || 0;
  const liquidity = token?.liquidity || 0;
  const burnWalletPending = token?.pendingBurn || 0;
  const dailyFees = (vol24h * (token?.feeRatePct || 1.0)) / 100;
  const dailyBuybackPressure = dailyFees * ((token?.feeDistribution?.burnPct || 50) / 100);
  const burnVelocity = price > 0 && supply > 0 ? (((dailyBuybackPressure / price) / supply) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. Supply & Burn Donut (Prominent Hero) */}
      <SupplyDonut
        token={token}
        burnedPct={burnedPct}
        burned={burned}
        burnedUsd={burnedUsd}
        supply={supply}
        burnWalletPending={burnWalletPending}
      />

      {/* 2. Bullish Scorecard */}
      <Scorecard
        token={token}
        burnVelocity={burnVelocity}
        dailyBuybackPressure={dailyBuybackPressure}
        dailyFeesGenerated={dailyFees}
        liquidity={liquidity}
      />

      {/* 🔮 AI On-Chain Viability & Success Radar Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#121028] to-slate-900 border border-purple-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">
                🔬 AI On-Chain Viability & Success Radar
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold">
                Deep Audit Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore ${token?.symbol}'s complete economic mechanism, anti-dump creator allocation, and calculated success probability.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate("ai-audit")}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20 shrink-0 cursor-pointer"
        >
          <span>Open Deep AI Audit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Price Chart */}
      <PriceCandleChart
        token={token}
        currentPrice={price}
        priceChange={priceChange}
      />

      {/* 3.5. On-Chain Revenue & Creator Earnings Matrix */}
      <RevenueVaultsCard token={token} />

      {/* 4. Timeline Chart & Recent Burns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="burns">
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
          onNavigate={onNavigate}
        />
      </div>

      {/* 5. Flywheel Simulator */}
      <FlywheelSimulator
        token={token}
        price={price}
        supply={supply}
        volume24h={vol24h}
      />

      {/* 6. Official Trading Pools Table */}
      <TradingPairsTable token={token} />
    </div>
  );
}
