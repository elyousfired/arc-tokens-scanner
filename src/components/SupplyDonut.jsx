import React from "react";
import { CheckCircle2 } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";

export function SupplyDonut({
  token,
  burnedPct,
  burned,
  burnedUsd,
  supply,
  burnWalletPending,
}) {
  const symbol = token?.symbol || "ARGUS";
  const color = token?.color || "#38bdf8";

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
          <dt className="text-slate-400">Pending in burn wallet</dt>
          <dd className="font-mono text-right font-medium text-amber-400">
            {fmtCompact(burnWalletPending, "")} {symbol}
          </dd>
          <dt className="text-slate-400">Burn events recorded</dt>
          <dd className="font-mono text-right font-medium text-slate-200">
            {token?.burnWalletTxs ? (fmtCompact(token.burnWalletTxs, "") + "+ · 1 tx / " + (token?.burnWalletTxRateSec || 2.5) + "s") : "On-chain Arc L1 Dead Contract"}
          </dd>
        </dl>

        {/* Checkmarks */}
        <ul className="grid gap-2 text-xs">
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
            <span className="text-slate-300">Freeze authority renounced</span>
            <span className="text-slate-500 font-mono ml-auto">No wallet freeze</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-slate-300">Arc L1 AMM Hooks</span>
            <span className="text-slate-500 font-mono ml-auto">100% USDC-Native</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-slate-300">0% DEX transfer tax</span>
            <span className="text-slate-500 font-mono ml-auto">Standard ERC-20</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
