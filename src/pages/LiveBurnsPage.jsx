import React, { useState, useEffect } from "react";
import { 
  Flame, RefreshCw, ExternalLink, Copy, Check, Search, ShieldCheck, 
  Trophy, TrendingUp, Filter, BarChart3, ArrowUpRight, Zap,
  AlertTriangle, Droplets, Info
} from "lucide-react";
import { scanDeadWalletBurns } from "../services/burnScannerService";
import { fmtCompact, fmtNum } from "../lib/format";
import { TransactionModal } from "../components/TransactionModal";

// Top 10 Leaderboard verified directly from 0x000000000000000000000000000000000000dEaD on Arc L1
const TOP_BURN_LEADERBOARD = [
  {
    rank: 1,
    symbol: "ARGUS",
    name: "ArgusPad AMM Hooks Token",
    contract: "0xece5ca8bf9220718e5727754026757512212cb3c",
    burnedTokens: 47297701,
    burnUsd: 901967,
    priceUsd: 0.01907,
    totalSupply: 1000000000,
    burnedPct: 4.73,
    liquidity: 1853159,
    volume24h: 38023135,
    tag: "AMM Hooks Buyback Leader",
    pairUrl: "https://dexscreener.com/arc/0x6a3bacaa6493734c1ac221ebf42cf530a96c1e02"
  },
  {
    rank: 2,
    symbol: "AI",
    name: "Artificial Intelligence Arc",
    contract: "0x305a59006a2b091a2b234bba7013ed6672b15218",
    burnedTokens: 957763388,
    burnUsd: 841970,
    priceUsd: 0.0008791,
    totalSupply: 1000000000,
    burnedPct: 95.78,
    liquidity: 0,
    volume24h: 154200,
    tag: "Bonding Curve Inactive",
    pairUrl: "https://arc.etherscan.io/token/0x305a59006a2b091a2b234bba7013ed6672b15218"
  },
  {
    rank: 3,
    symbol: "PI",
    name: "Pi Network Arc L1",
    contract: "0x5b4da7b7fe57a0d12ef1ed4d4a232d06e6e7c84a",
    burnedTokens: 957763388,
    burnUsd: 767073,
    priceUsd: 0.0008009,
    totalSupply: 1000000000,
    burnedPct: 95.78,
    liquidity: 21605,
    volume24h: 34120,
    tag: "Bonding Curve Graduated",
    pairUrl: "https://dexscreener.com/arc/0x5b4da7b7fe57a0d12ef1ed4d4a232d06e6e7c84a"
  },
  {
    rank: 4,
    symbol: "TOLLY",
    name: "Tolly Protocol",
    contract: "0xbc43ce8dec648ea298c4275559b81d6261c90b67",
    burnedTokens: 48684725,
    burnUsd: 268691,
    priceUsd: 0.005519,
    totalSupply: 1000000000,
    burnedPct: 4.87,
    liquidity: 551224,
    volume24h: 16302729,
    tag: "Locked AMM Liquidity",
    pairUrl: "https://dexscreener.com/arc/0x162df51c504e7b8321e07387932f333d9be16a72"
  },
  {
    rank: 5,
    symbol: "万事币",
    name: "Wanshi Protocol",
    contract: "0x821214d8bff808fa776becbe4b7790eed026e777",
    burnedTokens: 747064780,
    burnUsd: 128794,
    priceUsd: 0.0001724,
    totalSupply: 1000000000,
    burnedPct: 74.71,
    liquidity: 33879,
    volume24h: 52900,
    tag: "Launchpad Bonding 75% Burn",
    pairUrl: "https://arc.etherscan.io/token/0x821214d8bff808fa776becbe4b7790eed026e777"
  },
  {
    rank: 6,
    symbol: "SPECSY",
    name: "Specsy Token Arc",
    contract: "0x18b1ebc5ad9bf31d88ffc9f70132312f9803b777",
    burnedTokens: 747064780,
    burnUsd: 117214,
    priceUsd: 0.0001569,
    totalSupply: 1000000000,
    burnedPct: 74.71,
    liquidity: 0,
    volume24h: 18200,
    tag: "Bonding Curve Burn",
    pairUrl: "https://arc.etherscan.io/token/0x18b1ebc5ad9bf31d88ffc9f70132312f9803b777"
  },
  {
    rank: 7,
    symbol: "跳蛛",
    name: "Jumping Spider Token",
    contract: "0x92d4ace216669ff9d8cd5ce560df061f69338777",
    burnedTokens: 747064780,
    burnUsd: 116542,
    priceUsd: 0.000156,
    totalSupply: 1000000000,
    burnedPct: 74.71,
    liquidity: 32231,
    volume24h: 42100,
    tag: "Community Meme Burn",
    pairUrl: "https://arc.etherscan.io/token/0x92d4ace216669ff9d8cd5ce560df061f69338777"
  },
  {
    rank: 8,
    symbol: "ZEREBLAST",
    name: "Zereblast Arc",
    contract: "0x19874a4289b17e16bf44a51dcdd0101cd82b7777",
    burnedTokens: 747064780,
    burnUsd: 52033,
    priceUsd: 0.00006965,
    totalSupply: 1000000000,
    burnedPct: 74.71,
    liquidity: 0,
    volume24h: 12400,
    tag: "Launchpad Sweep",
    pairUrl: "https://arc.etherscan.io/token/0x19874a4289b17e16bf44a51dcdd0101cd82b7777"
  },
  {
    rank: 9,
    symbol: "ENSO",
    name: "Enso Protocol Arc",
    contract: "0x76b04be6af45a0183b9c38ecd7620be6d9194bc2",
    burnedTokens: 28346046,
    burnUsd: 7143,
    priceUsd: 0.000252,
    totalSupply: 1000000000,
    burnedPct: 2.83,
    liquidity: 50077,
    volume24h: 81200,
    tag: "DeFi Fee Sweep",
    pairUrl: "https://dexscreener.com/arc/0x76b04be6af45a0183b9c38ecd7620be6d9194bc2"
  },
  {
    rank: 10,
    symbol: "WARP",
    name: "Warp Launchpad",
    contract: "0x384c60f98ecd4c26345499345c03d677e40f115e",
    burnedTokens: 26802244,
    burnUsd: 6199,
    priceUsd: 0.0002313,
    totalSupply: 1000000000,
    burnedPct: 2.68,
    liquidity: 68012,
    volume24h: 2479309,
    tag: "Bonding Curve Graduation",
    pairUrl: "https://dexscreener.com/arc/0x507a494fde26960cb36d50912cab83c71ecc7ea7"
  },
  {
    rank: 11,
    symbol: "ELLIPSE",
    name: "Ellipse Protocol",
    contract: "0x86f7424c3e1ebb3f42e1e687468e36d5f2a1222e",
    burnedTokens: 17249297,
    burnUsd: 3402,
    priceUsd: 0.0001972,
    totalSupply: 1000000000,
    burnedPct: 1.72,
    liquidity: 171774,
    volume24h: 1412758,
    tag: "AMM Deep Liquidity",
    pairUrl: "https://dexscreener.com/arc/0x0abd501f56cd434d346cd5bf3b67aef461ebbc2d"
  }
];

export function LiveBurnsPage({ token, allTokens = [], onSelectToken }) {
  const [activeTab, setActiveTab] = useState("top10"); // "top10" | "stream"
  const [leaderboardSort, setLeaderboardSort] = useState("usd"); // "usd" | "pct" | "tokens"
  const [liquidityFilter, setLiquidityFilter] = useState("all"); // "all" | "liquid"
  const [showExplainer, setShowExplainer] = useState(true);
  const [burns, setBurns] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // 12s live polling for stream
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

  // Sort & Filter Leaderboard
  const filteredLeaderboard = [...TOP_BURN_LEADERBOARD]
    .filter((t) => {
      const matchesSearch =
        t.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contract?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLiquidity = liquidityFilter === "liquid" ? t.liquidity >= 5000 : true;
      return matchesSearch && matchesLiquidity;
    });

  const sortedLeaderboard = filteredLeaderboard.sort((a, b) => {
    if (leaderboardSort === "pct") return b.burnedPct - a.burnedPct;
    if (leaderboardSort === "tokens") return b.burnedTokens - a.burnedTokens;
    return b.burnUsd - a.burnUsd;
  });

  // Filter Stream
  const filteredStream = burns.filter(
    (b) =>
      b.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tx?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLeaderboardBurnUsd = filteredLeaderboard.reduce((acc, t) => acc + t.burnUsd, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header Section */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-lg shadow-orange-500/10">
                <Flame className="w-7 h-7 animate-pulse text-orange-400" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Arc L1 Dead Wallet Scanner & Leaderboard
                </h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono">
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

          {/* Right Controls & Live Block Ticker */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
              <span className={`w-2.5 h-2.5 rounded-full ${isLivePaused ? "bg-amber-400" : "bg-emerald-400 animate-ping"}`} />
              <span className="text-slate-300 font-bold">
                {isLivePaused ? "STREAM PAUSED" : "ARC RPC NODE LIVE"}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-bold">
                Block #{currentBlock ? currentBlock.toLocaleString() : "..."}
              </span>
              <span className="text-slate-600">|</span>
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
              {isLivePaused ? "Resume Stream" : "Pause Stream"}
            </button>

            <button
              onClick={() => fetchBurns(true)}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title="Rescan now"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Top 10 Value Incinerated</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            ${fmtCompact(totalLeaderboardBurnUsd)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Permanently burned into 0x00...dEaD
          </div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">#1 Burn Value Leader</div>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
            ARGUS ($901K)
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            47.3M ARGUS tokens incinerated
          </div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Highest Supply Burn %</div>
          <div className="text-2xl font-black font-mono text-orange-400 mt-1">
            95.78% (AI & PI)
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ~957.7M tokens sent to dead address
          </div>
        </div>

        <div className="card p-4 border-slate-800 bg-[#111622]">
          <div className="text-xs font-mono text-slate-400 uppercase">Live Stream Feed Activity</div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {burns.length} events
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Detected across recent blocks
          </div>
        </div>
      </div>

      {/* Main Mode Tabs Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("top10")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "top10"
                ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/40 shadow-lg shadow-orange-500/10"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>🏆 TOP 10 BURN LEADERBOARD</span>
          </button>

          <button
            onClick={() => setActiveTab("stream")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "stream"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>🔥 LIVE REAL-TIME STREAM ({burns.length})</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter token or contract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111622] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* TAB 1: TOP 10 LEADERBOARD */}
      {activeTab === "top10" && (
        <div className="space-y-4">
          {/* Liquidity filter & Sub-sort bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs font-mono">
            {/* Filter by Liquidity */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Pool Filter:
              </span>
              <button
                onClick={() => setLiquidityFilter("all")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  liquidityFilter === "all"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                🌐 All Tokens (Include $0 Curves)
              </button>
              <button
                onClick={() => setLiquidityFilter("liquid")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  liquidityFilter === "liquid"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>💧 Verified Liquid Pools Only (&gt; $5K Liq)</span>
              </button>
            </div>

            {/* Rank by Sort */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Rank by:
              </span>
              {[
                { key: "usd", label: "💰 USD Value" },
                { key: "tokens", label: "🔥 Token Count" },
                { key: "pct", label: "📊 % Supply Cut" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setLeaderboardSort(s.key)}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    leaderboardSort === s.key
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Educational Explainer Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Wach 95% - 97% Burn Logique ? (Real Buybacks vs Bonding Curve Sweeps)</span>
              </div>
              <button
                onClick={() => setShowExplainer(!showExplainer)}
                className="text-[11px] underline text-amber-400 hover:text-amber-200 cursor-pointer"
              >
                {showExplainer ? "Masquer ▲" : "Afficher l'explication ▼"}
              </button>
            </div>

            {showExplainer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] text-slate-300">
                <div className="p-3 rounded-lg bg-[#0b1320] border border-emerald-500/30">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1 text-xs">
                    <span>✅ Real AMM Fee Buybacks (ex: ARGUS, TOLLY)</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    Smart contracts li kaysta3mlo l-fees dyal trading b USDC bach ychriw les tokens mn l-market f DEX w kay7ar9ohom f 0x00...dEaD. Kayna Liquidity s7i7a ($1.85M f ARGUS), donc l-valeur dyal l-burn <strong>100% 7a9i9iya w liquide</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#140e1a] border border-amber-500/30">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1 text-xs">
                    <span>⚠️ Bonding Curve Sweeps / Unsold (ex: AI, SPECSY)</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    Tokens mintés f Launchpad b 1 Milliard supply. Mli katba3 ghir ~4% f l-curve, dakchi li b9a (95.78%) kaysiftoha direct l 0x00...dEaD. <strong>Ila kant l-liquidity $0</strong>, darba f akhar spot price kat3ti <strong>Paper Value</strong> (valeur théorique f l-wraq li ma t9darch tbi3ha).
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="card border-slate-800 bg-[#111622] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-3.5 px-4 font-semibold">Rank</th>
                    <th className="py-3.5 px-4 font-semibold">Token</th>
                    <th className="py-3.5 px-4 font-semibold text-right">USD Value Burned</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Tokens Incinerated</th>
                    <th className="py-3.5 px-4 font-semibold text-right">% Supply Cut</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Spot Price</th>
                    <th className="py-3.5 px-4 font-semibold text-right">DEX Liquidity</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Arcscan Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sortedLeaderboard.map((t, idx) => {
                    const medal =
                      idx === 0
                        ? "🥇"
                        : idx === 1
                        ? "🥈"
                        : idx === 2
                        ? "🥉"
                        : `#${idx + 1}`;

                    return (
                      <tr
                        key={t.contract}
                        className="hover:bg-slate-800/40 transition group"
                      >
                        <td className="py-3.5 px-4 font-bold text-base text-slate-300">
                          {medal}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              ${t.symbol}
                            </span>
                            <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                              {t.tag}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {t.name}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className={`font-black text-sm ${t.liquidity === 0 ? "text-slate-400 line-through decoration-rose-500/60" : "text-emerald-400"}`}>
                            ${t.burnUsd.toLocaleString()}
                          </div>
                          {t.liquidity === 0 ? (
                            <div className="text-[10px] text-rose-400 flex items-center justify-end gap-1 font-sans">
                              <span>⚠️ Paper Value</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-400/80 font-sans">
                              Real Buyback
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                          <div>
                            {fmtCompact(t.burnedTokens, "")} {t.symbol}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {t.burnedTokens.toLocaleString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-orange-400">
                              {t.burnedPct}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 hidden sm:block">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                                style={{ width: `${Math.min(100, t.burnedPct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right text-slate-300">
                          ${fmtNum(t.priceUsd, 6)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {t.liquidity === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                              $0 (Paper Val)
                            </span>
                          ) : (
                            <div>
                              <div className="font-bold text-slate-200">
                                ${fmtCompact(t.liquidity)}
                              </div>
                              <div className="text-[10px] text-emerald-400">
                                {t.liquidity >= 100000 ? "Deep Pool" : "Active Pool"}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`https://arc.etherscan.io/token/${t.contract}?a=0x000000000000000000000000000000000000dEaD`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded transition"
                          >
                            <span>Verify ↗</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE STREAM TABLE */}
      {activeTab === "stream" && (
        <div className="card border-slate-800 bg-[#111622] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
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
                ) : filteredStream.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      No burn transactions found in recent blocks matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredStream.map((b, idx) => (
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
      )}

      {/* Transaction Details Modal */}
      <TransactionModal
        txData={selectedTx}
        token={token}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
