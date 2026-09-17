import React, { useState, useEffect } from "react";
import { INITIAL_TOKENS } from "./data/tokens";
import { Header } from "./components/Header";
import { TickerBar } from "./components/TickerBar";
import { Footer } from "./components/Footer";
import { AddTokenModal } from "./components/AddTokenModal";
import { SwapModal } from "./components/SwapModal";
import { fetchLiveTokenData, fetchOnchainBurnData } from "./services/dexService";

import { OverviewPage } from "./pages/OverviewPage";
import { LiveBurnsPage } from "./pages/LiveBurnsPage";
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
      const saved = localStorage.getItem("arc_scanner_tokens_v6");
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
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Save tokens to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("arc_scanner_tokens_v6", JSON.stringify(tokens));
    } catch {}
  }, [tokens]);

  // Sync real-time DexScreener prices & Arc L1 On-Chain Dead Burn Wallet
  const syncLivePrices = async () => {
    try {
      setLoading(true);
      const updatedTokens = await Promise.all(
        tokens.map(async (t) => {
          if (!t.contract) return t;

          // 1. Fetch live DEX metrics from DexScreener
          const live = await fetchLiveTokenData(t.contract);

          // 2. Fetch real-time on-chain dead burn wallet balance from Arc L1 RPC node!
          const onchain = await fetchOnchainBurnData(t.contract, t.burnWallet);

          const newPrice = live?.priceUsd || t.basePrice;
          const newVol = live?.volume24h != null ? live.volume24h : t.volume24h;
          const newLiq = live?.liquidity != null ? live.liquidity : t.liquidity;

          const burned = onchain?.totalBurned != null ? onchain.totalBurned : t.totalBurned;
          const initialSupply = onchain?.initialSupply || t.initialSupply || 1000000000;
          const currentSupply = onchain?.currentSupply != null ? onchain.currentSupply : Math.max(0, initialSupply - burned);
          const newMc = live?.marketCap || Math.round(currentSupply * newPrice);

          return {
            ...t,
            basePrice: newPrice,
            volume24h: newVol,
            liquidity: newLiq,
            marketCap: newMc,
            totalBurned: burned,
            currentSupply,
            initialSupply,
            topPairUrl: live?.topPairUrl || t.topPairUrl,
            priceChanges: live?.priceChanges || t.priceChanges,
            directPairs: live?.directPairs && live.directPairs.length > 0 ? live.directPairs : t.directPairs,
          };
        })
      );

      setTokens(updatedTokens);
      setSecondsAgo(0);
    } catch (e) {
      console.error("Live price & onchain burn sync failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Sync activeToken with updated tokens list
  useEffect(() => {
    const current = tokens.find((t) => t.id === activeToken?.id);
    if (current && (current.basePrice !== activeToken.basePrice || current.volume24h !== activeToken.volume24h)) {
      setActiveToken(current);
    }
  }, [tokens, activeToken?.id]);

  // Initial fetch and 30s polling
  useEffect(() => {
    syncLivePrices();
    const pollTimer = setInterval(() => {
      syncLivePrices();
    }, 30000);
    return () => clearInterval(pollTimer);
  }, []);

  // Seconds counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    syncLivePrices();
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
      case "burns":
        return (
          <LiveBurnsPage
            token={activeToken}
            allTokens={tokens}
            onSelectToken={(t) => {
              setActiveToken(t);
              setCurrentPage("overview");
            }}
          />
        );
      case "flywheel":
        return <FlywheelPage token={activeToken} />;
      case "pairs":
        return <PairsPage token={activeToken} />;
      case "tokens":
        return (
          <TokensPage
            token={activeToken}
            allTokens={tokens}
            onSelectToken={(t) => {
              setActiveToken(t);
              setCurrentPage("overview");
            }}
          />
        );
      case "launches":
        return <LaunchesPage token={activeToken} allTokens={tokens} />;
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
        onOpenSwapModal={() => setIsSwapModalOpen(true)}
      />

      <TickerBar
        token={activeToken}
        price={activeToken?.basePrice}
        priceChange={activeToken?.priceChanges?.h24 ? parseFloat(activeToken.priceChanges.h24) : 0}
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

      <SwapModal
        token={activeToken}
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
      />
    </div>
  );
}
