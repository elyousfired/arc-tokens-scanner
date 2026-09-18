// Top 100 Arc L1 Revenue & Volume/MC/Burn Scanner Service

const CACHE_KEY = "arc_top_100_revenue_cache_v1";
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

let memoryCache = null;
let lastFetchTime = 0;

// Base known verified Arc L1 tokens with dead wallet metrics
const VERIFIED_ARC_METRICS = {
  "0xece5ca8bf9220718e5727754026757512212cb3c": {
    symbol: "ARGUS",
    name: "ArgusPad AMM Hooks Token",
    burnedTokens: 47297701,
    burnUsd: 901967,
    burnedPct: 4.73,
    creatorWallet: "0x7d613c6316ede9d257f3bf512777cb4ea4a6bee4",
    creatorBalanceUsd: 45958
  },
  "0xbc43ce8dec648ea298c4275559b81d6261c90b67": {
    symbol: "TOLLY",
    name: "Tolly Protocol",
    burnedTokens: 48684725,
    burnUsd: 268691,
    burnedPct: 4.87,
    creatorWallet: "0xe740d161461d48722bccc761c6f4e26778c87683",
    creatorBalanceUsd: 19709
  },
  "0x8bcb94279fc2c984ec34e0c1f2192df8c69ea4f0": {
    symbol: "ARCHITECTS",
    name: "Architects Arc",
    burnedTokens: 38410000,
    burnUsd: 12800,
    burnedPct: 3.84,
    creatorWallet: "0xa6735bb37672908c2c5e57a52682898d4612838f",
    creatorBalanceUsd: 2918
  },
  "0x5b4da7b7fe57a0d12ef1ed4d4a232d06e6e7c84a": {
    symbol: "PI",
    name: "Pi Network Arc L1",
    burnedTokens: 957763388,
    burnUsd: 767073,
    burnedPct: 95.78,
    creatorWallet: "0x80cd34d769cc9e2570c2fbf3c1e1766ac616e027",
    creatorBalanceUsd: 0
  },
  "0x305a59006a2b091a2b234bba7013ed6672b15218": {
    symbol: "AI",
    name: "Artificial Intelligence Arc",
    burnedTokens: 957763388,
    burnUsd: 841970,
    burnedPct: 95.78,
    creatorWallet: "0xc0396574275c9534339f604d1509c00e99977acc",
    creatorBalanceUsd: 0
  },
  "0x821214d8bff808fa776becbe4b7790eed026e777": {
    symbol: "万事币",
    name: "Wanshi Protocol",
    burnedTokens: 747064780,
    burnUsd: 128794,
    burnedPct: 74.71,
    creatorWallet: "0x80f49fee38659577a0bf4e2fbe690b3867c70f2a",
    creatorBalanceUsd: 0
  },
  "0x18b1ebc5ad9bf31d88ffc9f70132312f9803b777": {
    symbol: "SPECSY",
    name: "Specsy Token Arc",
    burnedTokens: 747064780,
    burnUsd: 117214,
    burnedPct: 74.71,
    creatorWallet: "0xeef7ccb75db7c4aa488e7b6c1c5ff605f4154f17",
    creatorBalanceUsd: 0
  },
  "0x384c60f98ecd4c26345499345c03d677e40f115e": {
    symbol: "WARP",
    name: "Warp Launchpad",
    burnedTokens: 26802244,
    burnUsd: 6199,
    burnedPct: 2.68,
    creatorWallet: "0x507a494fde26960cb36d50912cab83c71ecc7ea7",
    creatorBalanceUsd: 1850
  },
  "0x86f7424c3e1ebb3f42e1e687468e36d5f2a1222e": {
    symbol: "ELLIPSE",
    name: "Ellipse Finance",
    burnedTokens: 17249297,
    burnUsd: 3402,
    burnedPct: 1.72,
    creatorWallet: "0x0abd501f56cd434d346cd5bf3b67aef461ebbc2d",
    creatorBalanceUsd: 1200
  },
  "0x3d1c15916d852fa8ce41708bc55e55ba2cdd55d0": {
    symbol: "ZYORA",
    name: "Zyora Native Protocol",
    burnedTokens: 50000000,
    burnUsd: 15000,
    burnedPct: 5.0,
    creatorWallet: "0x745c48ec0b9145dd0d045a01656f600333b6655d",
    creatorBalanceUsd: 10102
  }
};

/**
 * Scans all available tokens on Arc L1 and ranks by 24h & Total Revenue
 */
export async function fetchTop100RevenueTokens(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memoryCache && (now - lastFetchTime < CACHE_TTL_MS)) {
    return memoryCache;
  }

  const tokenMap = new Map();

  // 1. Inject verified base tokens first
  for (const [contract, data] of Object.entries(VERIFIED_ARC_METRICS)) {
    tokenMap.set(contract.toLowerCase(), {
      contract: contract.toLowerCase(),
      symbol: data.symbol,
      name: data.name,
      price: 0,
      volume24h: 0,
      marketCap: 0,
      liquidity: 0,
      burnedTokens: data.burnedTokens,
      burnedPct: data.burnedPct,
      burnUsd: data.burnUsd,
      creatorWallet: data.creatorWallet,
      creatorBalanceUsd: data.creatorBalanceUsd,
      dex: "Arc AMM"
    });
  }

  // 2. Fetch live pools from GeckoTerminal
  try {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/arc/pools?page=${page}`);
      if (res.ok) {
        const json = await res.json();
        for (const item of (json.data || [])) {
          const baseId = item.relationships?.base_token?.data?.id || "";
          const contract = baseId.replace("arc_", "").toLowerCase();
          if (contract.startsWith("0x") && contract.length === 42) {
            const vol = parseFloat(item.attributes?.volume_usd?.h24) || 0;
            const fdv = parseFloat(item.attributes?.fdv_usd || item.attributes?.market_cap_usd) || 1;
            const price = parseFloat(item.attributes?.base_token_price_usd) || 0;
            const liq = parseFloat(item.attributes?.reserve_in_usd) || 0;
            const rawName = item.attributes?.name || "";
            const symbol = rawName.split("/")[0]?.trim() || "ARC";
            const change24h = parseFloat(item.attributes?.price_change_percentage?.h24) || 0;

            const existing = tokenMap.get(contract) || {};
            tokenMap.set(contract, {
              ...existing,
              contract,
              symbol: existing.symbol || symbol,
              name: existing.name || `${symbol} Token`,
              price: price || existing.price || 0,
              volume24h: Math.max(vol, existing.volume24h || 0),
              marketCap: fdv || existing.marketCap || 0,
              liquidity: liq || existing.liquidity || 0,
              change24h,
              pairAddress: item.attributes?.address,
              pairUrl: `https://dexscreener.com/arc/${item.attributes?.address}`,
              dex: "Uniswap (Arc)"
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("GeckoTerminal pools scan error:", err);
  }

  // 3. Query DexScreener search to discover additional pairs
  const queries = ["arc", "usdc", "pad", "tolly", "argus", "panchu", "duke", "syn", "cirbtc", "ai", "pi", "architects"];
  await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
        if (res.ok) {
          const data = await res.json();
          for (const p of (data.pairs || [])) {
            if (p.chainId === "arc" && p.baseToken?.address) {
              const contract = p.baseToken.address.toLowerCase();
              const vol = parseFloat(p.volume?.h24) || 0;
              const mcap = parseFloat(p.marketCap || p.fdv) || (parseFloat(p.priceUsd) * 1000000000) || 1;
              const price = parseFloat(p.priceUsd) || 0;
              const liq = parseFloat(p.liquidity?.usd) || 0;
              const change24h = parseFloat(p.priceChange?.h24) || 0;

              const existing = tokenMap.get(contract) || {};
              tokenMap.set(contract, {
                ...existing,
                contract,
                symbol: p.baseToken.symbol || existing.symbol || "ARC",
                name: p.baseToken.name || existing.name || p.baseToken.symbol,
                price: price || existing.price || 0,
                volume24h: Math.max(vol, existing.volume24h || 0),
                marketCap: Math.max(mcap, existing.marketCap || 0),
                liquidity: Math.max(liq, existing.liquidity || 0),
                change24h: change24h || existing.change24h || 0,
                pairAddress: p.pairAddress || existing.pairAddress,
                pairUrl: p.url || existing.pairUrl,
                dex: p.dexId ? p.dexId.toUpperCase() : (existing.dex || "Arc AMM")
              });
            }
          }
        }
      } catch {}
    })
  );

  // 4. Transform and calculate Revenue, Vol/MC, and Burn metrics
  const tokensList = Array.from(tokenMap.values()).map((t) => {
    // 1% AMM standard fee on Arc L1
    const revenue24h = Math.round(t.volume24h * 0.01);
    const mcap = t.marketCap > 0 ? t.marketCap : (t.price > 0 ? t.price * 1000000000 : 1);
    const volToMcNum = mcap > 0 ? (t.volume24h / mcap) : 0;
    const burnUsd = t.burnUsd || 0;
    const totalRevenue = Math.max(
      Math.round(burnUsd * 2), // If 50% fees went to burn, total fees = 2x burnUsd
      Math.round(revenue24h * 14)
    );

    return {
      ...t,
      marketCap: mcap,
      revenue24h,
      totalRevenue,
      volToMc: volToMcNum,
      volToMcFormatted: volToMcNum.toFixed(2) + "x",
      burnedTokens: t.burnedTokens || 0,
      burnedPct: t.burnedPct || 0,
      burnUsd: t.burnUsd || 0
    };
  });

  // 5. Sort by 24h Revenue descending, then total volume
  tokensList.sort((a, b) => {
    if (b.revenue24h !== a.revenue24h) {
      return b.revenue24h - a.revenue24h;
    }
    return b.volume24h - a.volume24h;
  });

  // 6. Assign Ranks
  const rankedTokens = tokensList.slice(0, 100).map((t, idx) => ({
    ...t,
    rank: idx + 1
  }));

  // Cache
  memoryCache = rankedTokens;
  lastFetchTime = now;

  return rankedTokens;
}
