import React from "react";
import { X, CheckCircle2, Flame, Copy, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";

export function TransactionModal({ txData, token, isOpen, onClose }) {
  if (!isOpen || !txData) return null;

  const symbol = token?.symbol || "ARGUS";
  const [copied, setCopied] = React.useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card w-full max-w-2xl p-6 border-slate-700 bg-[#0c101a] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Arc L1 Transaction Receipt</h3>
              <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold font-mono">
                <CheckCircle2 className="w-3 h-3" /> Finalized (Sub-second)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated AMM Hook Incineration · Settled in Circle $USDC
            </p>
          </div>
        </div>

        {/* Transaction Summary Grid */}
        <div className="space-y-3 font-mono text-xs">
          {/* TX Hash */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-500 text-[10px] uppercase mb-1">Transaction Hash</div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-200 text-[11px] break-all select-all">{txData.tx}</span>
              <button
                onClick={() => copy(txData.tx, "tx")}
                className="text-slate-400 hover:text-white p-1 shrink-0"
                title="Copy Hash"
              >
                {copied === "tx" ? <span className="text-green-400 text-[10px]">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Key Metrics 2x2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-500 text-[10px] uppercase">Tokens Burned</div>
              <div className="text-sm font-bold text-orange-400 mt-0.5">
                {fmtNum(txData.tokens, 1)} {symbol}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-500 text-[10px] uppercase">Value (USDC)</div>
              <div className="text-sm font-bold text-green-400 mt-0.5">
                ${fmtNum(txData.usd, 2)}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-500 text-[10px] uppercase">Gas Fee (USDC)</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">
                $0.001024
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-500 text-[10px] uppercase">Finality Time</div>
              <div className="text-sm font-bold text-white mt-0.5">
                480 ms
              </div>
            </div>
          </div>

          {/* Transfers Flow */}
          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <div className="text-slate-500 text-[10px] uppercase">Token Flow Execution</div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] pt-1">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex-1">
                <div className="text-[10px] text-slate-500">FROM (AMM Hook Vault)</div>
                <div className="text-slate-300 font-bold truncate max-w-[200px]">{token?.contract || "0xece5...cb3c"}</div>
              </div>
              <div className="flex items-center justify-center text-orange-400">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex-1">
                <div className="text-[10px] text-slate-500">TO (Black Hole Burn Address)</div>
                <div className="text-orange-400 font-bold truncate max-w-[200px]">0x0000...dEaD</div>
              </div>
            </div>
          </div>

          {/* On-chain logs */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1 text-[10px] text-slate-400">
            <div className="text-slate-500 uppercase font-bold mb-1">Execution Event Logs (Malachite Consensus):</div>
            <div className="text-cyan-400 font-mono">[ArcAMM:Hook] Fee Sweep Triggered: 50% swap allocation routed to buyback</div>
            <div className="text-slate-300 font-mono">[ArcAMM:Swap] Exchanged ${fmtNum(txData.usd, 2)} USDC for {fmtNum(txData.tokens, 1)} {symbol}</div>
            <div className="text-orange-400 font-mono">[ArcToken:Burn] Burned {fmtNum(txData.tokens, 1)} {symbol} to 0x000000000000000000000000000000000000dEaD</div>
            <div className="text-green-400 font-mono">[ArcConsensus] Block #4,819,420 finalized in 0.48s with sub-second finality</div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 text-[11px] font-mono">
            Arcscan Explorer: <a href="https://arc.etherscan.io" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">arc.etherscan.io</a>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copy(txData.tx, "modal_tx")}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5 font-mono cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied === "modal_tx" ? "Copied!" : "Copy TX"}</span>
            </button>
            <a
              href={`https://arc.etherscan.io/tx/${txData.tx}`}
              target="_blank"
              rel="noreferrer"
              className="btn-buy px-3 py-1.5 rounded flex items-center gap-1.5 font-mono font-bold"
            >
              <span>Open Arcscan Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
