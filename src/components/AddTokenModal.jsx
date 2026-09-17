import React, { useState, useEffect } from "react";
import { 
  X, Plus, AlertCircle, Loader2, CheckCircle2, Copy, Check, 
  ExternalLink, Sparkles, Flame, Droplets, Coins, TrendingUp, ArrowRight, Clipboard
} from "lucide-react";
import { scanFullArcToken } from "../services/dexService";
import { auditArcToken } from "../services/tokenAuditService";
import { fmtCompact, fmtNum } from "../lib/format";

export function AddTokenModal({ isOpen, onClose, onAddToken, onOpenAudit }) {
  const [address, setAddress] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [tokenResult, setTokenResult] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAddress("");
      setIsScanning(false);
      setTokenResult(null);
      setAuditResult(null);
      setError("");
      setCopied(false);
    }
  }, [isOpen]);

  const handleScan = async (addrToScan) => {
    const clean = (addrToScan || address).trim().toLowerCase();
    if (!clean.startsWith("0x") || clean.length !== 42) {
      setError("Please enter a valid 42-character Arc EVM address (0x...)");
      return;
    }

    try {
      setError("");
      setIsScanning(true);
      setTokenResult(null);
      setAuditResult(null);

      const result = await scanFullArcToken(clean);
      if (result && result.symbol) {
        setTokenResult(result);
        const audit = await auditArcToken(result);
        setAuditResult(audit);
      } else {
        setError("Token not found on Arc L1 or contract did not respond to standard ERC-20 calls.");
      }
    } catch (err) {
      console.error("Scan token failed:", err);
      setError("Failed to query Arc L1 blockchain. Please check network connection.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    setError("");
    if (val.trim().length === 42 && val.trim().startsWith("0x")) {
      handleScan(val.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().startsWith("0x") && text.trim().length === 42) {
        setAddress(text.trim());
        handleScan(text.trim());
      } else if (text) {
        setAddress(text.trim());
      }
    } catch {
      // Clipboard permission denied or fallback
    }
  };

  const handleImport = () => {
    if (!tokenResult) return;
    onAddToken(tokenResult);
    onClose();
  };

  const copyAddress = () => {
    if (!tokenResult?.contract) return;
    navigator.clipboard.writeText(tokenResult.contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const quickPicks = [
    { symbol: "TOLLY", address: "0xbc43ce8dec648ea298c4275559b81d6261c90b67" },
    { symbol: "WARP", address: "0x384c60f98ecd4c26345499345c03d677e40f115e" },
    { symbol: "ELLIPSE", address: "0x86f7424c3e1ebb3f42e1e687468e36d5f2a1222e" },
    { symbol: "PI", address: "0x5b4da7b7fe57a0d12ef1ed4d4a232d06e6e7c84a" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="card w-full max-w-xl p-6 border-slate-800 bg-[#0f1422] shadow-2xl relative rounded-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-1">
          <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Add Arc L1 Token Matrix
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Paste contract address — 100% on-chain bytecode & DEX liquidity auto-detected
            </p>
          </div>
        </div>

        {/* Quick Pick Chips */}
        <div className="flex items-center gap-2 mt-4 mb-3 flex-wrap">
          <span className="text-[11px] font-mono text-slate-500">Quick Test:</span>
          {quickPicks.map((qp) => (
            <button
              key={qp.symbol}
              type="button"
              onClick={() => {
                setAddress(qp.address);
                handleScan(qp.address);
              }}
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 transition cursor-pointer"
            >
              ${qp.symbol}
            </button>
          ))}
        </div>

        {/* Single Smart Input Box */}
        <div className="space-y-3 font-mono text-xs mt-2">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span>Token Contract Address (0x...)</span>
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-normal"
              >
                <Clipboard className="w-3 h-3" /> Paste Address
              </button>
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="0x..."
                value={address}
                onChange={handleAddressChange}
                autoFocus
                className="w-full pl-3 pr-24 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => handleScan()}
                disabled={isScanning || !address.trim()}
                className={`absolute right-2 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isScanning || !address.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <span>Scan</span>
                )}
              </button>
            </div>
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="p-4 rounded-xl bg-[#131a29] border border-cyan-500/30 text-center space-y-2 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Arc L1 Blockchain & DexScreener...</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Reading symbol, decimals, totalSupply, and dead wallet burn balance directly on-chain
              </p>
            </div>
          )}

          {/* Error message */}
          {error && !isScanning && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 🌟 Verified Token Matrix Preview Card */}
          {tokenResult && !isScanning && (
            <div className="p-4 rounded-xl bg-[#131b2c] border border-cyan-500/40 shadow-xl space-y-3">
              {/* Header: Symbol & Name */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-cyan-500/20">
                    {tokenResult.symbol?.slice(0, 2) || "🪙"}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">
                        ${tokenResult.symbol}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Verified Arc L1
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {tokenResult.name}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyAddress}
                  className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 border border-slate-700 bg-slate-900/60 px-2 py-1 rounded transition"
                  title="Copy contract"
                >
                  <span>{tokenResult.contract.slice(0, 6)}...{tokenResult.contract.slice(-4)}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* 🎯 AI Viability Score & Mechanism Banner */}
              {auditResult && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                        AI Success Probability
                      </div>
                      <div className="text-xs text-white font-medium truncate max-w-[240px]">
                        {auditResult.ecosystemType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold"
                      style={{
                        backgroundColor: `${auditResult.tier.color}20`,
                        color: auditResult.tier.color,
                        border: `1px solid ${auditResult.tier.color}40`
                      }}
                    >
                      {auditResult.totalScore}% · Grade {auditResult.tier.grade}
                    </span>
                    {onOpenAudit && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAudit(tokenResult);
                          onClose();
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        <span>Audit Radar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> Burned %
                  </div>
                  <div className="text-sm font-black font-mono text-orange-400 mt-1">
                    {((tokenResult.totalBurned / (tokenResult.initialSupply || 1)) * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {fmtCompact(tokenResult.totalBurned, "")} {tokenResult.symbol}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <Coins className="w-3 h-3 text-cyan-400" /> Spot Price
                  </div>
                  <div className="text-sm font-black font-mono text-white mt-1">
                    ${fmtNum(tokenResult.basePrice, 4)}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {tokenResult.priceChanges?.h24 || "+0.0%"} 24h
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-emerald-400" /> DEX Liquidity
                  </div>
                  <div className="text-sm font-black font-mono text-emerald-400 mt-1">
                    ${fmtCompact(tokenResult.liquidity)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {tokenResult.directPairs?.length || 0} pools
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" /> 24h Volume
                  </div>
                  <div className="text-sm font-black font-mono text-white mt-1">
                    ${fmtCompact(tokenResult.volume24h)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    MCap: ${fmtCompact(tokenResult.marketCap)}
                  </div>
                </div>
              </div>

              {/* Big Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleImport}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>🚀 Open Full ${tokenResult.symbol} Overview & Matrix</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer cancel */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs font-mono py-1 px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
