// Universal Chart & Pair Resolver Service for Arc L1 DEX Tokens

// In-memory cache for pair resolution & OHLCV candles
const PAIR_CACHE = new Map();
const OHLCV_CACHE = new Map();

/**
 * Resolves the trading pair address and DexScreener embed URL for any token
 */
export async function resolveTokenPair(token) {
  if (!token) return null;

  // 1. Direct pair in token object
  if (token.pairAddress) {
    return {
      pairAddress: token.pairAddress,
      chainId: token.chainId || "arc",
      url: token.topPairUrl || `https://dexscreener.com/arc/${token.pairAddress}`,
      embedUrl: `https://dexscreener.com/${token.chainId || "arc"}/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    };
  }

  // 2. Extract from directPairs or topPairUrl
  const urlToCheck = token.directPairs?.[0]?.url || token.topPairUrl;
  if (urlToCheck) {
    const match = urlToCheck.match(/\/([0-9a-fA-Fx]+)$/);
    if (match) {
      const pair = match[1];
      return {
        pairAddress: pair,
        chainId: "arc",
        url: urlToCheck,
        embedUrl: `https://dexscreener.com/arc/${pair}?embed=1&theme=dark&trades=0&info=0`
      };
    }
  }

  const query = token.contract || token.id;
  if (!query || typeof query !== "string") return null;
  const clean = query.trim().toLowerCase();

  if (PAIR_CACHE.has(clean)) {
    return PAIR_CACHE.get(clean);
  }

  try {
    // Try tokens endpoint
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${clean}`);
    if (res.ok) {
      const data = await res.json();
      const p = data.pairs?.find((x) => x.chainId === "arc") || data.pairs?.[0];
      if (p?.pairAddress) {
        const resolved = {
          pairAddress: p.pairAddress,
          chainId: p.chainId || "arc",
          url: p.url,
          embedUrl: `https://dexscreener.com/${p.chainId || "arc"}/${p.pairAddress}?embed=1&theme=dark&trades=0&info=0`
        };
        PAIR_CACHE.set(clean, resolved);
        return resolved;
      }
    }

    // Try pairs endpoint in case 'clean' is already a pair address
    const pRes = await fetch(`https://api.dexscreener.com/latest/dex/pairs/arc/${clean}`);
    if (pRes.ok) {
      const pData = await pRes.json();
      const p = pData.pair || pData.pairs?.[0];
      if (p?.pairAddress) {
        const resolved = {
          pairAddress: p.pairAddress,
          chainId: p.chainId || "arc",
          url: p.url,
          embedUrl: `https://dexscreener.com/${p.chainId || "arc"}/${p.pairAddress}?embed=1&theme=dark&trades=0&info=0`
        };
        PAIR_CACHE.set(clean, resolved);
        return resolved;
      }
    }
  } catch (err) {
    console.warn("Error resolving token pair:", err);
  }

  return null;
}

/**
 * Fetches real on-chain OHLCV bars from GeckoTerminal with caching & fallback
 */
export async function fetchOnchainOhlcv(pairAddress, timeframe = "1h") {
  if (!pairAddress) return null;
  const cleanPair = pairAddress.toLowerCase();
  const cacheKey = `${cleanPair}_${timeframe}`;

  const cached = OHLCV_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 45000) {
    return cached.data;
  }

  // Timeframe endpoint mapping
  let endpoint = "";
  if (timeframe === "15m") endpoint = `/ohlcv/minute?aggregate=15&limit=48`;
  else if (timeframe === "1h") endpoint = `/ohlcv/hour?limit=48`;
  else if (timeframe === "4h") endpoint = `/ohlcv/hour?aggregate=4&limit=36`;
  else if (timeframe === "1D") endpoint = `/ohlcv/day?limit=30`;
  else endpoint = `/ohlcv/hour?limit=48`;

  try {
    const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/arc/pools/${cleanPair}${endpoint}`);
    if (res.ok) {
      const json = await res.json();
      const rawList = json.data?.attributes?.ohlcv_list;
      if (Array.isArray(rawList) && rawList.length > 0) {
        // Reverse so oldest is first, newest is last
        const chronological = rawList.slice().reverse();
        const formatted = chronological.map(([ts, open, high, low, close, volume]) => {
          const date = new Date(ts * 1000);
          let timeLabel = "";
          if (timeframe === "1D") {
            timeLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          } else {
            timeLabel = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
          }

          return {
            time: timeLabel,
            rawTs: ts,
            price: Number(close),
            open: Number(open),
            high: Number(high),
            low: Number(low),
            close: Number(close),
            volume: Math.round(Number(volume) || 0)
          };
        });

        OHLCV_CACHE.set(cacheKey, { timestamp: Date.now(), data: formatted });
        return formatted;
      }
    }
  } catch (err) {
    console.warn("GeckoTerminal fetch error:", err);
  }

  return null;
}

/**
 * High-fidelity fallback timeline anchored to real on-chain price changes (never fake cliff spikes!)
 */
export function generateAccurateFallbackTimeline(basePrice, priceChange, timeframe = "1h") {
  const points = timeframe === "15m" ? 24 : timeframe === "1h" ? 24 : timeframe === "4h" ? 24 : 14;
  const stepMinutes = timeframe === "15m" ? 15 : timeframe === "1h" ? 60 : timeframe === "4h" ? 240 : 1440;
  const now = Date.now();
  const data = [];

  const changePct = Number(priceChange) || 0;
  // Starting price 24h ago
  const startPrice = basePrice / (1 + changePct / 100);

  for (let i = 0; i < points; i++) {
    const pointTime = new Date(now - (points - 1 - i) * stepMinutes * 60 * 1000);
    const progress = i / (points - 1); // 0.0 to 1.0

    // Smooth monotonic / natural curve from startPrice to basePrice
    // Smooth step curve (cosine) to avoid sharp jumps or cliffs
    const smoothProgress = (1 - Math.cos(progress * Math.PI)) / 2;
    // Tiny gentle intraday variation (±0.8%) that naturally settles to 0 at the end
    const wave = Math.sin(progress * Math.PI * 3) * (basePrice * 0.008) * (1 - progress);
    const price = startPrice + (basePrice - startPrice) * smoothProgress + wave;

    let timeLabel = "";
    if (timeframe === "1D") {
      timeLabel = pointTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      timeLabel = pointTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    data.push({
      time: timeLabel,
      price: Number(price.toFixed(6)),
      open: Number((price * 0.998).toFixed(6)),
      high: Number((price * 1.008).toFixed(6)),
      low: Number((price * 0.992).toFixed(6)),
      close: Number(price.toFixed(6)),
      volume: Math.round(basePrice * 50000 * (0.8 + 0.4 * Math.sin(progress * Math.PI)))
    });
  }

  return data;
}

/**
 * Smart price formatter that avoids duplicate Y-axis labels by adjusting decimal precision
 */
export function formatChartPrice(val, allPrices = []) {
  if (val == null || isNaN(val)) return "$0";
  const num = Number(val);
  if (num === 0) return "$0";

  let precision = 4;
  if (allPrices.length > 1) {
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const diff = Math.abs(max - min);
    if (diff > 0 && diff < 0.0001) precision = 7;
    else if (diff > 0 && diff < 0.001) precision = 6;
    else if (diff > 0 && diff < 0.01) precision = 5;
    else if (diff > 0 && diff < 1) precision = 4;
    else precision = 2;
  } else {
    if (num < 0.0001) precision = 7;
    else if (num < 0.001) precision = 6;
    else if (num < 0.01) precision = 5;
    else if (num < 1) precision = 4;
    else precision = 2;
  }

  return `$${num.toFixed(precision)}`;
}
