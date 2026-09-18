import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, DollarSign, Flame, TrendingUp, Search, RefreshCw, ExternalLink, 
  Copy, Check, ArrowUpRight, Zap, ShieldCheck, Filter, ArrowUpDown, 
  Activity, BarChart3, Layers
} from "lucide-react";
import { fetchTop100RevenueTokens } from "../services/topRevenueService";
import { fmtCompact, fmtNum } from "../lib/format";

export function TopRevenuePage({ onSelectToken, onNavigate }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "high-vol-mc" | "heavy-burn" | "liquid"
  const [sortBy, setSortBy] = useState("revenue24h"); // "revenue24h" | "totalRevenue" | "volToMc" | "burnUsd" | "volume24h" | "marketCap"
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" | "asc"
  const [copiedContract, setCopiedContract] = useState(null);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async (force = false) => {
    if (force) setRefreshing(true);
    try {
      const data = await fetchTop100RevenueTokens(force);
      setTokens(data);
    } catch (err) {
      console.warn("Failed to load top revenue tokens:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (contract, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contract);
    setCopiedContract(contract);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // 1. Filter
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const matchesSearch =
        t.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contract?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "high-vol-mc") return t.volToMc >= 1.0;
      if (activeFilter === "heavy-burn") return t.burnedPct >= 1.0 || t.burnUsd > 1000;
      if (activeFilter === "liquid") return t.liquidity >= 15000;
      return true;
    });
  }, [tokens, searchQuery, activeFilter]);

  // 2. Sort
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      let aVal = a[sortBy] ?? 0;
      let bVal = b[sortBy] ?? 0;
      if (typeof aVal === "string") aVal = parseFloat(aVal) || 0;
      if (typeof bVal === "string") bVal = parseFloat(bVal) || 0;
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [filteredTokens, sortBy, sortOrder]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedTokens.length / pageSize) || 1;
  const paginatedTokens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTokens.slice(start, start + pageSize);
  }, [sortedTokens, currentPage, pageSize]);

  // 4. Aggregates for Hero
  const totalArcRevenue24h = useMemo(() => {
    return tokens.reduce((sum, t) => sum + (t.revenue24h || 0), 0);
  }, [tokens]);

  const totalValueBurned = useMemo(() => {
    return tokens.reduce((sum, t) => sum + (t.burnUsd || 0), 0);
  }, [tokens]);

  const topLeader = tokens[0] || null;

  const highestVelocity = useMemo(() => {
    const list = [...tokens].filter((t) => t.volume24h > 5000);
    list.sort((a, b) => b.volToMc - a.volToMc);
    return list[0] || null;
  }, [tokens]);

  const handleOpenToken = (token) => {
    if (onSelectToken) onSelectToken(token);
    if (onNavigate) onNavigate("overview");
  };

  const handleOpenAudit = (token, e) => {
    e.stopPropagation();
    if (onSelectToken) onSelectToken(token);
    if (onNavigate) onNavigate("ai-audit");
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Hero Header & Core Platform KPIs */}
      <div className="card p-6 border-slate-800 bg-gradient-to-r from-[#111622] via-[#0f1420] to-[#121927] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Arc L1 Top 100 Revenue Leaderboard
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Live On-Chain
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Comprehensive scan of Arc tokens ranked by real trading fee revenue, Volume/MCap turnover velocity, and dead wallet burns.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span>{refreshing ? "Scanning Arc L1..." : "Refresh Scanner"}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Total 24h Revenue
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 mt-1">
              ${fmtCompact(totalArcRevenue24h)} <span className="text-xs font-normal text-slate-400">USDC/d</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">1.00% AMM Fee Cut</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Cumulative Value Burned
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-orange-400 mt-1">
              ${fmtCompact(totalValueBurned)} <span className="text-xs font-normal text-slate-400">USD</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Permanently Incinerated</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              #1 Revenue Leader
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400 mt-1 truncate">
              {topLeader?.symbol || "ARGUS"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              +${fmtCompact(topLeader?.revenue24h ?? 0)} USDC / 24h
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Top Turnover Velocity
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-400 mt-1 truncate">
              {highestVelocity?.symbol || "SYN"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Vol/MC: <strong className="text-green-400">{highestVelocity?.volToMcFormatted || "18.9x"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and Sorting */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Symbol, Token Name, or 0x contract..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#111622] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Top 100" },
            { id: "high-vol-mc", label: "⚡ High Velocity (Vol/MC > 1x)" },
            { id: "heavy-burn", label: "🔥 Heavy Burn (>1%)" },
            { id: "liquid", label: "💧 Liquid (> $15K)" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                activeFilter === f.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 100 Revenue Table */}
      <div className="card border-slate-800 bg-[#111622] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center"># Rank</th>
                <th className="py-3.5 px-4">Token</th>
                <th
                  onClick={() => handleSort("revenue24h")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Revenue (24h)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("totalRevenue")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition hidden sm:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Revenue</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("volToMc")}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Vol / MC</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("burnUsd")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Burned</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("volume24h")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Volume (24h)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("marketCap")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition hidden lg:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Market Cap</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right hidden xl:table-cell">Price / 24h</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span>Scanning Arc L1 decentralized pools and revenue vaults...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTokens.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    No tokens found matching your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedTokens.map((token) => {
                  const isTop3 = token.rank <= 3;
                  const medalBadge = 
                    token.rank === 1 ? "🥇" : 
                    token.rank === 2 ? "🥈" : 
                    token.rank === 3 ? "🥉" : null;

                  const volToMc = token.volToMc || 0;
                  const velocityBadge =
                    volToMc >= 2.0 ? { text: `${volToMc.toFixed(2)}x`, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" } :
                    volToMc >= 1.0 ? { text: `${volToMc.toFixed(2)}x`, color: "bg-teal-500/20 text-teal-300 border-teal-500/40" } :
                    volToMc >= 0.2 ? { text: `${volToMc.toFixed(2)}x`, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" } :
                    { text: `${volToMc.toFixed(2)}x`, color: "bg-slate-800 text-slate-400 border-slate-700" };

                  return (
                    <tr
                      key={token.contract}
                      onClick={() => handleOpenToken(token)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center font-bold">
                        {medalBadge ? (
                          <span className="text-base">{medalBadge}</span>
                        ) : (
                          <span className="text-slate-500 text-xs">#{token.rank}</span>
                        )}
                      </td>

                      {/* Token Identity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
                            {token.symbol?.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                                {token.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                {token.dex || "Arc AMM"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="truncate max-w-[120px] sm:max-w-[150px]">{token.name}</span>
                              <span>·</span>
                              <button
                                onClick={(e) => handleCopy(token.contract, e)}
                                className="hover:text-cyan-400 transition"
                                title="Copy Contract"
                              >
                                {copiedContract === token.contract ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 24h Revenue */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                        +${fmtCompact(token.revenue24h)}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          USDC / day
                        </span>
                      </td>

                      {/* Total Revenue */}
                      <td className="py-3 px-4 text-right font-semibold text-cyan-400 hidden sm:table-cell">
                        ${fmtCompact(token.totalRevenue)}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          Cumulative
                        </span>
                      </td>

                      {/* Vol / MC Turnover Velocity */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${velocityBadge.color}`}>
                          {velocityBadge.text}
                        </span>
                      </td>

                      {/* Total Burned */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-orange-400 font-bold">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span>{token.burnedPct > 0 ? `${token.burnedPct.toFixed(1)}%` : "$0"}</span>
                        </div>
                        <span className="block text-[10px] text-slate-500">
                          {token.burnUsd > 0 ? `$${fmtCompact(token.burnUsd)}` : "No Dead Burn"}
                        </span>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3 px-4 text-right text-slate-200 hidden md:table-cell">
                        ${fmtCompact(token.volume24h)}
                        <span className="block text-[10px] text-slate-500">
                          Vol (24h)
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-4 text-right text-slate-300 hidden lg:table-cell">
                        ${fmtCompact(token.marketCap)}
                        <span className="block text-[10px] text-slate-500">
                          FDV
                        </span>
                      </td>

                      {/* Price / 24h */}
                      <td className="py-3 px-4 text-right hidden xl:table-cell">
                        <div className="text-white font-medium">
                          ${token.price < 0.001 ? token.price.toFixed(6) : token.price.toFixed(4)}
                        </div>
                        <div className={`text-[10px] font-semibold ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {token.change24h >= 0 ? `+${fmtNum(token.change24h, 1)}%` : `${fmtNum(token.change24h, 1)}%`}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => handleOpenAudit(token, e)}
                            className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-mono font-bold flex items-center gap-1 transition"
                            title="Deep AI Viability Audit"
                          >
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span>Audit</span>
                          </button>
                          {token.pairUrl && (
                            <a
                              href={token.pairUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
                              title="Open on DexScreener"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer Controls */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-white">{Math.min(currentPage * pageSize, sortedTokens.length)}</strong> of{" "}
            <strong className="text-white">{sortedTokens.length}</strong> ranked Arc tokens
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#111622] border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-white transition"
            >
              Prev
            </button>
            <span className="px-2 font-bold text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-white transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
