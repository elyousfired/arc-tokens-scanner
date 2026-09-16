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
