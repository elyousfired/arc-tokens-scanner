export function formatUSD(val, decimals = 2) {
  if (val == null || isNaN(val)) return '$0.00';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(decimals)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(decimals)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(decimals)}K`;
  return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatTokens(val) {
  if (val == null || isNaN(val)) return '0';
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return Number(Math.round(val)).toLocaleString();
}

export function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// 🧮 Calcule tous les indicateurs Ember pour un token
export function calculateEmberTokenMetrics(token) {
  const currentPrice = token.basePrice;
  const initialSupply = token.initialSupply;
  const currentSupply = token.currentSupply;
  const totalBurnedTokens = token.totalBurned;
  const pendingBurnTokens = token.pendingBurn;
  const grandTotalBurnTokens = totalBurnedTokens + pendingBurnTokens;
  const pctBurned = ((grandTotalBurnTokens / initialSupply) * 100);

  // 1. Calcul des Volumes & Fees 24h
  let totalVolume24h = token.volume24h;
  if (token.directPairs && token.directPairs.length > 0) {
    totalVolume24h = token.directPairs.reduce((acc, p) => acc + (p.volume24h || 0), 0);
  }
  const ecosystemVolume24h = token.ecosystemPairs 
    ? token.ecosystemPairs.reduce((acc, p) => acc + (p.volume24h || 0), 0)
    : 0;
  const combinedVolume24h = totalVolume24h + ecosystemVolume24h;

  // Total Fees générés à 0.3% - 1%
  const feeRate = (token.feeRatePct || 1.0) / 100;
  const totalFeesDaily = combinedVolume24h * feeRate;

  // 2. Répartition Financière selon les pourcentages Ember
  const dist = token.feeDistribution || { burnPct: 50, holdersPct: 25, rewardsPct: 15, teamPct: 10 };
  const dailyBurnUSD = totalFeesDaily * (dist.burnPct / 100);
  const dailyHoldersUSD = totalFeesDaily * (dist.holdersPct / 100);
  const dailyRewardsUSD = totalFeesDaily * (dist.rewardsPct / 100);
  const dailyTeamUSD = totalFeesDaily * (dist.teamPct / 100);

  // 3. Burn Rate en Tokens & en USD
  const dailyBurnTokens = currentPrice > 0 ? (dailyBurnUSD / currentPrice) : 0;
  const weeklyBurnTokens = dailyBurnTokens * 7;
  const monthlyBurnTokens = dailyBurnTokens * 30;
  const yearlyBurnTokens = dailyBurnTokens * 365;

  const weeklyBurnUSD = dailyBurnUSD * 7;
  const monthlyBurnUSD = dailyBurnUSD * 30;
  const yearlyBurnUSD = dailyBurnUSD * 365;

  // 4. Projection de Réduction de l'Offre (Exactement comme Ember)
  const projection1mSupply = Math.max(0, currentSupply - monthlyBurnTokens);
  const projection1mPct = ((initialSupply - projection1mSupply) / initialSupply) * 100;

  const projection3mSupply = Math.max(0, currentSupply - (monthlyBurnTokens * 3));
  const projection3mPct = ((initialSupply - projection3mSupply) / initialSupply) * 100;

  const projection6mSupply = Math.max(0, currentSupply - (monthlyBurnTokens * 6));
  const projection6mPct = ((initialSupply - projection6mSupply) / initialSupply) * 100;

  const projection1ySupply = Math.max(0, currentSupply - yearlyBurnTokens);
  const projection1yPct = ((initialSupply - projection1ySupply) / initialSupply) * 100;

  return {
    currentPrice,
    initialSupply,
    currentSupply,
    totalBurnedTokens,
    pendingBurnTokens,
    grandTotalBurnTokens,
    pctBurned,
    totalVolume24h,
    ecosystemVolume24h,
    combinedVolume24h,
    totalFeesDaily,
    dailyBurnUSD,
    dailyHoldersUSD,
    dailyRewardsUSD,
    dailyTeamUSD,
    burnRate: {
      daily: { tokens: dailyBurnTokens, usd: dailyBurnUSD },
      weekly: { tokens: weeklyBurnTokens, usd: weeklyBurnUSD },
      monthly: { tokens: monthlyBurnTokens, usd: monthlyBurnUSD },
      yearly: { tokens: yearlyBurnTokens, usd: yearlyBurnUSD }
    },
    supplyProjections: [
      { period: 'الآن (Actuel)', remainingSupply: currentSupply, pctBurned: pctBurned.toFixed(2) + '%' },
      { period: 'بعد شهر (1 mois)', remainingSupply: projection1mSupply, pctBurned: '~' + projection1mPct.toFixed(1) + '%' },
      { period: 'بعد 3 أشهر (3 mois)', remainingSupply: projection3mSupply, pctBurned: '~' + projection3mPct.toFixed(1) + '%' },
      { period: 'بعد 6 أشهر (6 mois)', remainingSupply: projection6mSupply, pctBurned: '~' + projection6mPct.toFixed(1) + '%' },
      { period: 'بعد سنة (1 an 🔥)', remainingSupply: projection1ySupply, pctBurned: '~' + projection1yPct.toFixed(1) + '%' }
    ]
  };
}
