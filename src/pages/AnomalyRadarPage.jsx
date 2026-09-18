import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle, ShieldAlert, Zap, Flame, RefreshCw, ExternalLink,
  Copy, Check, Search, Filter, ArrowUpRight, TrendingUp, TrendingDown,
  Info, Activity, Skull, Eye, BarChart2, Layers, Globe
} from "lucide-react";
import { scanArcAnomalies } from "../services/anomalyScannerService";
import { fmtCompact, fmtNum } from "../lib/format";

export function AnomalyRadarPage({ onSelectToken, onNavigate }) {
  const [data, setData] = useState({ anomalies: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // "all" | "CRITICAL" | "OPPORTUNITY" | "WASH_TRADING" | "GHOST_LIQUIDITY" | "WHALE_DUMP"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [lang, setLang] = useState("darija"); // "darija" | "en"
  const [copiedContract, setCopiedContract] = useState(null);

  const loadAnomalies = async (force = false) => {
    if (force) setRefreshing(true);
    try {
      const res = await scanArcAnomalies(force);
      setData(res);
    } catch (err) {
      console.warn("Error scanning Arc anomalies:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
    const interval = setInterval(() => {
      loadAnomalies(false);
    }, 45000); // 45s periodic background refresh
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (contract, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contract);
    setCopiedContract(contract);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  // Filter anomalies
  const filteredAnomalies = useMemo(() => {
    return (data.anomalies || []).filter((item) => {
      const matchesSearch =
        item.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contract?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === "all") return true;
      if (activeCategory === "CRITICAL") return item.primaryAnomaly.category === "CRITICAL";
      if (activeCategory === "OPPORTUNITY") return item.primaryAnomaly.category === "OPPORTUNITY";
      if (activeCategory === "WASH_TRADING") return item.allAnomalies.some(a => a.code === "WASH_TRADING");
      if (activeCategory === "GHOST_LIQUIDITY") return item.allAnomalies.some(a => a.code === "GHOST_LIQUIDITY");
      if (activeCategory === "WHALE_DUMP") return item.allAnomalies.some(a => a.code === "WHALE_DUMP");
      return true;
    });
  }, [data.anomalies, searchQuery, activeCategory]);

  const summary = data.summary || {
    totalScanned: 0,
    totalAnomalies: 0,
    criticalCount: 0,
    warningCount: 0,
    opportunityCount: 0,
    watchCount: 0
  };

  const getSeverityBadge = (category) => {
    switch (category) {
      case "CRITICAL":
        return {
          bg: "bg-rose-500/15 border-rose-500/30 text-rose-300",
          dot: "bg-rose-400 animate-ping",
          label: lang === "darija" ? "🚨 Khatar / Danger" : "🚨 Critical Threat"
        };
      case "OPPORTUNITY":
        return {
          bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
          dot: "bg-emerald-400 animate-pulse",
          label: lang === "darija" ? "🚀 Opportunité (Surge)" : "🚀 Breakout Opportunity"
        };
      case "WARNING":
        return {
          bg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
          dot: "bg-amber-400 animate-pulse",
          label: lang === "darija" ? "⚠️ Tahdir (Warning)" : "⚠️ Market Warning"
        };
      default:
        return {
          bg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
          dot: "bg-indigo-400",
          label: lang === "darija" ? "⚡ Mraqaba (Watch)" : "⚡ High Velocity"
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1626] via-[#111928] to-[#0a0f1d] border border-rose-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                ARC L1 ON-CHAIN RADAR
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                ● Scanned: <span className="text-white font-bold">{summary.totalScanned || 164}</span> Pools
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-rose-400" />
              Système de Détection d'Anomalies
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Algorithme temps-réel qui surveille la blockchain Arc pour détecter les pièges (Honeypots, fuites de liquidité, wash-trading) ainsi que les opportunités de momentum soudain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            {/* Language switch */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/60 rounded-xl p-1 text-xs font-medium">
              <button
                onClick={() => setLang("darija")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  lang === "darija" ? "bg-rose-500 text-white font-bold shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                🇲🇦 Darija
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  lang === "en" ? "bg-rose-500 text-white font-bold shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadAnomalies(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 text-slate-200 text-xs font-mono transition shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-400" : "text-slate-400"}`} />
              <span>{refreshing ? "Scanning..." : "Refresh Scan"}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Anomalies</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {summary.totalAnomalies}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tokens avec comportement anormal
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-3.5 border border-rose-500/20">
            <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
              <span>Danger Critique</span>
              <Skull className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-400">
              {summary.criticalCount}
            </div>
            <div className="text-[11px] text-rose-300/60 mt-0.5">
              Honeypots & Liquidity Drains
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-3.5 border border-amber-500/20">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
              <span>Distortions Marché</span>
              <Eye className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {summary.warningCount}
            </div>
            <div className="text-[11px] text-amber-300/60 mt-0.5">
              Wash-Trade & Ghost Liquidity
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-3.5 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
              <span>Opportunités Surge</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {summary.opportunityCount}
            </div>
            <div className="text-[11px] text-emerald-300/60 mt-0.5">
              Breakout soudain en 1h
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeCategory === "all"
                ? "bg-slate-700 text-white font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Tous ({data.anomalies?.length || 0})
          </button>
          <button
            onClick={() => setActiveCategory("CRITICAL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeCategory === "CRITICAL"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            <span>Critique ({summary.criticalCount})</span>
          </button>
          <button
            onClick={() => setActiveCategory("OPPORTUNITY")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeCategory === "OPPORTUNITY"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Breakouts ({summary.opportunityCount})</span>
          </button>
          <button
            onClick={() => setActiveCategory("WASH_TRADING")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeCategory === "WASH_TRADING"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            ⚠️ Wash-Trading
          </button>
          <button
            onClick={() => setActiveCategory("GHOST_LIQUIDITY")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeCategory === "GHOST_LIQUIDITY"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            💧 Ghost Liquidity
          </button>
          <button
            onClick={() => setActiveCategory("WHALE_DUMP")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeCategory === "WHALE_DUMP"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            🐋 Whale Selling
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search token, symbol, 0x..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === "grid" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Affichage Cartes Détaillées"
            >
              Grille
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === "table" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Affichage Tableau Compact"
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-slate-800 rounded" />
                <div className="h-6 w-16 bg-slate-800 rounded-full" />
              </div>
              <div className="h-12 bg-slate-800/70 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-slate-800/40 rounded" />
                <div className="h-10 bg-slate-800/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAnomalies.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-slate-800">
          <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white mb-1">Aucune anomalie correspondante</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aucun token sur Arc L1 ne correspond aux critères de recherche ou de filtre sélectionnés.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW: Rich Anomaly Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnomalies.map((item) => {
            const badge = getSeverityBadge(item.primaryAnomaly.category);
            const isPump = item.change24h > 0;

            return (
              <div
                key={item.contract}
                className="bg-gradient-to-b from-[#0e1422] to-[#0a0e18] rounded-xl border border-slate-800/90 hover:border-slate-700/80 p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/40 space-y-4 relative overflow-hidden group"
              >
                {/* Header: Token Info + Anomaly Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white tracking-tight font-mono">
                          ${item.symbol}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.contract.slice(0, 6)}...{item.contract.slice(-4)}
                        </span>
                        <button
                          onClick={(e) => handleCopy(item.contract, e)}
                          className="text-slate-500 hover:text-cyan-400 transition"
                          title="Copy Contract"
                        >
                          {copiedContract === item.contract ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Severity Badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wide ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Anomaly Title & Score */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      {lang === "darija" ? item.primaryAnomaly.darijaTitle : item.primaryAnomaly.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Score: <span className="font-bold text-white">{item.totalScore}/100</span>
                    </span>
                  </div>

                  {/* Diagnosis Explanation Box */}
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs leading-relaxed text-slate-300">
                    <p>
                      {lang === "darija" ? item.primaryAnomaly.darijaDesc : item.primaryAnomaly.description}
                    </p>
                  </div>
                </div>

                {/* Key On-Chain Metrics Grid */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                      <div className="text-[10px] text-slate-400">Volume 24h</div>
                      <div className="font-mono font-bold text-white">${fmtCompact(item.volume24h)}</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                      <div className="text-[10px] text-slate-400">Liquidité Pool</div>
                      <div className={`font-mono font-bold ${item.liquidity < 2000 ? "text-rose-400" : "text-white"}`}>
                        ${fmtCompact(item.liquidity)}
                      </div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                      <div className="text-[10px] text-slate-400">Ratio Vol / Liq</div>
                      <div className={`font-mono font-bold ${item.volLiqRatio > 10 ? "text-amber-400" : "text-slate-200"}`}>
                        {item.volLiqRatio.toFixed(1)}x
                      </div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                      <div className="text-[10px] text-slate-400">Buys vs Sells (24h)</div>
                      <div className="font-mono font-bold text-xs flex items-center gap-1">
                        <span className="text-emerald-400">{item.buys24h}B</span>
                        <span className="text-slate-500">/</span>
                        <span className={item.sells24h === 0 ? "text-rose-400 font-extrabold" : "text-rose-400"}>
                          {item.sells24h}S
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & 24h Change */}
                  <div className="flex items-center justify-between text-xs px-1 pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Prix: ${item.price > 0.0001 ? item.price.toFixed(4) : item.price.toExponential(2)}
                    </span>
                    <span className={`font-mono font-bold flex items-center gap-0.5 ${isPump ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPump ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPump ? "+" : ""}{item.change24h.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      if (onSelectToken) {
                        onSelectToken({
                          id: item.contract,
                          contract: item.contract,
                          symbol: item.symbol,
                          name: item.name,
                          basePrice: item.price,
                          volume24h: item.volume24h,
                          liquidity: item.liquidity,
                          marketCap: item.fdv
                        });
                      }
                      if (onNavigate) {
                        onNavigate("ai-audit");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition active:scale-95 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Audit</span>
                  </button>

                  <a
                    href={item.pairUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                    title="Voir sur DexScreener"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW: Compact Table */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-3">Anomalie Détectée</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3 text-right">Prix</th>
                <th className="py-3 px-3 text-right">24h Vol</th>
                <th className="py-3 px-3 text-right">Liquidité</th>
                <th className="py-3 px-3 text-right">Vol / Liq</th>
                <th className="py-3 px-3 text-center">Buys / Sells</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAnomalies.map((item) => {
                const badge = getSeverityBadge(item.primaryAnomaly.category);
                const isPump = item.change24h > 0;

                return (
                  <tr key={item.contract} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-white font-mono">${item.symbol}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.contract.slice(0, 6)}...{item.contract.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-slate-300 font-medium truncate max-w-[200px]">
                          {lang === "darija" ? item.primaryAnomaly.darijaTitle : item.primaryAnomaly.title}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-white">{item.totalScore}/100</span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <div className="text-white">${item.price > 0.0001 ? item.price.toFixed(4) : item.price.toExponential(2)}</div>
                      <div className={`text-[10px] ${isPump ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPump ? "+" : ""}{item.change24h.toFixed(1)}%
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-white font-semibold">
                      ${fmtCompact(item.volume24h)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-white">
                      ${fmtCompact(item.liquidity)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                      {item.volLiqRatio.toFixed(1)}x
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-emerald-400">{item.buys24h}B</span> /{" "}
                      <span className={item.sells24h === 0 ? "text-rose-400 font-bold" : "text-rose-400"}>
                        {item.sells24h}S
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onSelectToken) {
                              onSelectToken({
                                id: item.contract,
                                contract: item.contract,
                                symbol: item.symbol,
                                name: item.name,
                                basePrice: item.price,
                                volume24h: item.volume24h,
                                liquidity: item.liquidity,
                                marketCap: item.fdv
                              });
                            }
                            if (onNavigate) {
                              onNavigate("ai-audit");
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold transition cursor-pointer"
                        >
                          Audit
                        </button>
                        <a
                          href={item.pairUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
