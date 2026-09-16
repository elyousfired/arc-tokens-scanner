import React from "react";
import { Zap } from "lucide-react";

export function Footer({ token }) {
  const symbol = token?.symbol || "ARGUS";
  const contract = token?.contract || "0xece5ca8bf9220718e5727754026757512212cb3c";
  const burnWallet = token?.burnWallet || "0x000000000000000000000000000000000000dEaD";

  return (
    <footer className="border-t border-slate-800 bg-[#080b10] text-xs text-slate-500 py-6 px-4 sm:px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-semibold">arc.fyi</span>
          <span>— Unofficial live metrics for Arc L1 tokens (${symbol}). Not financial advice.</span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px]">
          <a
            href={`https://arc.etherscan.io/token/${contract}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition"
          >
            Token on Arcscan ↗
          </a>
          <a
            href={`https://arc.etherscan.io/address/${burnWallet}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition"
          >
            Burn Contract ↗
          </a>
          <a
            href="https://arc.etherscan.io"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline transition"
          >
            Arc Explorer ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
