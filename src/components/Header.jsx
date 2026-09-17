import React, { useState } from "react";
import { Zap, Flame, RefreshCw, ArrowUpRight, ChevronDown, Menu, X, PlusCircle, Check, Clock, Sparkles } from "lucide-react";

export function Header({
  activeToken,
  allTokens,
  onSelectToken,
  currentPage,
  onNavigate,
  loading,
  secondsAgo,
  onRefresh,
  onOpenAddModal,
  onOpenSwapModal,
}) {
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPlatformActive = currentPage === "platform" || currentPage === "flywheel";
  const isEcosystemActive =
    currentPage === "tokens" ||
    currentPage === "pairs" ||
    currentPage === "launches" ||
    currentPage === "rewards" ||
    currentPage === "holders";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b0e14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate("overview")}
            className="flex items-center gap-2.5 font-bold tracking-tight text-white text-[17px] cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </span>
            <span>arc.fyi</span>
            <span className="border border-slate-700 bg-slate-800/60 rounded px-1.5 py-0.5 text-[10px] text-cyan-400 font-medium">
              USDC L1
            </span>
          </button>

          {/* Token Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTokenDropdownOpen(!tokenDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-mono font-bold text-white transition cursor-pointer"
            >
              <span>{activeToken?.icon}</span>
              <span className="text-cyan-400">${activeToken?.symbol}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {tokenDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-60 bg-[#111622] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs"
                onMouseLeave={() => setTokenDropdownOpen(false)}
              >
                <div className="text-[10px] text-slate-500 uppercase font-mono px-2 py-1">
                  Arc Launchpad Tokens
                </div>
                {allTokens.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectToken(t);
                      setTokenDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition ${
                      activeToken?.id === t.id
                        ? "bg-cyan-500/15 border border-cyan-500/30 text-white font-bold"
                        : "hover:bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{t.icon}</span>
                      <div>
                        <div className="font-mono font-bold text-white">${t.symbol}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{t.name}</div>
                      </div>
                    </div>
                    {activeToken?.id === t.id ? (
                      <Check className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">${t.basePrice}</span>
                    )}
                  </button>
                ))}

                <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      onNavigate("hub");
                      setTokenDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 text-left transition font-mono"
                  >
                    <span>📊</span>
                    <span>All Tokens Matrix</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAddModal();
                      setTokenDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 text-left transition font-mono font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Arc Token</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-2 text-[13px] text-slate-400">
            <button
              onClick={() => onNavigate("overview")}
              className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                currentPage === "overview" ? "bg-slate-800 text-white font-semibold" : "hover:text-white"
              }`}
            >
              ${activeToken?.symbol || "ARGUS"}
            </button>

            <button
              onClick={() => onNavigate("burns")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                currentPage === "burns"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Arc L1 Dead Wallet Real-Time Burn Scanner"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Live Burns</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            </button>

            <button
              onClick={() => onNavigate("fresh-burns")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                currentPage === "fresh-burns"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold shadow-lg shadow-cyan-500/10"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Tokens burning in last 15M, 30M, 1H, 4H, and 24H"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fresh Burns (1H-24H)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </button>

            <button
              onClick={() => onNavigate("ai-audit")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                currentPage === "ai-audit"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-lg shadow-purple-500/10"
                  : "text-slate-300 hover:text-white"
              }`}
              title="AI On-Chain Token Intelligence & Success Probability Radar"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Audit Radar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            </button>

            {/* Platform Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setPlatformOpen(true)}
              onMouseLeave={() => setPlatformOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  isPlatformActive ? "bg-slate-800 text-white font-semibold" : "hover:text-white"
                }`}
              >
                <span>Platform</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {platformOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-[#111622] border border-slate-800 rounded-lg shadow-xl p-1.5 z-50 flex flex-col gap-1 text-xs">
                  <button
                    onClick={() => {
                      onNavigate("platform");
                      setPlatformOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-slate-800 transition text-left cursor-pointer ${
                      currentPage === "platform" ? "text-cyan-400 font-bold bg-slate-800/60" : "text-slate-300"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("flywheel");
                      setPlatformOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-slate-800 transition text-left cursor-pointer ${
                      currentPage === "flywheel" ? "text-cyan-400 font-bold bg-slate-800/60" : "text-slate-300"
                    }`}
                  >
                    Flywheel & Burns
                  </button>
                </div>
              )}
            </div>

            {/* Ecosystem Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setEcosystemOpen(true)}
              onMouseLeave={() => setEcosystemOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  isEcosystemActive ? "bg-slate-800 text-white font-semibold" : "hover:text-white"
                }`}
              >
                <span>Ecosystem</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {ecosystemOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#111622] border border-slate-800 rounded-lg shadow-xl p-1.5 z-50 flex flex-col gap-1 text-xs">
                  <button
                    onClick={() => {
                      onNavigate("tokens");
                      setEcosystemOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-slate-800 transition text-left cursor-pointer ${
                      currentPage === "tokens" ? "text-cyan-400 font-bold bg-slate-800/60" : "text-slate-300"
                    }`}
                  >
                    Tokens & Yield
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("pairs");
                      setEcosystemOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-slate-800 transition text-left cursor-pointer ${
                      currentPage === "pairs" ? "text-cyan-400 font-bold bg-slate-800/60" : "text-slate-300"
                    }`}
                  >
                    Pairs & Volume
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("launches");
                      setEcosystemOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-slate-800 transition text-left cursor-pointer ${
                      currentPage === "launches" ? "text-cyan-400 font-bold bg-slate-800/60" : "text-slate-300"
                    }`}
                  >
                    Launches & Curves
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("rewards");
                      setEcosystemOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-slate-800 transition text-left cursor-pointer ${
                      currentPage === "rewards" ? "text-cyan-400 font-bold bg-slate-800/60" : "text-slate-300"
                    }`}
                  >
                    Rewards & Payback
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("holders");
                      setEcosystemOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-slate-800 transition text-left cursor-pointer ${
                      currentPage === "holders" ? "text-cyan-400 font-bold bg-slate-800/60" : "text-slate-300"
                    }`}
                  >
                    Holders Census
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate("about")}
              className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                currentPage === "about" ? "bg-slate-800 text-white font-semibold" : "hover:text-white"
              }`}
            >
              About
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md border border-slate-800 bg-slate-900/60 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            title="Click to refresh live Arc L1 metrics"
          >
            <span className="live-dot" />
            <span>{loading ? "syncing..." : secondsAgo < 60 ? `updated ${secondsAgo}s ago` : `updated ${Math.floor(secondsAgo / 60)}m ago`}</span>
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          <button
            onClick={onOpenSwapModal}
            className="btn-buy hidden sm:inline-flex items-center justify-center font-semibold text-xs h-8 px-3 rounded-md gap-1.5 cursor-pointer"
            title={`Trade $${activeToken?.symbol || "ARGUS"} on Arc L1`}
          >
            <span>Trade on Arc</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0d121c] px-4 py-3 space-y-2 text-sm">
          <button
            onClick={() => {
              onNavigate("overview");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1.5 text-cyan-400 font-bold"
          >
            ${activeToken?.symbol} (Overview)
          </button>
          <button
            onClick={() => {
              onNavigate("burns");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-1.5 text-orange-400 font-bold"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Live Burn Scanner (0x...dEaD)</span>
          </button>
          <button
            onClick={() => {
              onNavigate("fresh-burns");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-1.5 text-cyan-400 font-bold"
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Fresh Burns Radar (1H - 24H)</span>
          </button>
          <button
            onClick={() => {
              onNavigate("ai-audit");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-1.5 text-purple-400 font-bold"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Audit Radar (Success & Flywheel)</span>
          </button>
          <div className="pt-2 border-t border-slate-800/60 text-xs font-bold text-slate-500 uppercase">Platform</div>
          <button
            onClick={() => {
              onNavigate("platform");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            Platform Overview
          </button>
          <button
            onClick={() => {
              onNavigate("flywheel");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            Flywheel & Burns
          </button>
          <div className="pt-2 border-t border-slate-800/60 text-xs font-bold text-slate-500 uppercase">Ecosystem</div>
          <button
            onClick={() => {
              onNavigate("tokens");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            Tokens & Yield
          </button>
          <button
            onClick={() => {
              onNavigate("pairs");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            Pairs & Volume
          </button>
          <button
            onClick={() => {
              onNavigate("launches");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            Launches & Curves
          </button>
          <button
            onClick={() => {
              onNavigate("rewards");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            Rewards & Payback
          </button>
          <button
            onClick={() => {
              onNavigate("holders");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            Holders Census
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenSwapModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Trade ${activeToken?.symbol || "ARGUS"} on Arc</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="pt-2 border-t border-slate-800/60 text-xs font-bold text-slate-500 uppercase">Info</div>
          <button
            onClick={() => {
              onNavigate("about");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 pl-2 text-slate-300 hover:text-white"
          >
            About & Methodology
          </button>
        </div>
      )}
    </header>
  );
}
