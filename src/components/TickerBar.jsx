import React from "react";
import { fmtNum, fmtCompact } from "../lib/format";

export function TickerBar({
  token,
  price,
  priceChange,
  mcap,
  vol24h,
  burnedPct,
  liquidity,
  burnWalletPending,
  dailyFees,
}) {
  const symbol = token?.symbol || "ARGUS";
  const p = price || token?.basePrice || 0;
  const chg = priceChange !== undefined && priceChange !== null ? priceChange : (token?.priceChanges?.h24 ? parseFloat(token.priceChanges.h24) : 0);
  const mc = mcap || token?.marketCap || 0;
  const vol = vol24h || token?.volume24h || 0;
  const bpct = burnedPct !== undefined && !isNaN(burnedPct) ? burnedPct : (token?.initialSupply ? (token.totalBurned / token.initialSupply * 100) : 0);
  const liq = liquidity || token?.liquidity || 0;
  const pending = burnWalletPending || token?.pendingBurn || 0;
  const fees = dailyFees || (vol * (token?.feeRatePct || 1.0) / 100);

  return (
    <div className="border-b border-slate-800/80 bg-slate-950/60 text-xs py-2 px-4 sm:px-6 overflow-x-auto select-none">
      <div className="max-w-7xl mx-auto ticker !gap-6 flex items-center">
        <span>
          <span className="k">{symbol}/USDC</span>
          <b>${fmtNum(p, 4)}</b>
          <span className={chg >= 0 ? "text-up font-semibold" : "text-down font-semibold"}>
            {chg >= 0 ? `+${fmtNum(chg, 1)}%` : `${fmtNum(chg, 1)}%`}
          </span>
        </span>
        <span>
          <span className="k">MCAP</span>
          <b>{fmtCompact(mc)}</b>
        </span>
        <span>
          <span className="k">24H VOL</span>
          <b>{fmtCompact(vol)}</b>
        </span>
        <span>
          <span className="k">BURNED</span>
          <b className="text-cyan-400">{fmtNum(bpct, 2)}%</b>
        </span>
        <span>
          <span className="k">LAST BURN</span>
          <b className="text-white">3,840</b>
          <span className="k">· ${fmtNum(3840 * p, 2)} · 1m ago</span>
        </span>
        <span>
          <span className="k">POOL TVL</span>
          <b>{fmtCompact(liq)}</b>
        </span>
        <span>
          <span className="k">PENDING IN WALLET</span>
          <b className="text-amber-400">{fmtCompact(pending, "")} {symbol}</b>
        </span>
        <span>
          <span className="k">DAILY FEES (USDC)</span>
          <b>{fmtCompact(fees)}</b>
        </span>
        <span>
          <span className="k">GAS FEE</span>
          <b className="text-green-400">~$0.001 USDC</b>
        </span>
      </div>
    </div>
  );
}
