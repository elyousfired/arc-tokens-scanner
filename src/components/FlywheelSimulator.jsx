import React, { useState, useMemo } from "react";
import { Sliders, Flame, ArrowUpRight, DollarSign } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";

export function FlywheelSimulator({ token, price, supply, volume24h }) {
  const [growthPerDay, setGrowthPerDay] = useState(10);
  const [horizonDays, setHorizonDays] = useState(7);
  const [poolDepth, setPoolDepth] = useState(token?.liquidity || 3250000);

  const symbol = token?.symbol || "ARGUS";
  const baseP = price || token?.basePrice || 0.0482;
  const currentSupply = supply || token?.currentSupply || 934250000;
  const vol = volume24h || token?.volume24h || 18420000;

  const sim = useMemo(() => {
    const dailyBaseRev = vol * (token?.feeRatePct ? token.feeRatePct / 100 : 0.01);
    const buybackRatio = (token?.feeDistribution?.burnPct || 50) / 100;

    let totalRevenue = 0;
    let currDailyRev = dailyBaseRev;

    for (let d = 0; d < horizonDays; d++) {
      totalRevenue += currDailyRev;
      currDailyRev *= 1 + growthPerDay / 100;
    }

    const totalBuybacks = totalRevenue * buybackRatio;
    const avgPrice = baseP * 1.08;
    const tokensRemoved = totalBuybacks / avgPrice;
    const supplyCutPct = (tokensRemoved / currentSupply) * 100;

    const floorPrice = baseP * (currentSupply / Math.max(1, currentSupply - tokensRemoved));
    const ceilingMultiplier = 1 + (totalBuybacks / Math.max(1, poolDepth)) * 3.5;
    const ceilingPrice = baseP * ceilingMultiplier;

    return {
      totalRevenue,
      totalBuybacks,
      tokensRemoved,
      supplyCutPct,
      floorPrice,
      ceilingPrice,
    };
  }, [baseP, currentSupply, vol, growthPerDay, horizonDays, poolDepth, token]);

  return (
    <section className="card p-6 border-slate-800 bg-[#111622]" id="simulator">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Arc AMM Flywheel Projection Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Models algorithmic supply reduction and price floor expansion via Arc L1 AMM Hooks.
          </p>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-1 rounded">
          Interactive Quantitative Model
        </span>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
        <div>
          <div className="flex justify-between font-mono mb-1.5">
            <span className="text-slate-400">Daily Volume Growth</span>
            <span className="text-cyan-400 font-bold">{growthPerDay}%</span>
          </div>
          <input
            type="range"
            min="-20"
            max="50"
            value={growthPerDay}
            onChange={(e) => setGrowthPerDay(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono mb-1.5">
            <span className="text-slate-400">Time Horizon</span>
            <span className="text-cyan-400 font-bold">{horizonDays} days</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={horizonDays}
            onChange={(e) => setHorizonDays(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono mb-1.5">
            <span className="text-slate-400">Target Pool Depth (USDC)</span>
            <span className="text-cyan-400 font-bold">{fmtCompact(poolDepth)}</span>
          </div>
          <input
            type="range"
            min="500000"
            max="15000000"
            step="250000"
            value={poolDepth}
            onChange={(e) => setPoolDepth(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Output Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-xs font-mono">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Total Protocol Rev</div>
          <div className="text-sm font-bold text-white mt-1">{fmtCompact(sim.totalRevenue)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Over {horizonDays}d</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Buybacks & Burns</div>
          <div className="text-sm font-bold text-cyan-400 mt-1">{fmtCompact(sim.totalBuybacks)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{token?.feeDistribution?.burnPct || 50}% of fees</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Tokens Incinerated</div>
          <div className="text-sm font-bold text-orange-400 mt-1">{fmtCompact(sim.tokensRemoved, "")} {symbol}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Permanent reduction</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Supply Cut Rate</div>
          <div className="text-sm font-bold text-green-400 mt-1">{fmtNum(sim.supplyCutPct, 2)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Of circulating supply</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Model Floor Price</div>
          <div className="text-sm font-bold text-white mt-1">${fmtNum(sim.floorPrice, 4)}</div>
          <div className="text-[10px] text-green-400 mt-0.5">
            +{fmtNum(((sim.floorPrice - baseP) / baseP) * 100, 1)}% floor
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Projected Target</div>
          <div className="text-sm font-bold text-cyan-300 mt-1">${fmtNum(sim.ceilingPrice, 4)}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">
            +{fmtNum(((sim.ceilingPrice - baseP) / baseP) * 100, 1)}% upside
          </div>
        </div>
      </div>
    </section>
  );
}
