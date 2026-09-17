import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Flame,
  Droplets,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Search,
  ArrowRight,
  Zap,
  Activity,
  Download,
  Layers,
  Share2
} from "lucide-react";
import { auditArcToken } from "../services/tokenAuditService";
import { scanFullArcToken } from "../services/dexService";

export function TokenAuditView({ activeToken, allTokens, onSelectToken, onNavigate }) {
  const [searchAddr, setSearchAddr] = useState(activeToken?.contract || "");
  const [tokenData, setTokenData] = useState(activeToken || null);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleTokens = [
    { label: "$ARGUS", addr: "0xece5ca8bf9220718e5727754026757512212cb3c" },
    { label: "$TOLLY", addr: "0x6002ae7976cc966eb89487cbb8867a5f64ee3908" },
    { label: "$ZYORA", addr: "0x3d1c15916d852fa8ce41708bc55e55ba2cdd55d0" },
    { label: "$WARP", addr: "0x981be99ee8a38575a7b0559eb4ad2fbe4e680a6d" },
    { label: "$ELLIPSE", addr: "0xd837ae31fc9dbebb5a0f5df7cf8baeb3f8a0a911" }
  ];

  const runAudit = async (addrToScan) => {
    const targetAddr = addrToScan || searchAddr;
    if (!targetAddr || !targetAddr.startsWith("0x") || targetAddr.length !== 42) return;

    setLoading(true);
    try {
      // 1. Check if it's already in memory or scan full on-chain
      let current = allTokens?.find(t => t.contract?.toLowerCase() === targetAddr.toLowerCase());
      if (!current) {
        current = await scanFullArcToken(targetAddr);
      }
      if (current) {
        setTokenData(current);
        const result = await auditArcToken(current);
        setAudit(result);
      }
    } catch (e) {
      console.error("Audit error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeToken) {
      setSearchAddr(activeToken.contract || "");
      setTokenData(activeToken);
      auditArcToken(activeToken).then(setAudit);
    }
  }, [activeToken]);

  const handleCopy = () => {
    if (!tokenData?.contract) return;
    navigator.clipboard.writeText(tokenData.contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const score = audit?.totalScore || 50;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#111c38] to-[#0c1220] border border-cyan-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Arc L1 On-Chain Intelligence Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Token Research & Success Probability Engine
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Audit instantané et approfondi de n'importe quel token Arc L1 : décomposition des frais, modèle anti-dump créateur, calcul algorithmique du score de viabilité (0-100%) et schéma du mécanisme économique.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-lg cursor-pointer"
              title="Exporter le rapport d'audit au format imprimable"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Print / Save PDF</span>
            </button>
            {tokenData && (
              <button
                onClick={() => {
                  if (onSelectToken) onSelectToken(tokenData);
                  if (onNavigate) onNavigate("overview");
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>Full Matrix Overview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Quick Chips Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchAddr}
              onChange={(e) => setSearchAddr(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit(searchAddr)}
              placeholder="Paste any Arc L1 Contract Address (0x...)"
              className="w-full pl-10 pr-24 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              onClick={() => runAudit(searchAddr)}
              disabled={loading || !searchAddr}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
            >
              {loading ? "Scanning..." : "Audit"}
            </button>
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0">Quick Test:</span>
            {sampleTokens.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setSearchAddr(s.addr);
                  runAudit(s.addr);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition shrink-0 cursor-pointer ${
                  searchAddr.toLowerCase() === s.addr.toLowerCase()
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm font-mono text-cyan-400 animate-pulse">
            Inspection On-Chain RPC · Détection Bytecode · Calcul du Score de Probabilité...
          </p>
        </div>
      )}

      {!loading && audit && (
        <>
          {/* Main Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Score & Viability Card (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0f1523] border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Viability Engine</div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Success Probability Score</span>
                  </h3>
                </div>
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-mono font-bold"
                  style={{ backgroundColor: `${audit.tier.color}20`, color: audit.tier.color, border: `1px solid ${audit.tier.color}40` }}
                >
                  Grade {audit.tier.grade}
                </span>
              </div>

              {/* Circular Gauge */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke="#1e293b"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Dynamic progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke={audit.tier.color}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      {audit.totalScore}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Probability</span>
                  </div>
                </div>

                <div
                  className="mt-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
                  style={{ backgroundColor: `${audit.tier.color}15`, color: audit.tier.color, border: `1px solid ${audit.tier.color}30` }}
                >
                  {audit.tier.label}
                </div>
              </div>

              {/* Verdict paragraph */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold">Diagnostic : </span>
                {audit.tier.verdict}
              </div>
            </div>

            {/* Token Overview & Pillars (7 Cols) */}
            <div className="lg:col-span-7 bg-[#0f1523] border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white tracking-tight">${audit.symbol}</h2>
                    <span className="text-xs text-slate-400">{audit.name}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-semibold">
                      Arc L1
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                      {audit.contract}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://arc.etherscan.io/token/${audit.contract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400 transition"
                      title="View on Arc Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400 font-mono">Spot Price</div>
                  <div className="text-lg font-extrabold font-mono text-white">
                    ${audit.price < 0.0001 ? audit.price.toFixed(8) : audit.price.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* 5 Pillars Progress Bars */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Score Breakdown (Multi-Factor Breakdown)</span>
                  <span className="text-[11px] text-cyan-400 font-mono">5 Piliers On-Chain</span>
                </div>

                {Object.entries(audit.breakdown).map(([key, item]) => {
                  const pct = Math.round((item.score / item.max) * 100);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          <strong className="text-white">{item.score}</strong> / {item.max} pts
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background:
                              pct >= 75
                                ? "linear-gradient(90deg, #10b981, #059669)"
                                : pct >= 45
                                ? "linear-gradient(90deg, #f59e0b, #d97706)"
                                : "linear-gradient(90deg, #ef4444, #dc2626)"
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{item.comment}</div>
                    </div>
                  );
                })}
              </div>

              {/* Ecosystem Architecture Badge */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Modèle & Catégorie</div>
                    <div className="text-xs font-bold text-white">{audit.ecosystemType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Total Burned</div>
                  <div className="text-xs font-mono font-bold text-orange-400">
                    {audit.burnPct.toFixed(2)}% Supply
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Flywheel & Economic Flowchart (Schema bhal l-PDF!) */}
          <div className="bg-[#0f1523] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div>
                <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                  Mécanisme & Schéma Économique
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Flux des Capitaux & Répartition des Frais de Trading</span>
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Settled in Native USDC (0x3600...0000)
              </span>
            </div>

            {/* Dynamic Visual Diagram */}
            <div className="p-6 rounded-xl bg-slate-950/90 border border-slate-800/90 overflow-x-auto">
              <div className="min-w-[680px] flex items-center justify-between gap-4">
                {/* Step 1: User Trade */}
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-900 border border-cyan-500/30 w-36 shrink-0 shadow-lg shadow-cyan-500/5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Trade Utilisateur</div>
                  <div className="text-[10px] text-slate-400 mt-1">Buy / Sell Swap</div>
                  <div className="text-[9px] font-mono text-cyan-400 mt-1">Sur AMM Arc</div>
                </div>

                <div className="flex items-center text-cyan-400 font-bold text-xs shrink-0">
                  <span>──▶</span>
                </div>

                {/* Step 2: Protocol Fee */}
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-900 border border-blue-500/40 w-44 shrink-0 shadow-lg shadow-blue-500/5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2 font-mono font-extrabold text-sm">
                    {audit.flowchart?.feeRate || "1%"}
                  </div>
                  <div className="text-xs font-bold text-white truncate max-w-[150px]" title={audit.flowchart?.protocolTitle}>
                    {audit.flowchart?.protocolTitle || "Protocole AMM"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Frais de Transaction</div>
                  <div className="text-[9px] font-mono text-blue-400 mt-1">
                    {audit.flowchart?.legAsset || "Native USDC Leg"}
                  </div>
                </div>

                <div className="flex items-center text-blue-400 font-bold text-xs shrink-0">
                  <span>──▶</span>
                </div>

                {/* Step 3: Dynamic Distribution Streams */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(audit.flowchart?.streams || [
                    { label: "🔥 Buyback & Burn", pct: "50%", desc: "Incinération Dead Wallet", color: "orange" },
                    { label: "💰 Holders Payback", pct: "25%", desc: "Redistribution holders", color: "emerald" },
                    { label: "🏆 Rewards Pot", pct: "15%", desc: "Programme communautaire", color: "yellow" },
                    { label: "👥 Team & Ops", pct: "10%", desc: "Développement & Croissance", color: "purple" }
                  ]).map((st, i) => {
                    const colorStyles = {
                      emerald: "bg-emerald-950/40 border-emerald-500/30 text-emerald-400",
                      orange: "bg-orange-950/40 border-orange-500/30 text-orange-400",
                      cyan: "bg-cyan-950/40 border-cyan-500/30 text-cyan-400",
                      yellow: "bg-yellow-950/40 border-yellow-500/30 text-yellow-400",
                      purple: "bg-purple-950/40 border-purple-500/30 text-purple-400",
                      blue: "bg-blue-950/40 border-blue-500/30 text-blue-400"
                    };
                    const styleClass = colorStyles[st.color] || colorStyles.cyan;
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${styleClass}`}>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{st.label}</span>
                          <span>{st.pct}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 mt-1 leading-tight">{st.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
              <strong className="text-cyan-400">Mise en perspective : </strong>
              {audit.feeMechanism}
            </div>
          </div>

          {/* Strengths & Red Flags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-[#0f1523] border border-emerald-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Points Forts & Catalyseurs Détectés ({audit.strengths.length})</span>
              </div>
              <div className="space-y-2.5">
                {audit.strengths.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings & Risk Factors */}
            <div className="bg-[#0f1523] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Facteurs de Vigilance & Risques ({audit.warnings.length})</span>
              </div>
              <div className="space-y-2.5">
                {audit.warnings.length > 0 ? (
                  audit.warnings.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{w.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{w.desc}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 text-xs text-slate-400 text-center">
                    Aucun drapeau rouge critique détecté sur ce token.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Executive Intelligence Synthesis */}
          <div className="bg-[#0f1523] border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Synthèse d'Intelligence Stratégique (AI Executive Summary)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {audit.narrative}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
