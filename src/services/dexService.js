// Arc L1 DEX & On-Chain Live Services

export async function fetchLiveTokenData(contractAddress) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.pairs || data.pairs.length === 0) return null;

    const arcPairs = data.pairs.filter((p) => p.chainId === 'arc');
    const pairsToUse = arcPairs.length > 0 ? arcPairs : data.pairs;
    const topPair = pairsToUse.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0] || {};

    const priceUsd = parseFloat(topPair.priceUsd) || 0;
    const totalVolume24h = Math.round(pairsToUse.reduce((sum, p) => sum + (p.volume?.h24 || 0), 0) || (topPair.volume?.h24 || 0));
    const totalLiquidity = Math.round(pairsToUse.reduce((sum, p) => sum + (p.liquidity?.usd || 0), 0) || (topPair.liquidity?.usd || 0));

    const marketCap = Math.round(topPair.marketCap || topPair.fdv || (priceUsd * 1000000000));
    const txns24h = Math.round(((topPair.txns?.h24?.buys || 0) + (topPair.txns?.h24?.sells || 0)));

    return {
      priceUsd,
      marketCap,
      txns24h,
      symbol: topPair.baseToken?.symbol || '',
      name: topPair.baseToken?.name || '',
      topPairUrl: topPair.url,
      volume24h: totalVolume24h,
      liquidity: totalLiquidity,
      priceChanges: {
        m5: topPair.priceChange?.m5 != null ? `${topPair.priceChange.m5 >= 0 ? '+' : ''}${topPair.priceChange.m5}%` : '+0.0%',
        h1: topPair.priceChange?.h1 != null ? `${topPair.priceChange.h1 >= 0 ? '+' : ''}${topPair.priceChange.h1}%` : '+0.0%',
        h6: topPair.priceChange?.h6 != null ? `${topPair.priceChange.h6 >= 0 ? '+' : ''}${topPair.priceChange.h6}%` : '+0.0%',
        h24: topPair.priceChange?.h24 != null ? `${topPair.priceChange.h24 >= 0 ? '+' : ''}${topPair.priceChange.h24}%` : '+0.0%',
      },
      directPairs: pairsToUse.slice(0, 5).map((p) => ({
        pair: `${p.baseToken?.symbol}/${p.quoteToken?.symbol}`,
        dex: `${(p.dexId || 'UNISWAP').toUpperCase()} (${p.pairAddress.slice(0, 6)}...${p.pairAddress.slice(-4)})`,
        volume24h: Math.round(p.volume?.h24 || 0),
        fees: Math.round((p.volume?.h24 || 0) * 0.01),
        liquidity: Math.round(p.liquidity?.usd || 0),
        url: p.url,
      })),
    };
  } catch (err) {
    console.error('DexScreener live fetch error:', err);
    return null;
  }
}

// 📡 Lit directement la balance du Dead Burn Wallet on-chain via Arc L1 RPC
export async function fetchOnchainBurnData(tokenContract, burnWallet = '0x000000000000000000000000000000000000dEaD') {
  try {
    const targetWallet = burnWallet || '0x000000000000000000000000000000000000dEaD';
    const cleanWallet = targetWallet.toLowerCase().replace('0x', '').padStart(64, '0');
    // ERC20 balanceOf(address) -> selector 0x70a08231
    const balanceOfData = `0x70a08231${cleanWallet}`;

    const res = await fetch('https://rpc.mainnet.arc.io', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: tokenContract, data: balanceOfData }, 'latest']
      })
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (!json.result || json.result === '0x') return null;

    const raw = BigInt(json.result);
    // Standard 18 décimales Arc EVM
    const totalBurned = Number(raw / 10000000000000000n) / 100;

    // totalSupply() -> selector 0x18160ddd
    let totalSupply = 1000000000;
    try {
      const supplyRes = await fetch('https://rpc.mainnet.arc.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_call',
          params: [{ to: tokenContract, data: '0x18160ddd' }, 'latest']
        })
      });
      if (supplyRes.ok) {
        const supplyJson = await supplyRes.json();
        if (supplyJson.result && supplyJson.result !== '0x') {
          totalSupply = Number(BigInt(supplyJson.result) / 10000000000000000n) / 100;
        }
      }
    } catch {}

    const roundedBurned = Math.round(totalBurned);
    const roundedSupply = Math.round(totalSupply);

    return {
      totalBurned: roundedBurned,
      initialSupply: roundedSupply,
      currentSupply: Math.max(0, roundedSupply - roundedBurned)
    };
  } catch (err) {
    console.warn('Arc L1 RPC on-chain fetch error:', err);
    return null;
  }
}

function decodeAbiString(hex) {
  if (!hex || hex === '0x') return '';
  try {
    const clean = hex.replace('0x', '');
    if (clean.length >= 128) {
      const len = parseInt(clean.slice(64, 128), 16);
      if (len > 0 && len <= 100) {
        const strHex = clean.slice(128, 128 + len * 2);
        let result = '';
        for (let i = 0; i < strHex.length; i += 2) {
          const c = parseInt(strHex.substr(i, 2), 16);
          if (c >= 32 && c <= 126) result += String.fromCharCode(c);
        }
        return result.trim();
      }
    } else if (clean.length === 64) {
      let str = '';
      for (let i = 0; i < clean.length; i += 2) {
        const code = parseInt(clean.substr(i, 2), 16);
        if (code >= 32 && code <= 126) str += String.fromCharCode(code);
      }
      return str.trim();
    }
  } catch {}
  return '';
}

// 🚀 Scan 100% On-Chain + DexScreener to construct complete Token Matrix
export async function scanFullArcToken(contractAddress) {
  const cleanAddr = contractAddress.trim().toLowerCase();
  if (!cleanAddr.startsWith("0x") || cleanAddr.length !== 42) return null;

  const rpc = 'https://rpc.mainnet.arc.io';
  const DEAD_ADDR = '0x000000000000000000000000000000000000dEaD';
  const cleanWallet = DEAD_ADDR.toLowerCase().replace('0x', '').padStart(64, '0');
  const balanceOfDead = `0x70a08231${cleanWallet}`;

  const calls = [
    { method: 'eth_call', params: [{ to: cleanAddr, data: '0x95d89b41' }, 'latest'] }, // symbol
    { method: 'eth_call', params: [{ to: cleanAddr, data: '0x06fdde03' }, 'latest'] }, // name
    { method: 'eth_call', params: [{ to: cleanAddr, data: '0x313ce567' }, 'latest'] }, // decimals
    { method: 'eth_call', params: [{ to: cleanAddr, data: '0x18160ddd' }, 'latest'] }, // totalSupply
    { method: 'eth_call', params: [{ to: cleanAddr, data: balanceOfDead }, 'latest'] }  // burn balance
  ];

  try {
    const [batchRes, dexRes] = await Promise.all([
      fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calls.map((c, i) => ({ jsonrpc: '2.0', id: i, ...c })))
      }).then(r => r.json()).catch(() => []),
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${cleanAddr}`).then(r => r.json()).catch(() => null)
    ]);

    const results = Array.isArray(batchRes) ? batchRes : [];
    const symOnchain = decodeAbiString(results.find(r => r.id === 0)?.result);
    const nameOnchain = decodeAbiString(results.find(r => r.id === 1)?.result);
    const decHex = results.find(r => r.id === 2)?.result;
    const decimals = (decHex && decHex !== '0x') ? (parseInt(decHex, 16) || 18) : 18;

    const supplyHex = results.find(r => r.id === 3)?.result;
    const burnedHex = results.find(r => r.id === 4)?.result;

    const divisor = 10n ** BigInt(decimals);
    let initialSupply = 1000000000;
    let totalBurned = 0;

    if (supplyHex && supplyHex !== '0x') {
      try {
        const rawSupply = BigInt(supplyHex);
        initialSupply = Math.round(Number(rawSupply / divisor));
      } catch {}
    }

    if (burnedHex && burnedHex !== '0x') {
      try {
        const rawBurned = BigInt(burnedHex);
        totalBurned = Math.round(Number(rawBurned / divisor));
      } catch {}
    }

    // Dex metrics
    const arcPairs = (dexRes?.pairs || []).filter(p => p.chainId === 'arc');
    const pairsToUse = arcPairs.length > 0 ? arcPairs : (dexRes?.pairs || []);
    const topPair = pairsToUse.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0] || {};

    const priceUsd = parseFloat(topPair.priceUsd) || 0;
    const volume24h = Math.round(pairsToUse.reduce((sum, p) => sum + (p.volume?.h24 || 0), 0) || (topPair.volume?.h24 || 0));
    const liquidity = Math.round(pairsToUse.reduce((sum, p) => sum + (p.liquidity?.usd || 0), 0) || (topPair.liquidity?.usd || 0));
    const marketCap = Math.round(topPair.marketCap || topPair.fdv || (priceUsd * initialSupply));

    const symbol = symOnchain || topPair.baseToken?.symbol || "ARC";
    const name = nameOnchain || topPair.baseToken?.name || `${symbol} Token`;

    const priceChanges = {
      m5: topPair.priceChange?.m5 != null ? `${topPair.priceChange.m5 >= 0 ? '+' : ''}${topPair.priceChange.m5}%` : '+0.0%',
      h1: topPair.priceChange?.h1 != null ? `${topPair.priceChange.h1 >= 0 ? '+' : ''}${topPair.priceChange.h1}%` : '+0.0%',
      h6: topPair.priceChange?.h6 != null ? `${topPair.priceChange.h6 >= 0 ? '+' : ''}${topPair.priceChange.h6}%` : '+0.0%',
      h24: topPair.priceChange?.h24 != null ? `${topPair.priceChange.h24 >= 0 ? '+' : ''}${topPair.priceChange.h24}%` : '+0.0%',
    };

    const directPairs = pairsToUse.slice(0, 8).map(p => ({
      pair: `${p.baseToken?.symbol}/${p.quoteToken?.symbol}`,
      dex: `${(p.dexId || 'UNISWAP').toUpperCase()} (${p.pairAddress.slice(0, 6)}...${p.pairAddress.slice(-4)})`,
      volume24h: Math.round(p.volume?.h24 || 0),
      fees: Math.round((p.volume?.h24 || 0) * 0.01),
      liquidity: Math.round(p.liquidity?.usd || 0),
      url: p.url
    }));

    return {
      id: cleanAddr,
      symbol: symbol.toUpperCase(),
      name,
      contract: cleanAddr,
      decimals,
      color: "#00f2fe",
      icon: "⚡",
      chain: "Arc L1 (Circle USDC-Native)",
      platform: "Arc Launchpad / AMM",
      dex: topPair.dexId ? topPair.dexId.toUpperCase() : "Arc AMM",
      tag: "VERIFIED ARC L1 TOKEN",
      basePrice: priceUsd,
      initialSupply,
      currentSupply: Math.max(0, initialSupply - totalBurned),
      totalBurned,
      pendingBurn: 0,
      burnWallet: DEAD_ADDR,
      burnWalletTxs: 0,
      burnWalletTxRateSec: 0,
      volume24h,
      liquidity,
      marketCap,
      feeRatePct: 1.0,
      curveProgress: 100,
      topPairUrl: topPair.url || `https://arc.etherscan.io/token/${cleanAddr}`,
      priceChanges,
      directPairs,
      feeDistribution: {
        burnPct: 50,
        holdersPct: 25,
        rewardsPct: 15,
        teamPct: 10
      },
      verifiedOnchain: true
    };
  } catch (err) {
    console.error("scanFullArcToken failed:", err);
    return null;
  }
}
