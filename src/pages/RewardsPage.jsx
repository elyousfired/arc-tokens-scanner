import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Gift, DollarSign, Percent, Users, Calculator } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";

export function RewardsPage({ token }) {
  const [holdingAmount, setHoldingAmount] = useState(25000);
  const symbol = token?.symbol || "ARGUS";
  const price = token?.basePrice || 0.0482;
  const currentSupply = token?.currentSupply || 934250000;
  const totalVol = token?.volume24h || 18420000;
  const dailyFees = (totalVol * (token?.feeRatePct || 1.0)) / 100;
  const holdersSharePct = (token?.feeDistribution?.holdersPct || 25) / 100;
  const dailyPool = dailyFees * holdersSharePct;

  // Holding share calculation
  const holdingShare = holdingAmount / currentSupply;
  const dailyPayout = dailyPool * holdingShare;
  const monthlyPayout = dailyPayout * 30;
  const annualPayout = dailyPayout * 365;
  const holdingValue = holdingAmount * price;
  const apy = holdingValue > 0 ? (annualPayout / holdingValue) * 100 : 38.5;

  const payoutsHistory = [
    { date: "Day -4", payout: dailyPool * 0.85 },
    { date: "Day -3", payout: dailyPool * 0.92 },
    { date: "Day -2", payout: dailyPool * 1.15 },
    { date: "Day -1", payout: dailyPool * 1.04 },
    { date: "Today", payout: dailyPool },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Gift className="w-6 h-6 text-emerald-400" />
          {symbol} Holders Yield & Rewards
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {token?.feeDistribution?.holdersPct || 25}% of all Arc L1 launchpad & AMM hook swap fees are streamed directly to ${symbol} holders in native USDC.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Today's Reward Pool
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
            {fmtCompact(dailyPool)}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            {token?.feeDistribution?.holdersPct || 25}% of protocol fees
          </div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
            Real APR / Yield
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
            {fmtNum(apy, 1)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">100% in native USDC</div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            Eligible Wallets
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
            ~3,840
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Non-DEX holder balance</div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            SuperLotto Pool
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
            {fmtCompact(dailyFees * 0.15 * 7)}
          </div>
          <div className="text-[11px] text-amber-400 font-mono mt-1">Weekly community jackpot</div>
        </div>
      </div>

      {/* Interactive Yield Calculator */}
      <div className="card p-6 border-slate-800 bg-[#111622]">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Interactive Dividend Calculator</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Enter your ${symbol} balance to simulate your exact share of automated daily and monthly USDC payouts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-400">Tokens You Hold</span>
              <span className="text-cyan-400 font-bold">{fmtCompact(holdingAmount, "")} {symbol} (~${fmtNum(holdingValue, 2)} USDC)</span>
            </div>
            <input
              type="range"
              min="1000"
              max="500000"
              step="1000"
              value={holdingAmount}
              onChange={(e) => setHoldingAmount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1K {symbol}</span>
              <span>250K {symbol}</span>
              <span>500K {symbol}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-center">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Daily Payback</div>
              <div className="text-base font-bold text-green-400 mt-1">${fmtNum(dailyPayout, 2)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">USDC</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Monthly Payback</div>
              <div className="text-base font-bold text-emerald-400 mt-1">${fmtNum(monthlyPayout, 2)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">USDC</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Annual Est.</div>
              <div className="text-base font-bold text-cyan-400 mt-1">${fmtNum(annualPayout, 2)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">USDC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards History Bar Chart */}
      <div className="card p-5 border-slate-800 bg-[#111622]">
        <h2 className="text-sm font-bold text-white mb-1">Daily Distributed USDC Payouts</h2>
        <p className="text-xs text-slate-400 mb-4">Historical streaming distributions from Arc AMM fee vaults</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payoutsHistory}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111622", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v) => [`$${Number(v).toLocaleString()} USDC`, "Holder Distribution"]}
              />
              <Bar dataKey="payout" fill="#10b981" radius={[4, 4, 0, 0]}>
                {payoutsHistory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === payoutsHistory.length - 1 ? "#34d399" : "#059669"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
