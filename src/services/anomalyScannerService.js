// Arc L1 Real-Time On-Chain Anomaly Detection Service

const CACHE_TTL_MS = 30 * 1000; // 30 seconds fresh cache

let memoryCache = null;
let lastFetchTime = 0;

/**
 * Main scanner function: queries GeckoTerminal + DexScreener for Arc L1,
 * inspects transaction patterns, volume/liquidity dynamics, and classifies anomalies.
 */
export async function scanArcAnomalies(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memoryCache && (now - lastFetchTime < CACHE_TTL_MS)) {
    return memoryCache;
  }

  const tokenMap = new Map();

  // 1. Fetch live Arc pools from GeckoTerminal (up to 3 pages)
  for (let page = 1; page <= 3; page++) {
    try {
      const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/arc/pools?page=${page}`);
      if (res.ok) {
        const json = await res.json();
        for (const item of (json.data || [])) {
          const baseId = item.relationships?.base_token?.data?.id || "";
          const contract = baseId.replace("arc_", "").toLowerCase();
          if (contract.startsWith("0x") && contract.length === 42) {
            const rawName = item.attributes?.name || "";
            const symbol = rawName.split("/")[0]?.trim() || "ARC";
            const vol24h = parseFloat(item.attributes?.volume_usd?.h24) || 0;
            const vol1h = parseFloat(item.attributes?.volume_usd?.h1) || 0;
            const liq = parseFloat(item.attributes?.reserve_in_usd) || 0;
            const price = parseFloat(item.attributes?.base_token_price_usd) || 0;
            const fdv = parseFloat(item.attributes?.fdv_usd || item.attributes?.market_cap_usd) || 0;
            const change24h = parseFloat(item.attributes?.price_change_percentage?.h24) || 0;
            const change1h = parseFloat(item.attributes?.price_change_percentage?.h1) || 0;

            const buys24h = parseInt(item.attributes?.transactions?.h24?.buys) || 0;
            const sells24h = parseInt(item.attributes?.transactions?.h24?.sells) || 0;
            const buys1h = parseInt(item.attributes?.transactions?.h1?.buys) || 0;
            const sells1h = parseInt(item.attributes?.transactions?.h1?.sells) || 0;

            tokenMap.set(contract, {
              contract,
              symbol,
              name: `${symbol} Token`,
              price,
              fdv,
              volume24h: vol24h,
              volume1h: vol1h,
              liquidity: liq,
              change24h,
              change1h,
              buys24h,
              sells24h,
              buys1h,
              sells1h,
              poolAddress: item.attributes?.address,
              dex: "Uniswap (Arc)"
            });
          }
        }
      }
    } catch (err) {
      console.warn("GeckoTerminal pools fetch error on page", page, err);
    }
  }

  // 2. Fetch DexScreener search results for Arc queries
  const queries = ["arc", "usdc", "pad", "tolly", "argus", "panchu", "duke", "syn", "ai", "pi", "architects", "warp"];
  await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
        if (res.ok) {
          const data = await res.json();
          for (const p of (data.pairs || [])) {
            if (p.chainId === "arc" && p.baseToken?.address) {
              const contract = p.baseToken.address.toLowerCase();
              const existing = tokenMap.get(contract) || {};
              const vol24h = parseFloat(p.volume?.h24) || existing.volume24h || 0;
              const vol1h = parseFloat(p.volume?.h1) || existing.volume1h || 0;
              const liq = parseFloat(p.liquidity?.usd) || existing.liquidity || 0;
              const price = parseFloat(p.priceUsd) || existing.price || 0;
              const fdv = parseFloat(p.fdv || p.marketCap) || existing.fdv || 0;
              const change24h = parseFloat(p.priceChange?.h24) || existing.change24h || 0;
              const change1h = parseFloat(p.priceChange?.h1) || existing.change1h || 0;

              const buys24h = parseInt(p.txns?.h24?.buys) || existing.buys24h || 0;
              const sells24h = parseInt(p.txns?.h24?.sells) || existing.sells24h || 0;
              const buys1h = parseInt(p.txns?.h1?.buys) || existing.buys1h || 0;
              const sells1h = parseInt(p.txns?.h1?.sells) || existing.sells1h || 0;

              tokenMap.set(contract, {
                ...existing,
                contract,
                symbol: p.baseToken.symbol || existing.symbol || "ARC",
                name: p.baseToken.name || existing.name || "Arc Token",
                price: price || existing.price || 0,
                fdv: Math.max(fdv, existing.fdv || 0),
                volume24h: Math.max(vol24h, existing.volume24h || 0),
                volume1h: Math.max(vol1h, existing.volume1h || 0),
                liquidity: Math.max(liq, existing.liquidity || 0),
                change24h: change24h || existing.change24h || 0,
                change1h: change1h || existing.change1h || 0,
                buys24h: Math.max(buys24h, existing.buys24h || 0),
                sells24h: Math.max(sells24h, existing.sells24h || 0),
                buys1h: Math.max(buys1h, existing.buys1h || 0),
                sells1h: Math.max(sells1h, existing.sells1h || 0),
                poolAddress: p.pairAddress || existing.poolAddress,
                pairUrl: p.url || `https://dexscreener.com/arc/${p.pairAddress || contract}`,
                dex: p.dexId ? p.dexId.toUpperCase() : (existing.dex || "Arc AMM")
              });
            }
          }
        }
      } catch {}
    })
  );

  const anomalyList = [];

  // 3. Algorithmic Evaluation of Each Token
  for (const token of tokenMap.values()) {
    const totalTx24h = (token.buys24h || 0) + (token.sells24h || 0);
    const volLiqRatio = token.liquidity > 0 ? (token.volume24h / token.liquidity) : 0;
    const volTxRatio = totalTx24h > 0 ? (token.volume24h / totalTx24h) : 0;
    const sellRatio = totalTx24h > 0 ? (token.sells24h / totalTx24h) : 0;
    const volMcRatio = token.fdv > 0 ? (token.volume24h / token.fdv) : 0;
    const h1ToH24Ratio = token.volume24h > 0 ? (token.volume1h / token.volume24h) : 0;

    const detected = [];

    // Rule 1: Honeypot / Zero-Sell Trap
    if (token.buys24h >= 8 && token.sells24h === 0) {
      detected.push({
        code: "HONEYPOT_ZERO_SELL",
        title: "Trap Honeypot (0 Ventes)",
        darijaTitle: "Piège Honeypot (Walou l-Bi3)",
        category: "CRITICAL",
        badgeColor: "rose",
        score: 98,
        description: `0 transactions de vente enregistrées sur ${token.buys24h} achats. Impossible de vendre ce token (code malveillant suspecté).`,
        darijaDesc: `Kayn ${token.buys24h} dyal chra walakin 7tta vente ma dazt! L-contract ghaleb ykoun habes l-bi3.`
      });
    }

    // Rule 2: Liquidity Drain / Soft Rug
    if (token.liquidity < 1500 && token.volume24h > 3000 && token.change24h < -25) {
      detected.push({
        code: "LIQUIDITY_DRAIN",
        title: "Fuite de Liquidité (Soft Rug)",
        darijaTitle: "Liquidité Khwawha (Danger)",
        category: "CRITICAL",
        badgeColor: "rose",
        score: 92,
        description: `La liquidité du pool est tombée à seulement $${Math.round(token.liquidity).toLocaleString()} avec un effondrement de ${token.change24h.toFixed(1)}%. Risque de rug pull complet.`,
        darijaDesc: `L-pool mkhwiya (baqi fiha ghir $${Math.round(token.liquidity).toLocaleString()}) o l-prix habet b ${token.change24h.toFixed(1)}%.`
      });
    }

    // Rule 3: Ghost Liquidity (Extreme Vol/Liq Disconnect)
    if (volLiqRatio > 12 && token.liquidity < 4500 && token.volume24h > 8000) {
      detected.push({
        code: "GHOST_LIQUIDITY",
        title: "Liquidité Fantôme (Vol/Liq > 12x)",
        darijaTitle: "Liquidité Naqsa Bzzaf",
        category: "WARNING",
        badgeColor: "amber",
        score: 82,
        description: `Le volume 24h ($${Math.round(token.volume24h).toLocaleString()}) dépasse la liquidité ($${Math.round(token.liquidity).toLocaleString()}) de ${volLiqRatio.toFixed(1)}x. Slippage extrêmement violent sur tout ordre.`,
        darijaDesc: `L-Volume fayt l-liquidité b ${volLiqRatio.toFixed(1)}x m3a liquidité da3ifa ($${Math.round(token.liquidity).toLocaleString()}). Ay vente sghira tqder tiyeh l-prix b 40%.`
      });
    }

    // Rule 4: Wash Trading / Fake Volume Suspect
    if ((token.volume24h > 15000 && totalTx24h < 8) || (volTxRatio > 5000 && totalTx24h < 20 && token.liquidity < 8000)) {
      detected.push({
        code: "WASH_TRADING",
        title: "Wash Trading Suspect",
        darijaTitle: "Faux Volume (Manipulation)",
        category: "WARNING",
        badgeColor: "amber",
        score: 78,
        description: `Volume artificiellement gonflé ($${Math.round(token.volume24h).toLocaleString()}) réparti sur seulement ${totalTx24h} transactions ($${Math.round(volTxRatio).toLocaleString()}/tx).`,
        darijaDesc: `Volume kbir bezaf b 3adad qlil d les transactions ($${Math.round(volTxRatio).toLocaleString()} f kol ordre). Hadchi chbaha d manipulation.`
      });
    }

    // Rule 5: Whale Dumping Pressure
    if (sellRatio >= 0.70 && totalTx24h >= 12 && token.change24h < -10) {
      detected.push({
        code: "WHALE_DUMP",
        title: "Pression Vendeuse Whale",
        darijaTitle: "Pression dyal l-Bi3 Kbiira",
        category: "WARNING",
        badgeColor: "amber",
        score: 72,
        description: `${(sellRatio * 100).toFixed(0)}% des transactions sont des ventes massives. Distribution agressive des créateurs ou de gros portefeuilles.`,
        darijaDesc: `${(sellRatio * 100).toFixed(0)}% d les transactions homa bi3. Les whales aw les dev kaykhwiw f souq.`
      });
    }

    // Rule 6: Sudden Momentum Breakout (Opportunity Surge)
    if (token.volume1h > 2000 && h1ToH24Ratio >= 0.35 && token.change1h > 10 && token.liquidity >= 3000) {
      detected.push({
        code: "MOMENTUM_BREAKOUT",
        title: "Breakout de Volume Soudain 🚀",
        darijaTitle: "Pump Soudain o Volume Dakhel",
        category: "OPPORTUNITY",
        badgeColor: "emerald",
        score: 88,
        description: `Surge massif : ${(h1ToH24Ratio * 100).toFixed(0)}% du volume journalier s'est concentré sur les 60 dernières minutes avec une hausse de +${token.change1h.toFixed(1)}%.`,
        darijaDesc: `Explosion d volume : ${(h1ToH24Ratio * 100).toFixed(0)}% mn l-volume dyal nhar kamel dkhlo ghir f had sa3a l-khranya m3a t-tlou3 d +${token.change1h.toFixed(1)}%.`
      });
    }

    // Rule 7: Hyper Velocity Asset
    if (volMcRatio > 15 && token.volume24h > 15000) {
      detected.push({
        code: "HYPER_VELOCITY",
        title: "Hyper Vélocité (Vol/MC > 15x)",
        darijaTitle: "Rotation d Flous Kharka",
        category: "WATCH",
        badgeColor: "indigo",
        score: 68,
        description: `Le volume journalier tourne ${volMcRatio.toFixed(1)} fois sa valorisation globale ($${Math.round(token.fdv).toLocaleString()}). Rotation intense de capitaux.`,
        darijaDesc: `L-flous kat-dwer fih b vitesse kharka (${volMcRatio.toFixed(1)}x l-market cap dyalo).`
      });
    }

    if (detected.length > 0) {
      detected.sort((a, b) => b.score - a.score);
      const primary = detected[0];

      anomalyList.push({
        ...token,
        primaryAnomaly: primary,
        allAnomalies: detected,
        totalScore: primary.score,
        volLiqRatio,
        volTxRatio,
        sellRatio,
        volMcRatio,
        h1ToH24Ratio,
        totalTx24h,
        pairUrl: token.pairUrl || `https://dexscreener.com/arc/${token.poolAddress || token.contract}`
      });
    }
  }

  // Sort overall anomalies by severity score descending
  anomalyList.sort((a, b) => b.totalScore - a.totalScore);

  // Compute summary stats
  const summary = {
    totalScanned: tokenMap.size,
    totalAnomalies: anomalyList.length,
    criticalCount: anomalyList.filter(a => a.primaryAnomaly.category === "CRITICAL").length,
    warningCount: anomalyList.filter(a => a.primaryAnomaly.category === "WARNING").length,
    opportunityCount: anomalyList.filter(a => a.primaryAnomaly.category === "OPPORTUNITY").length,
    watchCount: anomalyList.filter(a => a.primaryAnomaly.category === "WATCH").length,
    lastUpdated: new Date().toISOString()
  };

  const result = {
    anomalies: anomalyList,
    summary
  };

  memoryCache = result;
  lastFetchTime = Date.now();
  return result;
}
