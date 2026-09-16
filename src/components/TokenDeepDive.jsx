import React, { useState } from 'react';
import { 
  ArrowLeft, Flame, TrendingUp, DollarSign, RefreshCw, ShieldCheck, 
  ExternalLink, Copy, Check, Calculator, PieChart, Layers, Zap,
  Activity, ArrowUpRight, BarChart3, Clock, AlertCircle, Coins,
  Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import { formatUSD, formatTokens, truncateAddress, calculateEmberTokenMetrics } from '../services/arcService';

export default function TokenDeepDive({ 
  token, 
  onBack, 
  allTokens = [], 
  onSelectToken 
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedContract, setCopiedContract] = useState(false);
  const [userHoldings, setUserHoldings] = useState(1000000); // 1,000,000 tokens default

  if (!token) return null;

  const metrics = calculateEmberTokenMetrics(token);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  // Calcul du Payback personnel de l'utilisateur
  const userShareOfSupply = metrics.currentSupply > 0 
    ? (userHoldings / metrics.currentSupply) 
    : 0;
  const userDailyPaybackUSD = metrics.dailyHoldersUSD * userShareOfSupply;
  const userMonthlyPaybackUSD = userDailyPaybackUSD * 30;
  const userYearlyPaybackUSD = userDailyPaybackUSD * 365;
  const userHoldingsValueUSD = userHoldings * metrics.currentPrice;
  const userAPY = userHoldingsValueUSD > 0 
    ? ((userYearlyPaybackUSD / userHoldingsValueUSD) * 100).toFixed(1) 
    : '0';

  const tabs = [
    { id: 'all', label: '📑 Vue Complète (Dossier)' },
    { id: 'price', label: '1. Prix & FDV' },
    { id: 'tokenomics', label: '2. Tokenomics' },
    { id: 'burn-wallet', label: '3. Burn Wallet' },
    { id: 'revenue', label: '4. Revenus 24h' },
    { id: 'distribution', label: '5. Boîte Distribution' },
    { id: 'burn-rate', label: '6. Burn Rate' },
    { id: 'projections', label: '7. Projections' },
    { id: 'payback', label: '8. Payback Calculator' },
    { id: 'pairs', label: '9. Paires DEX' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 🧭 Top Navigation & Token Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-arc-border/60 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-arc-card border border-arc-border hover:border-arc-cyan hover:text-arc-cyan text-sm font-semibold transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Terminal Hub</span>
          </button>
          <span className="text-gray-600">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">{token.icon}</span>
            <span className="font-extrabold text-white text-lg tracking-wide">{token.symbol}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-arc-cyan/10 text-arc-cyan border border-arc-cyan/30">
              {token.tag}
            </span>
          </div>
        </div>

        {/* Quick switcher between 4 tokens */}
        {allTokens.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-arc-dark/80 border border-arc-border">
            <span className="text-xs text-gray-400 px-2 font-mono">Changer :</span>
            {allTokens.map((t) => {
              const isCurrent = t.id === token.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectToken(t)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/40 shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-arc-card'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.symbol}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 👑 Hero Token Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-arc-card via-arc-card/90 to-arc-card/60 border border-arc-border/80 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-arc-cyan/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border shrink-0"
              style={{ backgroundColor: `${token.color}15`, borderColor: `${token.color}40` }}
            >
              {token.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{token.name}</h1>
                <span className="text-sm font-bold text-gray-400 font-mono">({token.symbol})</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Arc L1 Verified
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2 font-mono">
                <span className="flex items-center gap-1.5 bg-arc-dark/70 px-2.5 py-1 rounded-lg border border-arc-border">
                  <span className="text-gray-500">Contract:</span>
                  <span className="text-gray-200">{truncateAddress(token.contract)}</span>
                  <button 
                    onClick={() => handleCopy(token.contract)} 
                    className="hover:text-arc-cyan transition-colors cursor-pointer"
                    title="Copier le contrat"
                  >
                    {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a 
                    href={`https://arc.etherscan.io/token/${token.contract}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-arc-cyan transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </span>
                <span className="text-gray-500">•</span>
                <span>DEX: <strong className="text-white">{token.dex}</strong></span>
                <span className="text-gray-500">•</span>
                <span>Frais: <strong className="text-arc-cyan">{token.feeRatePct}%</strong></span>
              </div>
            </div>
          </div>

          {/* Quick summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-arc-dark/60 border border-arc-border/70 text-center">
              <span className="text-xs text-gray-400 block font-mono">Prix Actuel</span>
              <span className="text-xl font-bold font-mono text-arc-cyan">
                ${metrics.currentPrice.toFixed(4)}
              </span>
              <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">
                {token.priceChanges?.h24 || '+0%'} 24h
              </span>
            </div>

            <div className="p-3 rounded-xl bg-arc-dark/60 border border-arc-border/70 text-center">
              <span className="text-xs text-gray-400 block font-mono">Market Cap</span>
              <span className="text-xl font-bold font-mono text-white">
                {formatUSD(token.marketCap)}
              </span>
              <span className="text-[11px] text-gray-400 block font-mono mt-0.5">
                FDV {formatUSD(token.initialSupply * metrics.currentPrice)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-arc-dark/60 border border-arc-border/70 text-center">
              <span className="text-xs text-gray-400 block font-mono">Volume 24h Total</span>
              <span className="text-xl font-bold font-mono text-white">
                {formatUSD(metrics.combinedVolume24h)}
              </span>
              <span className="text-[11px] text-arc-purple block font-mono mt-0.5">
                USDC Native
              </span>
            </div>

            <div className="p-3 rounded-xl bg-arc-dark/60 border border-arc-border/70 text-center">
              <span className="text-xs text-gray-400 block font-mono">Total Burné</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {formatTokens(metrics.grandTotalBurnTokens)}
              </span>
              <span className="text-[11px] text-rose-400 font-mono mt-0.5 block">
                {metrics.pctBurned.toFixed(2)}% détruit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🗂️ Interactive Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-arc-border/70 scrollbar-thin">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-arc-cyan text-gray-950 font-bold shadow-lg shadow-arc-cyan/20 scale-[1.02]'
                  : 'bg-arc-card/70 hover:bg-arc-card text-gray-400 hover:text-white border border-arc-border/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 📑 SECTIONS (Display selected or all) */}
      {/* ========================================================================= */}

      {/* 1️⃣ SECTION 1: Prix, FDV & Variations Live */}
      {(activeTab === 'all' || activeTab === 'price') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arc-cyan/10 border border-arc-cyan/30 flex items-center justify-center text-arc-cyan">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">1. Prix, FDV & Variations Live</h2>
                <p className="text-xs text-gray-400">Dernière cotation en direct via Arc L1 AMM Hooks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400">Flux En Direct</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Prix Spot USDC</span>
              <span className="text-2xl font-black font-mono text-arc-cyan">
                ${metrics.currentPrice.toFixed(4)}
              </span>
              <span className="text-xs text-gray-500 block font-mono mt-1">Équivalent 100% USDC-backed</span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Market Cap Circulant</span>
              <span className="text-2xl font-black font-mono text-white">
                {formatUSD(metrics.currentSupply * metrics.currentPrice)}
              </span>
              <span className="text-xs text-emerald-400 block font-mono mt-1">Basé sur supply restant</span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">FDV (Fully Diluted)</span>
              <span className="text-2xl font-black font-mono text-gray-300">
                {formatUSD(metrics.initialSupply * metrics.currentPrice)}
              </span>
              <span className="text-xs text-gray-500 block font-mono mt-1">Supply théorique 1,000,000,000</span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Liquidité Verrouillée</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {formatUSD(token.liquidity)}
              </span>
              <span className="text-xs text-amber-400/80 block font-mono mt-1">Piscine USDC sécurisée</span>
            </div>
          </div>

          {/* Variations Table */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            {[
              { label: '5m', val: token.priceChanges?.m5 || '+0.0%' },
              { label: '1h', val: token.priceChanges?.h1 || '+0.0%' },
              { label: '6h', val: token.priceChanges?.h6 || '+0.0%' },
              { label: '24h', val: token.priceChanges?.h24 || '+0.0%' }
            ].map((p, idx) => {
              const isPos = !p.val.startsWith('-');
              return (
                <div key={idx} className="p-3 rounded-xl bg-arc-dark/50 border border-arc-border/60 text-center">
                  <span className="text-xs text-gray-400 block font-mono mb-0.5">{p.label}</span>
                  <span className={`text-base font-bold font-mono ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2️⃣ SECTION 2: Tokenomics & Supply */}
      {(activeTab === 'all' || activeTab === 'tokenomics') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">2. Tokenomics & État de la Supply</h2>
                <p className="text-xs text-gray-400">Structure de distribution et contrôle d'émission de jetons</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Audit Arc: Révocation Complète
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Supply Initiale Fixe</span>
              <span className="text-xl font-bold font-mono text-white">
                {formatTokens(metrics.initialSupply)}
              </span>
              <span className="text-[11px] text-gray-500 block font-mono mt-1">1,000,000,000 jetons</span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Supply Actuelle Restante</span>
              <span className="text-xl font-bold font-mono text-arc-cyan">
                {formatTokens(metrics.currentSupply)}
              </span>
              <span className="text-[11px] text-gray-400 block font-mono mt-1">En circulation sur Arc</span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Tokens Déjà Burnés</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {formatTokens(metrics.totalBurnedTokens)}
              </span>
              <span className="text-[11px] text-rose-400/80 block font-mono mt-1">
                Envoyés à l'adresse Dead
              </span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Burn en Attente (Buffer)</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {formatTokens(metrics.pendingBurnTokens)}
              </span>
              <span className="text-[11px] text-amber-400/80 block font-mono mt-1">
                Accumulation txs 24h
              </span>
            </div>
          </div>

          {/* Progress Bar of Burn */}
          <div className="p-4 rounded-xl bg-arc-dark/50 border border-arc-border/60 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-300">Progression Totale du Burn de la Supply :</span>
              <span className="text-rose-400 font-bold">{metrics.pctBurned.toFixed(2)}% DÉTRUIT</span>
            </div>
            <div className="w-full h-3 bg-arc-dark rounded-full overflow-hidden p-0.5 border border-arc-border">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 rounded-full transition-all duration-500 shadow-sm shadow-rose-500/50"
                style={{ width: `${Math.min(100, metrics.pctBurned)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-500 font-mono">
              <span>0% (Genesis)</span>
              <span>Offre Déflationniste Agressive</span>
              <span>100% (Cap Ultime)</span>
            </div>
          </div>

          {/* Security Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Mint Authority Révocable</span>
                <span className="text-[11px] text-emerald-400 font-mono">RÉVOQUÉE (Impossible d'émettre)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Freeze Authority</span>
                <span className="text-[11px] text-emerald-400 font-mono">RÉVOQUÉE (Aucun gel possible)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Smart Contract Ownership</span>
                <span className="text-[11px] text-emerald-400 font-mono">100% Immutable sur Arc L1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ SECTION 3: Burn Wallet Live Stats */}
      {(activeTab === 'all' || activeTab === 'burn-wallet') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">3. Burn Wallet Live Stats</h2>
                <p className="text-xs text-gray-400">Surveillance on-chain du portefeuille d'incinération irréversible</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> 1 tx toutes les ~{token.burnWalletTxRateSec}s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Adresse Burn Officielle</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-mono text-rose-400 font-bold">
                  {truncateAddress(token.burnWallet)}
                </span>
                <button 
                  onClick={() => handleCopy(token.burnWallet)}
                  className="p-1 rounded hover:bg-arc-card text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-gray-500 block font-mono mt-2">
                0x000...dEaD (Clé privée détruite)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Nombre Total de Transactions</span>
              <span className="text-2xl font-black font-mono text-white">
                {token.burnWalletTxs.toLocaleString()} txs
              </span>
              <span className="text-[11px] text-emerald-400 block font-mono mt-1">
                Enregistrées sur Arc Testnet L1
              </span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">Valeur Totale Détruite en USD</span>
              <span className="text-2xl font-black font-mono text-rose-400">
                {formatUSD(metrics.grandTotalBurnTokens * metrics.currentPrice)}
              </span>
              <span className="text-[11px] text-gray-400 block font-mono mt-1">
                Au cours actuel de ${metrics.currentPrice.toFixed(4)}
              </span>
            </div>
          </div>

          {/* On-Chain Pattern explanation */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <Zap className="w-4 h-4" />
              <span>Mécanisme de Buyback & Burn Automatique par Swap Arc</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Sur le réseau Arc, chaque transaction exécutée via l'AMM prélève les frais protocolaires en <strong>USDC natif</strong>. 
              Le contrat route instantanément <strong>50%</strong> de ces frais vers le pool de liquidité pour racheter du {token.symbol} 
              sur le marché ouvert avant de l'expédier directement à l'adresse Dead (<code>{truncateAddress(token.burnWallet)}</code>). 
              La vitesse observée est de <strong>1 transaction de burn toutes les {token.burnWalletTxRateSec} secondes</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 4️⃣ SECTION 4: Revenu & Frais 24h */}
      {(activeTab === 'all' || activeTab === 'revenue') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">4. Revenus 24h & Frais Générés</h2>
                <p className="text-xs text-gray-400">Flux de trésorerie générés par les paires directes et l'écosystème launchpad</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-arc-cyan/10 text-arc-cyan border border-arc-cyan/30">
              Total Frais: {formatUSD(metrics.totalFeesDaily)} / 24h
            </span>
          </div>

          {/* Direct Pairs Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
              A. Paires Directes du Token ({token.symbol})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-dark/60">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-arc-border bg-arc-dark text-gray-400">
                    <th className="py-3 px-4">Paire</th>
                    <th className="py-3 px-4">DEX / Pool</th>
                    <th className="py-3 px-4">Volume 24h</th>
                    <th className="py-3 px-4">Frais Générés (1%)</th>
                    <th className="py-3 px-4 text-right">Liquidité Pool</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-arc-border/60 text-gray-200">
                  {token.directPairs && token.directPairs.map((pair, idx) => (
                    <tr key={idx} className="hover:bg-arc-card/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{pair.pair}</td>
                      <td className="py-3 px-4 text-gray-400">{pair.dex}</td>
                      <td className="py-3 px-4 text-arc-cyan font-bold">{formatUSD(pair.volume24h)}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{formatUSD(pair.fees)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{formatUSD(pair.liquidity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ecosystem Pairs */}
          {token.ecosystemPairs && token.ecosystemPairs.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                B. Paires Écosystème Launchpad Rattachées
              </h3>
              <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-dark/60">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-arc-border bg-arc-dark text-gray-400">
                      <th className="py-3 px-4">Token Meme / Dérivé</th>
                      <th className="py-3 px-4">Nom</th>
                      <th className="py-3 px-4">Volume 24h</th>
                      <th className="py-3 px-4">Frais Écosystème</th>
                      <th className="py-3 px-4 text-right">Liquidité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-arc-border/60 text-gray-200">
                    {token.ecosystemPairs.map((pair, idx) => (
                      <tr key={idx} className="hover:bg-arc-card/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-arc-purple">{pair.symbol}</td>
                        <td className="py-3 px-4 text-gray-400">{pair.name}</td>
                        <td className="py-3 px-4 text-white">{formatUSD(pair.volume24h)}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{formatUSD(pair.volume24h * 0.01)}</td>
                        <td className="py-3 px-4 text-right text-gray-300">{formatUSD(pair.liquidity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono">Volume Total Cumulé</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {formatUSD(metrics.combinedVolume24h)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono">Total Frais Collectés (24h)</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {formatUSD(metrics.totalFeesDaily)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono">Projection Frais / Mois (30j)</span>
              <span className="text-xl font-bold font-mono text-arc-cyan mt-1 block">
                {formatUSD(metrics.totalFeesDaily * 30)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5️⃣ SECTION 5: Boîte de Distribution Financière */}
      {(activeTab === 'all' || activeTab === 'distribution') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arc-purple/10 border border-arc-purple/30 flex items-center justify-center text-arc-purple">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">5. La Boîte de Distribution Financière</h2>
                <p className="text-xs text-gray-400">Exactement comme dans Ember : ventilation stricte et automatisée des frais</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-arc-purple/10 text-arc-purple border border-arc-purple/30">
              100% Automatique On-Chain
            </span>
          </div>

          {/* Distribution Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 50% Burn */}
            <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/40 relative overflow-hidden">
              <div className="text-xs font-mono text-rose-400 font-bold mb-1 flex items-center justify-between">
                <span>🔥 BUYBACK & BURN</span>
                <span className="text-lg">50%</span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                {formatUSD(metrics.dailyBurnUSD)}
              </div>
              <span className="text-[11px] text-gray-400 block font-mono mt-0.5">par jour en USDC</span>
              <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs text-rose-300 font-mono">
                ~{formatUSD(metrics.dailyBurnUSD * 30)} / mois
              </div>
            </div>

            {/* 25% Holders Payback */}
            <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 relative overflow-hidden">
              <div className="text-xs font-mono text-emerald-400 font-bold mb-1 flex items-center justify-between">
                <span>🎁 HOLDERS PAYBACK</span>
                <span className="text-lg">25%</span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                {formatUSD(metrics.dailyHoldersUSD)}
              </div>
              <span className="text-[11px] text-gray-400 block font-mono mt-0.5">redistribué aux holders</span>
              <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-emerald-300 font-mono">
                ~{formatUSD(metrics.dailyHoldersUSD * 30)} / mois
              </div>
            </div>

            {/* 15% SuperLotto */}
            <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/40 relative overflow-hidden">
              <div className="text-xs font-mono text-amber-400 font-bold mb-1 flex items-center justify-between">
                <span>🎰 SUPERLOTTO / PRIZE</span>
                <span className="text-lg">15%</span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                {formatUSD(metrics.dailyRewardsUSD)}
              </div>
              <span className="text-[11px] text-gray-400 block font-mono mt-0.5">jackpot tirage régulier</span>
              <div className="mt-3 pt-3 border-t border-amber-500/20 text-xs text-amber-300 font-mono">
                ~{formatUSD(metrics.dailyRewardsUSD * 30)} / mois
              </div>
            </div>

            {/* 10% Team */}
            <div className="p-5 rounded-xl bg-sky-950/20 border border-sky-500/40 relative overflow-hidden">
              <div className="text-xs font-mono text-sky-400 font-bold mb-1 flex items-center justify-between">
                <span>🛠️ TEAM & INFRA ARC</span>
                <span className="text-lg">10%</span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                {formatUSD(metrics.dailyTeamUSD)}
              </div>
              <span className="text-[11px] text-gray-400 block font-mono mt-0.5">frais serveurs & bots</span>
              <div className="mt-3 pt-3 border-t border-sky-500/20 text-xs text-sky-300 font-mono">
                ~{formatUSD(metrics.dailyTeamUSD * 30)} / mois
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6️⃣ SECTION 6: Burn Rate Réel & Calcul Futuriste */}
      {(activeTab === 'all' || activeTab === 'burn-rate') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">6. Burn Rate Réel & Calcul Futuriste</h2>
                <p className="text-xs text-gray-400">Vitesse de destruction de l'offre calculée à partir de la cadence réelle</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
              Rythme Perpétuel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">🔥 Par Jour (24h)</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {formatTokens(metrics.burnRate.daily.tokens)}
              </span>
              <span className="text-xs text-gray-300 block font-mono mt-1">
                {formatUSD(metrics.burnRate.daily.usd)}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">🔥 Par Semaine (7j)</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {formatTokens(metrics.burnRate.weekly.tokens)}
              </span>
              <span className="text-xs text-gray-300 block font-mono mt-1">
                {formatUSD(metrics.burnRate.weekly.usd)}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">🔥 Par Mois (30j)</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {formatTokens(metrics.burnRate.monthly.tokens)}
              </span>
              <span className="text-xs text-gray-300 block font-mono mt-1">
                {formatUSD(metrics.burnRate.monthly.usd)}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-arc-dark/80 border border-arc-border">
              <span className="text-xs text-gray-400 block font-mono mb-1">🔥 Par Année (365j)</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {formatTokens(metrics.burnRate.yearly.tokens)}
              </span>
              <span className="text-xs text-gray-300 block font-mono mt-1">
                {formatUSD(metrics.burnRate.yearly.usd)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7️⃣ SECTION 7: Supply Reduction Projection Table */}
      {(activeTab === 'all' || activeTab === 'projections') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">7. Table des Projections de Réduction de l'Offre</h2>
                <p className="text-xs text-gray-400">جدول محاكاة تقلص العرض ومضاعف الندرة المستقبلي</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
              Modèle Ember Déflationniste
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-dark/60">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-arc-border bg-arc-dark text-gray-400">
                  <th className="py-3.5 px-4">Période / الفترة</th>
                  <th className="py-3.5 px-4">Supply Restante</th>
                  <th className="py-3.5 px-4">% Total Burné</th>
                  <th className="py-3.5 px-4">Valeur Marché Projetée</th>
                  <th className="py-3.5 px-4 text-right">Facteur de Rareté</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-arc-border/60 text-gray-200">
                {metrics.supplyProjections.map((proj, idx) => {
                  const scarcity = (metrics.initialSupply / proj.remainingSupply).toFixed(2);
                  return (
                    <tr key={idx} className="hover:bg-arc-card/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{proj.period}</td>
                      <td className="py-3.5 px-4 text-arc-cyan font-bold">{formatTokens(proj.remainingSupply)}</td>
                      <td className="py-3.5 px-4 text-rose-400 font-bold">{proj.pctBurned}</td>
                      <td className="py-3.5 px-4 text-gray-300">{formatUSD(proj.remainingSupply * metrics.currentPrice)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded bg-arc-card border border-arc-border text-emerald-400 font-bold">
                          {scarcity}x
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8️⃣ SECTION 8: Payback للـ Holders & Interactive Yield Calculator */}
      {(activeTab === 'all' || activeTab === 'payback') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">8. Payback للـ Holders & Calculateur de Rendement</h2>
                <p className="text-xs text-gray-400">Calculez vos dividendes en USDC réels générés par les 25% de la redistribution</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Paiements en USDC Direct
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="p-5 rounded-xl bg-arc-dark/80 border border-arc-border space-y-4">
              <label className="text-xs text-gray-300 font-mono block">
                Entrez la quantité de <strong>{token.symbol}</strong> que vous possédez :
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={userHoldings}
                  onChange={(e) => setUserHoldings(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-arc-card border border-arc-border rounded-xl px-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:border-arc-cyan transition-colors pr-20"
                />
                <span className="absolute right-3 top-3.5 text-xs font-mono text-arc-cyan font-bold">
                  {token.symbol}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {[100000, 500000, 1000000, 5000000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setUserHoldings(preset)}
                    className="text-[11px] font-mono px-2 py-1 rounded-lg bg-arc-card border border-arc-border text-gray-400 hover:text-white hover:border-arc-cyan transition-colors cursor-pointer"
                  >
                    {formatTokens(preset)}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-arc-border text-xs text-gray-400 font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span>Valeur Actuelle :</span>
                  <span className="text-white font-bold">{formatUSD(userHoldingsValueUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Part du Réseau :</span>
                  <span className="text-arc-cyan font-bold">{(userShareOfSupply * 100).toFixed(4)}%</span>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-mono">💵 Dividendes / Jour</span>
                <div>
                  <span className="text-2xl font-black font-mono text-emerald-400 block mt-2">
                    {formatUSD(userDailyPaybackUSD)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">En USDC direct</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-mono">💵 Dividendes / Mois (30j)</span>
                <div>
                  <span className="text-2xl font-black font-mono text-emerald-400 block mt-2">
                    {formatUSD(userMonthlyPaybackUSD)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">Rendement passif</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-mono">💵 Dividendes / An (365j)</span>
                <div>
                  <span className="text-2xl font-black font-mono text-emerald-400 block mt-2">
                    {formatUSD(userYearlyPaybackUSD)}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">
                    APY Estimé: ~{userAPY}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9️⃣ SECTION 9: Ecosystem DEX Pairs & Bonding Curve Progress */}
      {(activeTab === 'all' || activeTab === 'pairs') && (
        <div className="rounded-2xl bg-arc-card border border-arc-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-arc-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arc-cyan/10 border border-arc-cyan/30 flex items-center justify-center text-arc-cyan">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">9. Écosystème DEX & Bonding Curve Status</h2>
                <p className="text-xs text-gray-400">Intégration du token au sein de la liquidité globale Arc Network</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Curve: {token.curveProgress}% Graduated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-arc-dark/80 border border-arc-border space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-300 font-bold">Progression Bonding Curve</span>
                <span className="text-emerald-400 font-bold">{token.curveProgress}% Complété</span>
              </div>
              <div className="w-full h-2.5 bg-arc-card rounded-full overflow-hidden border border-arc-border">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${token.curveProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 font-mono pt-1">
                Le token a complété sa phase initiale de lancement sur {token.platform} et bénéficie désormais d'un pool AMM perpétuel.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-arc-dark/80 border border-arc-border space-y-3">
              <span className="text-xs font-mono text-gray-300 font-bold block">Explorer Arcscan</span>
              <p className="text-xs text-gray-400 font-mono">
                Consulter les blocs récents, les transferts ERC-20 et le code source vérifié du contrat sur Arc L1 Blockchain.
              </p>
              <a
                href={`https://arc.etherscan.io/token/${token.contract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-arc-cyan/10 border border-arc-cyan/30 text-arc-cyan text-xs font-mono font-bold hover:bg-arc-cyan/20 transition-all"
              >
                <span>Ouvrir sur Arcscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
