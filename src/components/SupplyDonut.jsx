import React from "react";
import { CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";

export function SupplyDonut({
  token,
  burnedPct,
  burned,
  burnedUsd,
  supply,
  burnWalletPending,
  dailyFees,
  totalRevenue,
}) {
  const symbol = token?.symbol || "ARGUS";
  const color = token?.color || "#38bdf8";

  // Calculate live 24h revenue and cumulative total revenue
  const dailyRev = dailyFees != null 
    ? dailyFees 
    : Math.round(((token?.volume24h || 0) * (token?.feeRatePct || 1.0)) / 100);

  const burnShare = (token?.feeDistribution?.burnPct || 50) / 100;
  const cumRev = totalRevenue != null 
    ? totalRevenue 
    : Math.max(
        Math.round((burnedUsd || 0) / (burnShare > 0 ? burnShare : 1)),
        Math.round(dailyRev * 12)
      );

  return (
    <section className="card p-6 border-slate-800 bg-gradient-to-b from-[#111622] to-[#0c1018]">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1.2fr_1fr] gap-8 items-center">
        {/* Donut Gauge */}
        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={color}
                strokeWidth="10"
                strokeDasharray={`${Math.max(2, (burnedPct / 100) * 251.3)} 251.3`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold font-mono text-white leading-tight">
                {fmtNum(burnedPct, 2)}%
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                burned
              </span>
            </div>
          </div>

          <div>
            <div
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color }}
            >
              Structural · One-Way
            </div>
            <div className="text-lg font-bold text-white tracking-tight">
              Supply can only fall
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
              {fmtCompact(burned, "")} {symbol} permanently incinerated. Mint authority revoked.
            </p>
            {/* Revenue Highlights Badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                24h Rev: +${fmtCompact(dailyRev)}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold">
                Total: ${fmtCompact(cumRev)}
              </span>
            </div>
          </div>
        </div>

        {/* Numbers Table */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs border-y md:border-y-0 md:border-x border-slate-800/80 py-4 md:py-0 md:px-6">
          <dt className="text-slate-400">Initial supply</dt>
          <dd className="font-mono text-right font-medium text-slate-200">1.00B {symbol}</dd>

          <dt className="text-slate-400">Total burned</dt>
          <dd className="font-mono text-right font-semibold" style={{ color }}>
            {fmtCompact(burned, "")} {symbol} · {fmtCompact(burnedUsd)}
          </dd>

          <dt className="text-slate-400">Circulating supply</dt>
          <dd className="font-mono text-right font-medium text-slate-200">
            {fmtCompact(supply, "")} {symbol}
          </dd>

          {/* NEW: 24h Revenue Row */}
          <dt className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Revenue (Last 24h)
          </dt>
          <dd className="font-mono text-right font-bold text-emerald-400">
            +${fmtCompact(dailyRev)} USDC
          </dd>

          {/* NEW: Total Revenue Row */}
          <dt className="text-cyan-400 font-semibold flex items-center gap-1.5">
            Total Protocol Revenue
          </dt>
          <dd className="font-mono text-right font-bold text-cyan-400">
            ${fmtCompact(cumRev)} USDC
          </dd>

          <dt className="text-slate-400">Pending in burn wallet</dt>
          <dd className="font-mono text-right font-medium text-amber-400">
            {fmtCompact(burnWalletPending, "")} {symbol}
          </dd>

          <dt className="text-slate-400">Burn events recorded</dt>
          <dd className="font-mono text-right font-medium text-slate-200">
            {token?.burnWalletTxs ? (fmtCompact(token.burnWalletTxs, "") + "+ · 1 tx / " + (token?.burnWalletTxRateSec || 2.5) + "s") : "On-chain Arc L1 Dead Contract"}
          </dd>
        </dl>

        {/* Checkmarks & Revenue Badges */}
        <ul className="grid gap-2 text-xs">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200 font-medium">24h Revenue Generated</span>
            <span className="text-emerald-400 font-mono font-bold ml-auto">+${fmtCompact(dailyRev)} USDC</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-200 font-medium">All-Time Protocol Revenue</span>
            <span className="text-cyan-400 font-mono font-bold ml-auto">${fmtCompact(cumRev)} USDC</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-slate-300">Fixed initial supply</span>
            <span className="text-slate-500 font-mono ml-auto">1.00B minted once</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-slate-300">Mint authority renounced</span>
            <span className="text-slate-500 font-mono ml-auto">No new supply, ever</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-slate-300">Arc L1 AMM Hooks</span>
            <span className="text-slate-500 font-mono ml-auto">100% USDC-Native</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
