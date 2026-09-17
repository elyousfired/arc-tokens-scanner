import React, { useState, useEffect } from "react";
import { DollarSign, Wallet, Vault, ExternalLink, Copy, Check, RefreshCw, ArrowUpRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";
import { fetchTokenRevenueData } from "../services/revenueService";

export function RevenueVaultsCard({ token }) {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const symbol = token?.symbol || "ARGUS";

  useEffect(() => {
    let isMounted = true;
    async function loadRevenue() {
      setLoading(true);
      try {
        const data = await fetchTokenRevenueData(token);
        if (isMounted) setRevenueData(data);
      } catch (err) {
        console.warn("Error fetching revenue data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRevenue();
    return () => { isMounted = false; };
  }, [token?.contract, token?.id, token?.volume24h]);

  const copyAddress = (addr, id) => {
    navigator.clipboard.writeText(addr);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const creatorAddr = revenueData?.creatorWallet;
  const creatorBalance = revenueData?.creatorBalanceUsd ?? 0;
  const dailyFees = revenueData?.dailyTotalFeesUsd ?? 0;

  return (
    <section className="card p-5 sm:p-6 border-slate-800 bg-[#111622] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                On-Chain Revenue & Creator Earnings Matrix
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Circle USDC Native
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of trading fee revenue, Creator Wallets, and Arc L1 Protocol Fee Vaults
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Arc L1 Settlement
          </span>
        </div>
      </div>

      {/* 3 Core Revenue Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Card 1: Creator Wallet */}
        <div className="card p-4 bg-slate-900/70 border-slate-800 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Creator / Deployer Wallet
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {revenueData?.creatorType || "Deployer"}
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${fmtCompact(creatorBalance, "")} <span className="text-xs text-slate-400 font-normal">USDC</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            {creatorAddr ? (
              <>
                <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[160px]" title={creatorAddr}>
                  {creatorAddr.slice(0, 6)}...{creatorAddr.slice(-4)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyAddress(creatorAddr, "creator")}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy Address"
                  >
                    {copied === "creator" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://arc.etherscan.io/address/${creatorAddr}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="View on Arc Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            ) : (
              <span className="text-slate-500 italic">Scanning creator on-chain...</span>
            )}
          </div>
        </div>

        {/* Card 2: 24h Trading Fees */}
        <div className="card p-4 bg-slate-900/70 border-slate-800 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              24h Total Fees Generated
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
              {token?.feeRatePct || 1.0}% AMM Fee
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1">
            ${fmtCompact(dailyFees)} <span className="text-xs text-slate-400 font-normal">USDC / day</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Volume (24h):</span>
            <span className="text-slate-200 font-semibold">${fmtCompact(token?.volume24h ?? 0)}</span>
          </div>
        </div>

        {/* Card 3: Network Vaults TVL */}
        <div className="card p-4 bg-slate-900/70 border-slate-800 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Vault className="w-3.5 h-3.5 text-purple-400" />
              Protocol Vault Reserves
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">
              4 Active Vaults
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400 mt-1">
            ${fmtCompact(revenueData?.totalVaultsUsd ?? 0)} <span className="text-xs text-slate-400 font-normal">USDC</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Automated Payouts:</span>
            <span className="text-green-400 font-semibold">Sub-Second Finality</span>
          </div>
        </div>
      </div>

      {/* Network Fee Vaults Detailed Grid */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Vault className="w-3.5 h-3.5 text-slate-400" />
            Arc L1 Network Fee Distribution Vaults (Live On-Chain)
          </h4>
          <span className="text-[11px] font-mono text-slate-500">
            Automated Splitting Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(revenueData?.vaults || []).map((vault, i) => (
            <div
              key={vault.address}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-200 truncate" title={vault.name}>
                    {vault.name.split(" ")[0]} {vault.name.split(" ")[1]}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${vault.color}20`, color: vault.color }}
                  >
                    {vault.sharePct}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {vault.role}
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-t border-slate-800/80 pt-2 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase">Live Vault:</span>
                  <span className="text-sm font-bold text-white">
                    ${fmtCompact(vault.currentBalanceUsd)} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-400">
                  <span>{vault.address.slice(0, 6)}...{vault.address.slice(-4)}</span>
                  <a
                    href={`https://arc.etherscan.io/address/${vault.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
