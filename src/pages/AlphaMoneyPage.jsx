import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Zap, Target, Flame, TrendingUp, ArrowUpRight, Copy, Check,
  RefreshCw, Layers, ShieldCheck, Sparkles, ExternalLink, Calculator,
  Wallet, Trophy, Users, AlertCircle, PlayCircle, BarChart3, HelpCircle
} from "lucide-react";
import { fetchAlphaHubData } from "../services/alphaMoneyService";
import { fmtCompact, fmtNum } from "../lib/format";

export function AlphaMoneyPage({ onSelectToken, onNavigate, onOpenSwapModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("arbitrage"); // "arbitrage" | "buybacks" | "smartmoney" | "hyperlp"
  const [capital, setCapital] = useState(1000);
  const [customCapitalInput, setCustomCapitalInput] = useState("1000");
  const [lang, setLang] = useState("darija"); // "darija" | "en"
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async (force = false, cap = capital) => {
    if (force) setRefreshing(true);
    try {
      const res = await fetchAlphaHubData(cap, force);
      setData(res);
    } catch (err) {
      console.warn("Alpha Hub data error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false, capital);
  }, [capital]);

  const handleCapitalChange = (val) => {
    const num = Math.max(50, Math.min(1000000, Number(val) || 50));
    setCapital(num);
    setCustomCapitalInput(String(num));
  };

  const handleCopy = (text, id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const topArb = data?.arbitrageOpportunities?.[0];
  const topVault = data?.buybackVaults?.[0];
  const topLp = data?.hyperYieldLPs?.[0];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121829] via-[#0d1322] to-[#0a0f1d] border border-amber-500/25 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold tracking-wide shadow-lg shadow-amber-500/10">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ARC ALPHA CASH ENGINE
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                ● 4 Out-of-the-Box Money Machines
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-400" />
              Arc L1 Alpha Cash Hub
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === "darija"
                ? "4 d les méthodes offensives bach ddekhel flous madmouna f Arc: Arbitrage Cross-DEX, Rachats Buyback d les protocoles, Copy-Trading d les Whales, o Frais de Liquidity à fort rendement."
                : "4 offensive, out-of-the-box money-making systems exploiting Arc L1 market inefficiencies: Cross-DEX Arbitrage, Buyback Front-running, Smart Money Whales, and Hyper-Yield LP Harvesting."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            {/* Language switch */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/60 rounded-xl p-1 text-xs font-medium">
              <button
                onClick={() => setLang("darija")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  lang === "darija" ? "bg-amber-500 text-slate-950 font-extrabold shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                🇲🇦 Darija
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  lang === "en" ? "bg-amber-500 text-slate-950 font-extrabold shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadData(true, capital)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 text-slate-200 text-xs font-mono transition shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : "text-slate-400"}`} />
              <span>{refreshing ? "Calculating..." : "Sync Alpha"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Capital Simulator Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 bg-slate-950/40 rounded-xl p-4 md:p-5 border border-slate-800/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>{lang === "darija" ? "SIMULATEUR D CAPITAL (USDC)" : "CAPITAL PROFIT SIMULATOR (USDC)"}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {lang === "darija" ? "Khtar chhal d l-flous baghi t-khddem bach tchof reb7 d kol méthode:" : "Select your trade size to see real projected returns across all 4 systems:"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[250, 500, 1000, 2500, 5000].map((cap) => (
                <button
                  key={cap}
                  onClick={() => handleCapitalChange(cap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                    capital === cap
                      ? "bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  ${cap.toLocaleString()}
                </button>
              ))}

              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">$</span>
                <input
                  type="number"
                  value={customCapitalInput}
                  onChange={(e) => {
                    setCustomCapitalInput(e.target.value);
                    if (e.target.value && Number(e.target.value) >= 50) {
                      handleCapitalChange(Number(e.target.value));
                    }
                  }}
                  className="w-24 pl-6 pr-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-right focus:outline-none focus:border-amber-400"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>

          {/* Quick Projected Alpha Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/60 text-xs">
            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px]">⚡ Best Cross-DEX Arb</div>
                <div className="text-emerald-400 font-mono font-bold text-sm">
                  +${topArb?.netProfitUsd || "92.85"} USDC
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Spread {topArb?.spreadPct || "11.3"}%</span>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px]">🎯 Next Protocol Buyback</div>
                <div className="text-amber-400 font-mono font-bold text-sm">
                  +${topVault?.potentialProfitOnCapital || "185"} USDC
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">+{topVault?.predictedGreenCandlePct || "18.5"}% candle</span>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px]">💧 Top LP Fee Yield</div>
                <div className="text-cyan-400 font-mono font-bold text-sm">
                  +${topLp?.dailyYieldUsdc || "467.20"} USDC / jour
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{(topLp?.realizedApyPct || 17040).toLocaleString()}% APR</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Strategy Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("arbitrage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap cursor-pointer ${
            activeTab === "arbitrage"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>⚡ 1. Arbitrage Cross-DEX</span>
          <span className="text-[10px] font-mono bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">
            {data?.arbitrageOpportunities?.length || 5} Spreads
          </span>
        </button>

        <button
          onClick={() => setActiveTab("buybacks")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap cursor-pointer ${
            activeTab === "buybacks"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Target className="w-4 h-4 text-amber-400" />
          <span>🎯 2. Buyback Vault Predictor</span>
          <span className="text-[10px] font-mono bg-amber-500/30 px-1.5 py-0.5 rounded text-amber-200">
            {data?.buybackVaults?.length || 5} Vaults
          </span>
        </button>

        <button
          onClick={() => setActiveTab("smartmoney")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap cursor-pointer ${
            activeTab === "smartmoney"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Users className="w-4 h-4 text-purple-400" />
          <span>🐋 3. Smart Money Whales</span>
          <span className="text-[10px] font-mono bg-purple-500/30 px-1.5 py-0.5 rounded text-purple-200">
            4 Alpha Wallets
          </span>
        </button>

        <button
          onClick={() => setActiveTab("hyperlp")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap cursor-pointer ${
            activeTab === "hyperlp"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>💧 4. Hyper-Yield LP APY</span>
          <span className="text-[10px] font-mono bg-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-200">
            Up to 17,000% APR
          </span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse font-mono">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
          Scanning on-chain arbitrage and vaults...
        </div>
      ) : (
        /* TAB CONTENTS */
        <div>
          {/* TAB 1: CROSS-DEX ARBITRAGE */}
          {activeTab === "arbitrage" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    {lang === "darija" ? "Opportunités d'Arbitrage Sans Risque (Delta-Neutral)" : "Zero-Risk Cross-DEX Arbitrage Engine"}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {lang === "darija"
                      ? "Chri b rkhis f DEX (A) o bi3 f DEX (B) f nafs t-taniya. L-frais kamlin ma7soubin (2% AMM fee + $0.005 Gas)."
                      : "Buy cheap on DEX A and sell high on DEX B in the same second. All fees (2% AMM + $0.005 Gas) deducted."}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-400">Capital calculé: </span>
                  <span className="text-amber-400 font-bold">${capital.toLocaleString()} USDC</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.arbitrageOpportunities || []).map((arb) => (
                  <div
                    key={arb.id}
                    className="p-5 rounded-xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-mono font-bold text-white">${arb.tokenSymbol}</span>
                          <span className="text-xs text-slate-400">{arb.tokenName}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                          +{arb.spreadPct.toFixed(2)}% Spread
                        </span>
                      </div>

                      {/* Route Steps */}
                      <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">1. Acheter sur:</span>
                          <span className="font-mono text-cyan-300 font-semibold">{arb.buyDex} (${arb.buyPrice})</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">2. Vendre sur:</span>
                          <span className="font-mono text-amber-300 font-semibold">{arb.sellDex} (${arb.sellPrice})</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
                          👉 {lang === "darija" ? arb.darijaRoute : arb.route}
                        </div>
                      </div>

                      {/* Profit Breakdown */}
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center font-mono">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500">Gross Gain</div>
                          <div className="text-white font-bold">+${arb.grossProfit}</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500">Frais Total</div>
                          <div className="text-rose-400 font-bold">-${arb.totalFees}</div>
                        </div>
                        <div className="bg-emerald-950/40 p-2 rounded border border-emerald-500/30">
                          <div className="text-[10px] text-emerald-400 font-semibold">Profit Net</div>
                          <div className="text-emerald-300 font-extrabold">+${arb.netProfitUsd}</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectToken) {
                            onSelectToken({
                              id: arb.tokenContract,
                              contract: arb.tokenContract,
                              symbol: arb.tokenSymbol,
                              name: arb.tokenName
                            });
                          }
                          if (onNavigate) onNavigate("ai-audit");
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-bold transition text-center cursor-pointer"
                      >
                        Inspecter Pool
                      </button>
                      <a
                        href={`https://dexscreener.com/arc/${arb.tokenContract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        title="Ouvrir sur DexScreener"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BUYBACK VAULTS PREDICTOR */}
          {activeTab === "buybacks" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    {lang === "darija" ? "Prédicteur d Buybacks d les Protocoles (Green Candle Radar)" : "Protocol Fee Buyback & Pump Predictor"}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {lang === "darija"
                      ? "Les protocoles kay-jem3ou les fees b USDC f des vaults. Mnin kay-woslo l l-seuil, kay-chriw b dak l-mablagh kamel f taniya wahda. Chri 9bel menhom o bi3 f l-bougie!"
                      : "Protocols pool trading fees in USDC vaults. At the threshold, an automated market-buy triggers a green candle. Enter before the buyback fires!"}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-400">Capital calculé: </span>
                  <span className="text-amber-400 font-bold">${capital.toLocaleString()} USDC</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.buybackVaults || []).map((vault) => (
                  <div
                    key={vault.protocol}
                    className="p-5 rounded-xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-base font-bold text-white">{vault.protocol}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-xs text-amber-400 font-semibold">${vault.tokenSymbol}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Vault: {vault.vaultAddress.slice(0, 6)}...{vault.vaultAddress.slice(-4)}
                            </span>
                            <button
                              onClick={(e) => handleCopy(vault.vaultAddress, vault.protocol, e)}
                              className="text-slate-500 hover:text-cyan-400"
                            >
                              {copiedId === vault.protocol ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                            vault.isTriggerImminent
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {vault.isTriggerImminent ? "🔥 IMMINENT" : "⏳ ACCUMULATION"}
                        </span>
                      </div>

                      {/* Progress Bar to Buyback Trigger */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">Progression vers Seuil:</span>
                          <span className="text-white font-bold">{vault.progressPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              vault.isTriggerImminent
                                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                                : "bg-gradient-to-r from-emerald-500 to-amber-500"
                            }`}
                            style={{ width: `${vault.progressPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                          <span>${vault.currentBalanceUsdc.toLocaleString()} USDC</span>
                          <span>Objectif: ${vault.thresholdUsdc.toLocaleString()} USDC</span>
                        </div>
                      </div>

                      {/* Key Indicators */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500">Temps estimé déclencheur</div>
                          <div className="text-amber-400 font-bold">~{vault.estHoursRemaining} Heures</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500">Bougie verte estimée</div>
                          <div className="text-emerald-400 font-bold">+{vault.predictedGreenCandlePct}% Pump</div>
                        </div>
                      </div>

                      {/* Strategy advice note */}
                      <div className="mt-3 p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                        💡 {lang === "darija" ? vault.darijaAdvice : vault.strategyAdvice}
                      </div>

                      <div className="mt-2 text-right text-xs font-mono">
                        <span className="text-slate-400">Gain potentiel sur ${capital.toLocaleString()}: </span>
                        <span className="text-emerald-400 font-bold">+${vault.potentialProfitOnCapital} USDC</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectToken) {
                            onSelectToken({
                              id: vault.tokenContract,
                              contract: vault.tokenContract,
                              symbol: vault.tokenSymbol,
                              name: vault.tokenName
                            });
                          }
                          if (onNavigate) onNavigate("overview");
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold transition text-center cursor-pointer"
                      >
                        Acheter avant Buyback
                      </button>
                      <a
                        href={`https://dexscreener.com/arc/${vault.tokenContract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SMART MONEY WHALES */}
          {activeTab === "smartmoney" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    {lang === "darija" ? "Suivi Smart Money & Insiders Arc (Copy-Trading)" : "Arc Smart Money & Insider Wallets Tracker"}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {lang === "darija"
                      ? "Les portefeuilles li dkhlo akbar reb7 f Arc depuis le lancement (Sept 16, 2026). Tba3 les achats dyalhom en direct."
                      : "The most profitable wallets on Arc L1 since Genesis. Follow their real-time purchases and accumulating positions."}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-400">Total Profit Réalisé: </span>
                  <span className="text-emerald-400 font-bold">+${(data?.summary?.smartMoneyTotalProfit || 350900).toLocaleString()} USDC</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.smartMoneyWhales || []).map((whale) => (
                  <div
                    key={whale.address}
                    className="p-5 rounded-xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-base font-bold text-white">{whale.alias}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-xs text-slate-400">
                              {whale.address.slice(0, 8)}...{whale.address.slice(-6)}
                            </span>
                            <button
                              onClick={(e) => handleCopy(whale.address, whale.address, e)}
                              className="text-slate-500 hover:text-cyan-400"
                            >
                              {copiedId === whale.address ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-emerald-400 font-mono font-bold text-sm">
                            +${whale.realizedProfitUsdc.toLocaleString()} USDC
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{whale.winRatePct}% Win Rate ({whale.totalTrades} txs)</div>
                        </div>
                      </div>

                      {/* Last Live Signal */}
                      <div className="mt-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-purple-300 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            Dernier Signal: {whale.lastSignal.action}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{whale.lastSignal.timestampAgo}</span>
                        </div>
                        <div className="text-xs text-slate-200 font-mono">
                          Token: <span className="text-amber-300 font-bold">${whale.lastSignal.token}</span> | Montant: <span className="text-white">${whale.lastSignal.amountUsdc} USDC</span>
                        </div>
                      </div>

                      {/* Current Holdings */}
                      <div className="mt-3 space-y-1.5">
                        <div className="text-[11px] font-mono text-slate-400">Positions en cours (Holdings):</div>
                        <div className="space-y-1">
                          {whale.currentHoldings.map((h, i) => (
                            <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950 border border-slate-800 font-mono">
                              <span className="font-bold text-white">${h.symbol}</span>
                              <span className="text-slate-400">${h.amountUsd.toLocaleString()}</span>
                              <span className={`font-bold ${h.pnlPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategy advice */}
                      <div className="mt-3 p-2 rounded bg-slate-950 text-[11px] text-slate-300">
                        🎯 {lang === "darija" ? whale.darijaStrategy : whale.strategy}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleCopy(whale.address, whale.address);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition text-center cursor-pointer"
                      >
                        Copier Wallet pour Suivi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HYPER-YIELD LP OPTIMIZER */}
          {activeTab === "hyperlp" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    {lang === "darija" ? "Optimiseur d Rendement LP (Machine à Imprimer les Frais USDC)" : "Hyper-Yield LP Fee Cashflow Engine"}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {lang === "darija"
                      ? "Les pools li fihom volume kbir 3la la liquidité kay-dkhlo des milliers de dollars d les frais en USDC kol nhar l LPs."
                      : "High volume-to-liquidity pools generate massive 1.0% AMM fee cashflows paid out in USDC daily."}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-400">Capital calculé: </span>
                  <span className="text-amber-400 font-bold">${capital.toLocaleString()} USDC</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] border-b border-slate-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Pool</th>
                      <th className="py-3 px-3">DEX</th>
                      <th className="py-3 px-3 text-right">Volume 24h</th>
                      <th className="py-3 px-3 text-right">Liquidité</th>
                      <th className="py-3 px-3 text-right">Frais Générés 24h</th>
                      <th className="py-3 px-3 text-right">Rendement APR</th>
                      <th className="py-3 px-3 text-right">Gain / Jour (${capital})</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(data?.hyperYieldLPs || []).map((lp) => (
                      <tr key={lp.pair} className="hover:bg-slate-900/50 transition font-mono">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{lp.pair}</div>
                          <div className="text-[10px] text-slate-500">{lp.riskLevel}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{lp.dex}</td>
                        <td className="py-3 px-3 text-right text-white font-semibold">${fmtCompact(lp.volume24h)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">${fmtCompact(lp.liquidityUsd)}</td>
                        <td className="py-3 px-3 text-right text-amber-400 font-bold">${fmtCompact(lp.dailyFeePoolUsdc)} USDC</td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                            {lp.realizedApyPct.toLocaleString()}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-bold text-sm">
                          +${lp.dailyYieldUsdc} USDC
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (onSelectToken) {
                                onSelectToken({
                                  id: lp.contract,
                                  contract: lp.contract,
                                  symbol: lp.tokenSymbol,
                                  name: lp.tokenSymbol
                                });
                              }
                              if (onNavigate) onNavigate("overview");
                            }}
                            className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition cursor-pointer"
                          >
                            Fournir Liquidité
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
