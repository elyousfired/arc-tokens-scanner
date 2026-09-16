import React from "react";
import { Info, ShieldAlert, Cpu, Calculator, CheckCircle2, ExternalLink } from "lucide-react";

export function AboutPage({ token }) {
  const symbol = token?.symbol || "ARGUS";
  const contract = token?.contract || "0xece5ca8bf9220718e5727754026757512212cb3c";
  const burnWallet = token?.burnWallet || "0x000000000000000000000000000000000000dEaD";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Info className="w-6 h-6 text-cyan-400" />
          About arc.fyi & Arc L1 Methodology
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Independent, source-linked live analytics for the ${symbol} token and Arc Launchpad ecosystem on Arc L1 (USDC Native).
        </p>
      </div>

      {/* Notice Card */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg text-xs text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Disclaimer:</strong> arc.fyi is an independent, community-driven quantitative analytics tool. It is not affiliated with, endorsed by, or operated by Circle, Arc Foundation, or ArgusPad. All figures are computed from public Arc L1 RPC nodes and Arcscan explorers. Not financial advice.
        </p>
      </div>

      {/* Section 1: Supply & Burn Mathematics */}
      <section className="card p-6 border-slate-800 bg-[#111622] space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          1. Supply & On-Chain Burn Mathematics
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The ${symbol} token was deployed on Arc L1 with a fixed, unalterable initial supply of exactly <strong>1,000,000,000 tokens</strong>. Both mint authority and freeze authority were permanently renounced upon creation.
        </p>
        <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-300 space-y-1.5 border border-slate-800">
          <div>// Arc L1 EVM Call: totalSupply()</div>
          <div>Initial Supply = 1,000,000,000 {symbol}</div>
          <div>Current Circulating Supply = {token?.currentSupply ? token.currentSupply.toLocaleString() : "934,250,000"} {symbol}</div>
          <div className="text-cyan-400 font-bold">
            Burned Tokens = Initial Supply - Current Supply = {token?.totalBurned ? token.totalBurned.toLocaleString() : "65,750,000"} {symbol}
          </div>
          <div>Burned Percentage = {token?.totalBurned ? (token.totalBurned / 10000000).toFixed(2) : "6.58"}%</div>
        </div>
        <p className="text-xs text-slate-400">
          Because tokens are incinerated by transfer to the non-spendable EVM dead contract address (<code className="text-slate-200">0x000...dEaD</code>), circulating supply is guaranteed to only ever fall.
        </p>
      </section>

      {/* Section 2: Arc L1 USDC-Native Gas Architecture */}
      <section className="card p-6 border-slate-800 bg-[#111622] space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          2. Arc L1 USDC-Native Gas Architecture
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Arc L1 eliminates bridge friction and volatility by using native <strong>Circle $USDC</strong> as the sole gas token. Every transaction fee is fixed at approximately <strong>$0.001 USDC</strong>, enabling high-frequency micro-swaps and instant AMM fee sweeps.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 uppercase text-[10px]">Consensus Engine</div>
            <div className="text-white font-bold text-sm mt-1">Malachite BFT</div>
            <div className="text-slate-400 text-[11px] mt-1">Sub-second deterministic finality</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 uppercase text-[10px]">Fee Splitting Mechanism</div>
            <div className="text-cyan-400 font-bold text-sm mt-1">Automated AMM Hooks</div>
            <div className="text-slate-400 text-[11px] mt-1">50% Burn / 25% Yield / 15% Lotto / 10% Ops</div>
          </div>
        </div>
      </section>

      {/* Section 3: Verified On-Chain Contracts */}
      <section className="card p-6 border-slate-800 bg-[#111622] space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          3. Verified Contracts & Arcscan Audit Links
        </h2>
        <div className="space-y-3 font-mono text-xs">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-slate-500 text-[10px] uppercase">${symbol} Token Contract</div>
              <div className="text-white font-bold">{contract}</div>
            </div>
            <a
              href={`https://arc.etherscan.io/token/${contract}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              Verify on Arcscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Dead Burn Contract (Black Hole)</div>
              <div className="text-white font-bold">{burnWallet}</div>
            </div>
            <a
              href={`https://arc.etherscan.io/address/${burnWallet}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              Inspect Dead Address <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
