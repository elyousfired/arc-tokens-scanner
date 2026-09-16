import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { fetchLiveTokenData, fetchOnchainBurnData } from "../services/dexService";
import { fmtCompact, fmtNum } from "../lib/format";

export function AddTokenModal({ isOpen, onClose, onAddToken }) {
  const [address, setAddress] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000000");
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [liveInfo, setLiveInfo] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setAddress("");
      setSymbol("");
      setName("");
      setPrice("");
      setInitialSupply("1000000000");
      setError("");
      setLiveInfo(null);
      setIsFetching(false);
    }
  }, [isOpen]);

  const handleAddressChange = async (val) => {
    setAddress(val);
    setError("");
    setLiveInfo(null);

    const clean = val.trim();
    if (clean.startsWith("0x") && clean.length === 42) {
      try {
        setIsFetching(true);
        let [live, onchain] = await Promise.all([
          fetchLiveTokenData(clean.toLowerCase()),
          fetchOnchainBurnData(clean.toLowerCase())
        ]);
        if (onchain && onchain.totalBurned > 0) {
          live = live ? { ...live, totalBurned: onchain.totalBurned } : { totalBurned: onchain.totalBurned };
        }
        if (live && (live.priceUsd || live.volume24h || live.totalBurned || (live.directPairs && live.directPairs.length > 0))) {
          setLiveInfo(live);
          if (live.symbol) setSymbol(live.symbol);
          if (live.name) setName(live.name);
          if (live.priceUsd) setPrice(String(live.priceUsd));
        } else {
          setLiveInfo({ notFound: true });
        }
      } catch (err) {
        console.warn("Auto-detect failed:", err);
      } finally {
        setIsFetching(false);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanAddr = address.trim();
    if (!cleanAddr.startsWith("0x") || cleanAddr.length !== 42) {
      setError("Please enter a valid 42-character EVM address (0x...)");
      return;
    }
    if (!symbol.trim()) {
      setError("Token symbol is required");
      return;
    }

    const p = parseFloat(price) || (liveInfo?.priceUsd || 0);
    const supply = parseFloat(initialSupply) || 1000000000;
    const vol = liveInfo?.volume24h || 0;
    const liq = liveInfo?.liquidity || 0;
    const mcap = liveInfo?.marketCap || Math.round(supply * p);

    const newToken = {
      id: symbol.trim().toLowerCase(),
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || (symbol.trim().toUpperCase() + " Token"),
      contract: cleanAddr.toLowerCase(),
      color: "#00f2fe",
      icon: "⚡",
      chain: "Arc L1 (Circle USDC-Native)",
      platform: "Arc Launchpad",
      dex: liveInfo?.directPairs?.[0]?.dex || "Arc AMM",
      tag: "USER CUSTOM TOKEN",
      basePrice: p,
      initialSupply: supply,
      currentSupply: supply,
      totalBurned: liveInfo?.totalBurned || 0,
      pendingBurn: 0,
      burnWallet: "0x000000000000000000000000000000000000dEaD",
      burnWalletTxs: 0,
      burnWalletTxRateSec: 0,
      volume24h: vol,
      liquidity: liq,
      marketCap: mcap,
      feeRatePct: 1.0,
      curveProgress: 100,
      topPairUrl: liveInfo?.topPairUrl || ("https://arc.etherscan.io/token/" + cleanAddr.toLowerCase()),
      priceChanges: liveInfo?.priceChanges || {
        m5: "0.0%",
        h1: "0.0%",
        h6: "0.0%",
        h24: "0.0%"
      },
      feeDistribution: {
        burnPct: 50,
        holdersPct: 25,
        rewardsPct: 15,
        teamPct: 10
      },
      directPairs: liveInfo?.directPairs && liveInfo.directPairs.length > 0
        ? liveInfo.directPairs
        : [],
      ecosystemPairs: []
    };

    onAddToken(newToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 border-slate-700 bg-[#0f1422] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          Add Arc L1 Token
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Enter any Arc token contract address. Live DEX liquidity and prices are auto-detected from DexScreener.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Contract Address (0x...)</label>
              {isFetching && (
                <span className="text-cyan-400 flex items-center gap-1 text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin" /> Querying Arc DEX...
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              required
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {liveInfo && !liveInfo.notFound && (
            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Live DEX Pair Detected on Arc!
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-slate-300">
                <div>Price: <strong className="text-white">{"$" + fmtNum(liveInfo.priceUsd, 4)}</strong></div>
                <div>24h Vol: <strong className="text-white">{"$" + fmtCompact(liveInfo.volume24h)}</strong></div>
                <div>Liquidity: <strong className="text-white">{"$" + fmtCompact(liveInfo.liquidity)}</strong></div>
              </div>
            </div>
          )}

          {liveInfo?.notFound && (
            <div className="p-2.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[11px]">
              ℹ️ No public DexScreener pool detected yet. You can specify symbol & initial spot manually.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Symbol</label>
              <input
                type="text"
                placeholder="e.g. ARGUS"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Spot Price (USDC)</label>
              <input
                type="number"
                step="any"
                placeholder="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Token Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Arc Protocol"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Initial Supply</label>
              <input
                type="number"
                placeholder="1000000000"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-buy px-4 py-2 rounded font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Import Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
