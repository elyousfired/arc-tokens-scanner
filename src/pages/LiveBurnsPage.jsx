import React, { useState, useEffect } from "react";
import { Flame, RefreshCw, ExternalLink, Copy, Check, Search, ShieldCheck, Activity, Filter, Eye } from "lucide-react";
import { scanDeadWalletBurns } from "../services/burnScannerService";
import { fmtCompact, fmtNum } from "../lib/format";
import { TransactionModal } from "../components/TransactionModal";

export function LiveBurnsPage({ token, allTokens = [], onSelectToken }) {
  const [burns, setBurns] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTokenFilter, setSelectedTokenFilter] = useState("all");
  const [copiedTx, setCopiedTx] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [secondsUntilNextScan, setSecondsUntilNextScan] = useState(12);
  const [isLivePaused, setIsLivePaused] = useState(false);

  const fetchBurns = async (showLoading = false) => {
    try {
      if (showLoading) setRefreshing(true);
      const data = await scanDeadWalletBurns(150);
      if (data && data.burns) {
        setBurns(data.burns);
        if (data.currentBlock) setCurrentBlock(data.currentBlock);
      }
    } catch (err) {
      console.error("Live burns scan failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSecondsUntilNextScan(12);
    }
  };

  useEffect(() => {
    fetchBurns(true);
  }, []);

  // 12-second live polling interval
  useEffect(() => {
    if (isLivePaused) return;

    const interval = setInterval(() => {
      setSecondsUntilNextScan((prev) => {
        if (prev <= 1) {
          fetchBurns(false);
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLivePaused]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredBurns = burns.filter((b) => {
    const matchesSearch =
      b.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tx?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesToken =
      selectedTokenFilter === "all" ||
      b.symbol?.toUpperCase() === selectedTokenFilter.toUpperCase();

    return matchesSearch && matchesToken;
  });

  // Unique tokens found in live scan
  const uniqueSymbols = Array.from(new Set(burns.map((b) => b.symbol).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-lg shadow-orange-500/10">
                <Flame className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Arc L1 Dead Wallet Live Scanner
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                  <span>Target: 0x000000000000000000000000000000000000dEaD</span>
                  <a
                    href="https://arc.etherscan.io/address/0x000000000000000000000000000000000000dEaD"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    Arcscan ↗
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Live Status Pill & Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
              <span className={`w-2.5 h-2.5 rounded-full ${isLivePaused ? "bg-amber-400" : "bg-green-400 animate-ping"}`} />
              <span className="text-slate-300 font-bold">
                {isLivePaused ? "PAUSED" : "LIVE SCANNER"}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-400">
                Block #{currentBlock ? currentBlock.toLocaleString() : "..."}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 text-[11px]">
                {secondsUntilNextScan}s
              </span>
            </div>

            <button
              onClick={() => setIsLivePaused(!isLivePaused)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition cursor-pointer ${
                isLivePaused
                  ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {isLivePaused ? "Resume Live" : "Pause"}
            </button>

            <button
              onClick={() => fetchBurns(true)}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title="Refresh now"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Burns in Recent Window</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {burns.length} events
          </div>
          <div className="text-[11px] text-green-400 mt-1 font-mono">
            Across last 150 Arc L1 blocks
          </div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Distinct Tokens Incinerated</div>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
            {uniqueSymbols.length} Tokens
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Automated AMM & launchpad sweeps
          </div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Arc L1 Consensus Finality</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            ~1.0s / block
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Instant on-chain burn execution
          </div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Dead Wallet Address</div>
          <div className="text-sm font-mono text-slate-200 mt-2 truncate">
            0x0000...0000dEaD
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Permanent supply incineration
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <button
            onClick={() => setSelectedTokenFilter("all")}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap cursor-pointer ${
              selectedTokenFilter === "all"
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Tokens ({burns.length})
          </button>
          {uniqueSymbols.slice(0, 6).map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedTokenFilter(sym)}
              className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                selectedTokenFilter === sym
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/40 font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              ${sym}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symbol, contract, tx..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111622] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Main Live Table */}
      <div className="card border-slate-800 bg-[#111622] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-3 px-4 font-semibold">When</th>
                <th className="py-3 px-4 font-semibold">Token</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold text-right">Amount Burned</th>
                <th className="py-3 px-4 font-semibold">Sender / AMM Hook</th>
                <th className="py-3 px-4 font-semibold text-right">Receipt / Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                      <span>Scanning Arc L1 Dead Wallet on-chain...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBurns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No burn transactions found in the active scan window matching your filter.
                  </td>
                </tr>
              ) : (
                filteredBurns.map((b, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedTx(b)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        <span>{b.timeAgo}</span>
                      </div>
                      <div className="text-[10px] text-slate-600">Block #{b.blockNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          ${b.symbol}
                        </span>
                        <a
                          href={`https://arc.etherscan.io/token/${b.contract}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-cyan-400/80 hover:text-cyan-300 text-[10px] hover:underline"
                        >
                          {b.contract.slice(0, 6)}...{b.contract.slice(-4)}
                        </a>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        <Flame className="w-3 h-3" />
                        BURN
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-100 whitespace-nowrap">
                      <div>
                        {fmtNum(b.tokens, 2)} {b.symbol}
                      </div>
                      {b.usd > 0 && (
                        <div className="text-[10px] text-green-400 font-semibold">
                          ${fmtNum(b.usd, 2)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      <a
                        href={`https://arc.etherscan.io/address/${b.from}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-300 hover:text-cyan-400 hover:underline font-mono text-[11px]"
                      >
                        {b.shortFrom}
                      </a>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://arc.etherscan.io/tx/${b.tx}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-cyan-400 group-hover:underline flex items-center gap-1 font-bold text-[11px]"
                        >
                          {b.shortTx}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(b.tx, idx);
                          }}
                          className="text-slate-500 hover:text-slate-300 p-1"
                          title="Copy Tx Hash"
                        >
                          {copiedTx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for inspection */}
      <TransactionModal
        txData={selectedTx}
        token={token}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
