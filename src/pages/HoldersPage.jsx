import React from "react";
import { Users, Shield, ExternalLink, PieChart } from "lucide-react";
import { fmtCompact, fmtNum } from "../lib/format";

export function HoldersPage({ token }) {
  const symbol = token?.symbol || "ARGUS";
  const currentSupply = token?.currentSupply || 934250000;
  const burned = token?.totalBurned || 65750000;
  const price = token?.basePrice || 0;

  const topWallets = [
    {
      rank: "01",
      address: "0x000000000000000000000000000000000000dEaD",
      tag: "Arc Dead Contract (Permanent Burn)",
      tagType: "burn",
      balance: burned,
      share: (burned / 1000000000) * 100,
    },
    {
      rank: "02",
      address: "0x384c60f98ecd4c26345499345c03d677e40f115e",
      tag: "Arc AMM Primary Liquidity Pool",
      tagType: "dex",
      balance: 54200000,
      share: 5.42,
    },
    {
      rank: "03",
      address: "0xece5ca8bf9220718e5727754026757512212cb3c",
      tag: "ArgusSwap Dual Reserve Pool",
      tagType: "dex",
      balance: 31000000,
      share: 3.10,
    },
    {
      rank: "04",
      address: "0x71c8b91a...43e2",
      tag: "Early Liquidity Provider / Whale",
      tagType: "whale",
      balance: 18400000,
      share: 1.84,
    },
    {
      rank: "05",
      address: "0x98f21c0b...912a",
      tag: "Holders Yield Redistribution Vault",
      tagType: "vault",
      balance: 14500000,
      share: 1.45,
    },
    {
      rank: "06",
      address: "0x55da124c...88ff",
      tag: "Arc Community Staking Contract",
      tagType: "staking",
      balance: 12100000,
      share: 1.21,
    },
    {
      rank: "07",
      address: "0x12bb99ee...04ab",
      tag: "SuperLotto Prize Pool Escrow",
      tagType: "lotto",
      balance: 8900000,
      share: 0.89,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan-400" />
          {symbol} Holders & Supply Distribution
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Full on-chain census of token custody across Arc L1 smart contracts, AMM liquidity bins, and whale wallets.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Estimated Total Holders</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">~5,120</div>
          <div className="text-[11px] text-green-400 mt-1">+14% new wallets in 24h</div>
        </div>

        <div className="card p-5 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Top 10 Wallets Concentration</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">14.8%</div>
          <div className="text-[11px] text-slate-400 mt-1">Excluding dead burn address</div>
        </div>

        <div className="card p-5 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Locked in AMM Liquidity</div>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-1">8.52%</div>
          <div className="text-[11px] text-slate-400 mt-1">~$3.9M USDC equivalent</div>
        </div>
      </div>

      {/* Top Holders Table */}
      <div className="card p-5 border-slate-800 bg-[#111622] overflow-x-auto">
        <h2 className="text-sm font-bold text-white mb-4">Top 10 Custody Addresses & Contracts</h2>
        <table className="w-full text-xs text-left font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-medium">Rank</th>
              <th className="pb-3 font-medium">Holder / Contract Entity</th>
              <th className="pb-3 font-medium">Address</th>
              <th className="pb-3 text-right font-medium">Balance</th>
              <th className="pb-3 text-right font-medium">Supply Share</th>
              <th className="pb-3 text-right font-medium">Value (USDC)</th>
              <th className="pb-3 text-right font-medium">Arcscan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {topWallets.map((w, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="py-3 text-slate-500">{w.rank}</td>
                <td className="py-3">
                  <div className="font-bold text-slate-200">{w.tag}</div>
                  <div className="text-[10px] text-cyan-400 uppercase">{w.tagType}</div>
                </td>
                <td className="py-3 text-slate-400 truncate max-w-[150px]">
                  {w.address}
                </td>
                <td className="py-3 text-right font-bold text-slate-200">
                  {fmtCompact(w.balance, "")} {symbol}
                </td>
                <td className="py-3 text-right font-semibold text-cyan-400">
                  {fmtNum(w.share, 2)}%
                </td>
                <td className="py-3 text-right text-green-400">
                  ${fmtCompact(w.balance * price)}
                </td>
                <td className="py-3 text-right">
                  <a
                    href={`https://arc.etherscan.io/address/${w.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center justify-end gap-1 text-[11px]"
                  >
                    View ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
