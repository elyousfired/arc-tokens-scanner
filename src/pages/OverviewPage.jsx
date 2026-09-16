import React from "react";
import { SupplyDonut } from "../components/SupplyDonut";
import { Scorecard } from "../components/Scorecard";
import { PriceCandleChart } from "../components/PriceCandleChart";
import { DailyBuybacksChart } from "../components/DailyBuybacksChart";
import { RecentBurnsTable } from "../components/RecentBurnsTable";
import { FlywheelSimulator } from "../components/FlywheelSimulator";
import { TradingPairsTable } from "../components/TradingPairsTable";

export function OverviewPage({ token, onNavigate }) {
  const price = token?.basePrice || 0;
  const priceChange = token?.priceChanges?.h24 ? parseFloat(token.priceChanges.h24) : 0;
  const supply = token?.currentSupply || 934250000;
  const burned = token?.totalBurned || 65750000;
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

      {/* 3. Price Chart */}
      <PriceCandleChart
        token={token}
        currentPrice={price}
        priceChange={priceChange}
      />

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
