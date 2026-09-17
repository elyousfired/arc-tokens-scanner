// Service to scan and aggregate Fresh Burns on Arc L1 across 15M, 30M, 1H, 4H, and 24H (1J)
import { tokenCache, fetchTokenMeta } from "./burnScannerService";

const RPC_URL = "https://rpc.mainnet.arc.io";
const DEAD_TOPIC = "0x000000000000000000000000000000000000000000000000000000000000dead";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const TIMEFRAMES = {
  "15m": { key: "15m", label: "⚡ 15M", name: "Last 15 Minutes", blocks: 1800, seconds: 900 },
  "30m": { key: "30m", label: "🔥 30M", name: "Last 30 Minutes", blocks: 3600, seconds: 1800 },
  "1h":  { key: "1h",  label: "🕒 1H",  name: "Last 1 Hour (Default)", blocks: 7200, seconds: 3600 },
  "4h":  { key: "4h",  label: "⏳ 4H",  name: "Last 4 Hours", blocks: 28800, seconds: 14400 },
  "24h": { key: "24h", label: "📅 24H (1J)", name: "Last 24 Hours / 1 Jour", blocks: 70000, seconds: 86400 },
};

// In-memory cache by timeframe
const scanCache = {
  "15m": { data: null, timestamp: 0 },
  "30m": { data: null, timestamp: 0 },
  "1h":  { data: null, timestamp: 0 },
  "4h":  { data: null, timestamp: 0 },
  "24h": { data: null, timestamp: 0 },
};

async function rpcPost(method, params = []) {
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result || null;
  } catch (err) {
    console.warn(`RPC ${method} error:`, err);
    return null;
  }
}

// Fetch DEX prices in batch
async function fetchDexMetricsBatch(contracts) {
  if (!contracts || contracts.length === 0) return {};
  try {
    const unique = [...new Set(contracts.map(c => c.toLowerCase()))].slice(0, 30);
    const url = `https://api.dexscreener.com/latest/dex/tokens/${unique.join(",")}`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const map = {};
    if (data && data.pairs) {
      for (const pair of data.pairs) {
        const base = pair.baseToken?.address?.toLowerCase();
        if (base && !map[base]) {
          map[base] = {
            priceUsd: parseFloat(pair.priceUsd) || 0,
            liquidity: parseFloat(pair.liquidity?.usd) || 0,
            volume24h: parseFloat(pair.volume?.h24) || 0,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            pairUrl: pair.url
          };
        }
      }
    }
    return map;
  } catch {
    return {};
  }
}

function formatBlocksAgo(blocks) {
  if (blocks <= 0) return "Just now";
  // ~0.51s per block on Arc L1
  const seconds = Math.round(blocks * 0.51);
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export async function scanFreshHourlyBurns(timeframeKey = "1h", forceRefresh = false) {
  const config = TIMEFRAMES[timeframeKey] || TIMEFRAMES["1h"];
  const now = Date.now();
  const cached = scanCache[timeframeKey];

  // 25-second TTL cache to prevent RPC rate limiting
  if (!forceRefresh && cached?.data && now - cached.timestamp < 25000) {
    return cached.data;
  }

  try {
    const blockHex = await rpcPost("eth_blockNumber", []);
    if (!blockHex) return cached?.data || { tokens: [], stats: {}, currentBlock: 0 };
    const currentBlock = parseInt(blockHex, 16);

    let allLogs = [];

    if (timeframeKey === "15m" || timeframeKey === "30m" || timeframeKey === "1h") {
      const fromBlock = "0x" + Math.max(0, currentBlock - config.blocks).toString(16);
      const logs = await rpcPost("eth_getLogs", [{
        fromBlock,
        toBlock: "latest",
        topics: [TRANSFER_TOPIC, null, DEAD_TOPIC]
      }]);
      if (Array.isArray(logs)) allLogs = logs;
    } else if (timeframeKey === "4h") {
      // 4 chunks of ~7,000 blocks
      const step = 7000;
      const chunks = [];
      for (let b = currentBlock; b > currentBlock - config.blocks; b -= step) {
        const from = Math.max(0, b - step);
        const to = b;
        chunks.push([from, to]);
      }
      for (const [from, to] of chunks) {
        const logs = await rpcPost("eth_getLogs", [{
          fromBlock: "0x" + from.toString(16),
          toBlock: "0x" + to.toString(16),
          topics: [TRANSFER_TOPIC, null, DEAD_TOPIC]
        }]);
        if (Array.isArray(logs)) allLogs.push(...logs);
      }
    } else {
      // 24h: sample across 5 high-density intervals to cover the full day quickly
      const step = 7000;
      const samplePoints = [
        currentBlock - 7000,
        currentBlock - 21000,
        currentBlock - 42000,
        currentBlock - 63000
      ];
      for (const from of samplePoints) {
        const logs = await rpcPost("eth_getLogs", [{
          fromBlock: "0x" + from.toString(16),
          toBlock: "0x" + (from + step).toString(16),
          topics: [TRANSFER_TOPIC, null, DEAD_TOPIC]
        }]);
        if (Array.isArray(logs)) allLogs.push(...logs);
      }
    }

    // Group logs by token address
    const tokenMap = {};
    for (const log of allLogs) {
      const addr = log.address.toLowerCase();
      const block = parseInt(log.blockNumber, 16);
      let rawVal = 0n;
      try {
        if (log.data && log.data !== "0x") rawVal = BigInt(log.data);
      } catch {}

      if (!tokenMap[addr]) {
        tokenMap[addr] = {
          contract: addr,
          burnCount: 0,
          rawTotal: 0n,
          latestBlock: block,
          latestTx: log.transactionHash,
          firstBlock: block,
        };
      }

      tokenMap[addr].burnCount += 1;
      tokenMap[addr].rawTotal += rawVal;
      if (block > tokenMap[addr].latestBlock) {
        tokenMap[addr].latestBlock = block;
        tokenMap[addr].latestTx = log.transactionHash;
      }
      if (block < tokenMap[addr].firstBlock) {
        tokenMap[addr].firstBlock = block;
      }
    }

    const aggregated = Object.values(tokenMap);
    // Sort by burn frequency descending
    aggregated.sort((a, b) => b.burnCount - a.burnCount);

    // Fetch DEX data for top 30
    const topAddresses = aggregated.slice(0, 30).map(t => t.contract);
    const dexData = await fetchDexMetricsBatch(topAddresses);

    // Build enriched list
    const enriched = [];
    let totalUsdTimeframe = 0;
    let freshDebutsCount = 0;

    for (const item of aggregated.slice(0, 50)) {
      const dex = dexData[item.contract] || {};
      let meta = tokenCache[item.contract];
      if (!meta) {
        meta = {
          symbol: dex.symbol || "ARC-TOKEN",
          name: dex.name || "Arc L1 Token",
          decimals: 18,
          price: dex.priceUsd || 0
        };
        tokenCache[item.contract] = meta;
      }

      const dec = meta.decimals || 18;
      const divisor = 10n ** BigInt(dec);
      const tokensBurned = Number(item.rawTotal / divisor) + Number(item.rawTotal % divisor) / (10 ** dec);
      const price = dex.priceUsd || meta.price || 0;
      const burnUsd = Math.round(tokensBurned * price);
      const liquidity = dex.liquidity || 0;

      const blocksAgo = currentBlock - item.latestBlock;
      const timeAgo = formatBlocksAgo(blocksAgo);
      const isFreshDebut = blocksAgo <= 360; // < 3 minutes ago
      if (isFreshDebut) freshDebutsCount++;

      totalUsdTimeframe += burnUsd;

      // Status tag
      let tag = "Active AMM Burn";
      if (item.burnCount >= 15) {
        tag = "🔥 Ultra Active";
      } else if (isFreshDebut) {
        tag = "🚀 Fresh Debut";
      } else if (liquidity >= 50000) {
        tag = "💎 Deep Liquidity";
      } else if (liquidity > 0) {
        tag = "💧 Active Pool";
      } else {
        tag = "⚠️ Bonding Curve";
      }

      enriched.push({
        contract: item.contract,
        symbol: dex.symbol || meta.symbol,
        name: dex.name || meta.name || `${dex.symbol || meta.symbol} Token`,
        burnCount: item.burnCount,
        burnedTokens: tokensBurned,
        burnUsd,
        priceUsd: price,
        liquidity,
        latestBlock: item.latestBlock,
        latestTx: item.latestTx,
        timeAgo,
        isFreshDebut,
        tag,
        pairUrl: dex.pairUrl || `https://arc.etherscan.io/token/${item.contract}`
      });
    }

    const result = {
      tokens: enriched,
      stats: {
        totalLogs: allLogs.length,
        uniqueTokens: aggregated.length,
        totalUsd: totalUsdTimeframe,
        freshDebuts: freshDebutsCount,
        burnRatePerMinute: (allLogs.length / (config.seconds / 60)).toFixed(1),
        currentBlock
      },
      currentBlock,
      timeframe: config
    };

    scanCache[timeframeKey] = { data: result, timestamp: now };
    return result;
  } catch (err) {
    console.error("scanFreshHourlyBurns error:", err);
    return cached?.data || { tokens: [], stats: {}, currentBlock: 0 };
  }
}
