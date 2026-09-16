import React, { useState } from 'react';
import { X, ArrowDownUp, Zap, ExternalLink, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';
import { fmtNum } from '../lib/format';

export function SwapModal({ token, isOpen, onClose }) {
  if (!isOpen || !token) return null;

  const symbol = token?.symbol || 'ARGUS';
  const price = token?.basePrice || 0;
  const contract = token?.contract || '0xece5ca8bf9220718e5727754026757512212cb3c';

  const [payAmount, setPayAmount] = useState('100');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');

  const numPay = parseFloat(payAmount) || 0;
  const receiveAmount = numPay > 0 && price > 0 ? numPay / price : 0;
  const gasUsdc = 0.001024;
  const minReceived = receiveAmount * 0.995;

  const handleSimulateSwap = () => {
    setIsSwapping(true);
    setIsSuccess(false);

    setTimeout(() => {
      const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash('0x' + randomHex);
      setIsSwapping(false);
      setIsSuccess(true);
    }, 600);
  };

  const copyContract = () => {
    navigator.clipboard.writeText(contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="card w-full max-w-md p-6 border-slate-700 bg-[#0c101a] shadow-2xl relative rounded-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
            {token.icon || '🛡️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono">Trade ${symbol}</h3>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                Arc L1 AMM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant settlement in native Circle $USDC
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="space-y-4 py-2 font-mono text-xs text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-base font-bold text-white">Swap Confirmed!</div>
              <div className="text-slate-400 text-xs mt-1">
                Swapped <strong className="text-white">${numPay} USDC</strong> for <strong className="text-cyan-400">{fmtNum(receiveAmount, 2)} {symbol}</strong>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Network Finality</span>
                <span className="text-green-400 font-bold">480 ms (Sub-second)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Gas Paid</span>
                <span className="text-white font-bold">${gasUsdc} USDC</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase mb-1">Tx Hash</div>
                <div className="text-slate-300 text-[11px] truncate select-all">{txHash}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSuccess(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
              >
                Trade Again
              </button>
              <a
                href={`https://arc.etherscan.io/token/${contract}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>View on Arcscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-mono">
            {/* Pay Input */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>You Pay</span>
                <span className="text-slate-500">Balance: ~5,000 USDC</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-none placeholder-slate-600"
                />
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-bold shrink-0">
                  💵 USDC
                </span>
              </div>

              {/* Quick preset chips */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                {[25, 50, 100, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPayAmount(String(preset))}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      Number(payAmount) === preset
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Inverted arrow indicator */}
            <div className="flex justify-center -my-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-md">
                <ArrowDownUp className="w-4 h-4" />
              </div>
            </div>

            {/* Receive Output */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>You Receive (Estimated)</span>
                <span className="text-slate-500">Rate: ${fmtNum(price, 4)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xl font-bold text-cyan-400 truncate">
                  {fmtNum(receiveAmount, 2)}
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/80 text-xs text-cyan-300 font-bold shrink-0">
                  {token.icon} ${symbol}
                </span>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Route</span>
                <span className="text-slate-200">Arc L1 AMM Hooks (Direct)</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Gas Fee</span>
                <span className="text-green-400 font-bold">~${gasUsdc} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Slippage Tolerance</span>
                <span className="text-slate-200">0.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Received</span>
                <span className="text-slate-200">{fmtNum(minReceived, 2)} {symbol}</span>
              </div>
            </div>

            {/* Token Contract Copy & Direct Link */}
            <div className="flex items-center justify-between text-[11px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="text-slate-500 truncate max-w-[200px] select-all font-mono">
                {contract.slice(0, 10)}...{contract.slice(-8)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyContract}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`https://arc.etherscan.io/token/${contract}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Contract</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Live Pool Link */}
            {token?.directPairs?.[0]?.url && (
              <a
                href={token.directPairs[0].url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Trade directly on {token.dex || "Arc AMM"}</span>
                </span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  Open DEX Pool <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSimulateSwap}
              disabled={isSwapping || numPay <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSwapping ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Routing via Arc AMM...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Simulate Swap (${symbol})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
