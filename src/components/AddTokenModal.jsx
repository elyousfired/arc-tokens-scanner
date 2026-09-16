import React, { useState } from "react";
import { X, Plus, AlertCircle } from "lucide-react";

export function AddTokenModal({ isOpen, onClose, onAddToken }) {
  const [address, setAddress] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.startsWith("0x") || address.length !== 42) {
      setError("Please enter a valid 42-character EVM address (0x...)");
      return;
    }
    if (!symbol.trim()) {
      setError("Token symbol is required");
      return;
    }

    const p = parseFloat(price) || 0.01;
    const newToken = {
      id: symbol.toLowerCase(),
      symbol: symbol.toUpperCase(),
      name: name || `${symbol.toUpperCase()} Token`,
      contract: address.toLowerCase(),
      color: "#00f2fe",
      icon: "⚡",
      chain: "Arc L1 (Circle USDC-Native)",
      platform: "Arc Launchpad",
      dex: "Arc AMM",
      tag: "USER CUSTOM TOKEN",
      basePrice: p,
      initialSupply: 1000000000,
      currentSupply: 990000000,
      totalBurned: 10000000,
      pendingBurn: 500000,
      burnWallet: "0x000000000000000000000000000000000000dEaD",
      burnWalletTxs: 12000,
      burnWalletTxRateSec: 4.0,
      volume24h: 1500000,
      liquidity: 450000,
      marketCap: 990000000 * p,
      feeRatePct: 1.0,
      curveProgress: 100,
      priceChanges: {
        m5: "+0.5%",
        h1: "+2.1%",
        h6: "+8.4%",
        h24: "+15.0%"
      },
      feeDistribution: {
        burnPct: 50,
        holdersPct: 25,
        rewardsPct: 15,
        teamPct: 10
      },
      directPairs: [
        { pair: `${symbol.toUpperCase()}/USDC`, dex: "Arc AMM Pool", volume24h: 1200000, fees: 6000, liquidity: 350000 }
      ],
      ecosystemPairs: []
    };

    onAddToken(newToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 border-slate-700 bg-[#0f1422] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          Add Arc L1 Launchpad Token
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Track any token deployed on the Arc Network with full Ember-style analytics.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1">Contract Address (0x...)</label>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError("");
              }}
              required
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Symbol</label>
              <input
                type="text"
                placeholder="e.g. MOON"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Initial Spot (USDC)</label>
              <input
                type="number"
                step="0.0001"
                placeholder="0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Project Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Moonshot Protocol"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
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
              className="btn-buy px-4 py-2 rounded font-bold transition"
            >
              Import Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
