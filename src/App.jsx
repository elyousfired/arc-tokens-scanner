import React, { useState, useEffect } from "react";
import { INITIAL_TOKENS } from "./data/tokens";
import { Header } from "./components/Header";
import { TickerBar } from "./components/TickerBar";
import { Footer } from "./components/Footer";
import { AddTokenModal } from "./components/AddTokenModal";

import { OverviewPage } from "./pages/OverviewPage";
import { FlywheelPage } from "./pages/FlywheelPage";
import { PairsPage } from "./pages/PairsPage";
import { TokensPage } from "./pages/TokensPage";
import { LaunchesPage } from "./pages/LaunchesPage";
import { HoldersPage } from "./pages/HoldersPage";
import { RewardsPage } from "./pages/RewardsPage";
import { PlatformPage } from "./pages/PlatformPage";
import { AboutPage } from "./pages/AboutPage";
import { AllTokensHub } from "./pages/AllTokensHub";

export default function App() {
  const [tokens, setTokens] = useState(() => {
    try {
      const saved = localStorage.getItem("arc_scanner_tokens_v3");
      return saved ? JSON.parse(saved) : INITIAL_TOKENS;
    } catch {
      return INITIAL_TOKENS;
    }
  });

  const [activeToken, setActiveToken] = useState(() => tokens[0] || INITIAL_TOKENS[0]);
  const [currentPage, setCurrentPage] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Save tokens to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("arc_scanner_tokens_v3", JSON.stringify(tokens));
    } catch {}
  }, [tokens]);

  // Seconds counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSecondsAgo(0);
    }, 800);
  };

  const handleAddToken = (newToken) => {
    const updated = [newToken, ...tokens];
    setTokens(updated);
    setActiveToken(newToken);
    setCurrentPage("overview");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewPage token={activeToken} onNavigate={setCurrentPage} />;
      case "flywheel":
        return <FlywheelPage token={activeToken} />;
      case "pairs":
        return <PairsPage token={activeToken} />;
      case "tokens":
        return <TokensPage token={activeToken} />;
      case "launches":
        return <LaunchesPage token={activeToken} />;
      case "holders":
        return <HoldersPage token={activeToken} />;
      case "rewards":
        return <RewardsPage token={activeToken} />;
      case "platform":
        return <PlatformPage token={activeToken} />;
      case "about":
        return <AboutPage token={activeToken} />;
      case "hub":
        return (
          <AllTokensHub
            tokens={tokens}
            onSelectToken={(t) => {
              setActiveToken(t);
              setCurrentPage("overview");
            }}
          />
        );
      default:
        return <OverviewPage token={activeToken} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <Header
        activeToken={activeToken}
        allTokens={tokens}
        onSelectToken={setActiveToken}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        loading={loading}
        secondsAgo={secondsAgo}
        onRefresh={handleRefresh}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <TickerBar
        token={activeToken}
        price={activeToken?.basePrice}
        priceChange={activeToken?.priceChanges?.h24 ? parseFloat(activeToken.priceChanges.h24) : 38.5}
        mcap={activeToken?.marketCap}
        vol24h={activeToken?.volume24h}
        burnedPct={(activeToken?.totalBurned / activeToken?.initialSupply) * 100}
        liquidity={activeToken?.liquidity}
        burnWalletPending={activeToken?.pendingBurn}
        dailyFees={(activeToken?.volume24h * (activeToken?.feeRatePct || 1.0)) / 100}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {renderCurrentPage()}
      </main>

      <Footer token={activeToken} />

      <AddTokenModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddToken={handleAddToken}
      />
    </div>
  );
}
