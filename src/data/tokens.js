export const INITIAL_TOKENS = [
  {
    id: 'argus',
    symbol: 'ARGUS',
    name: 'ArgusPad Token',
    contract: '0xece5ca8bf9220718e5727754026757512212cb3c',
    color: '#38bdf8',
    icon: '🛡️',
    chain: 'Arc L1 (Circle USDC-Native)',
    platform: 'ArgusPad AMM Hooks',
    dex: 'ArgusSwap / Arc AMM',
    tag: 'LAUNCHPAD + DEX',
    basePrice: 0.0482,
    initialSupply: 1000000000,
    currentSupply: 934250000,
    totalBurned: 65750000,
    pendingBurn: 4120000,
    burnWallet: '0x000000000000000000000000000000000000dEaD',
    burnWalletTxs: 184520,
    burnWalletTxRateSec: 3.2,
    volume24h: 18420000,
    liquidity: 3250000,
    marketCap: 45030850,
    feeRatePct: 1.0,
    curveProgress: 100, // Graduated
    priceChanges: {
      m5: '+1.4%',
      h1: '+6.8%',
      h6: '-4.2%',
      h24: '+38.5%'
    },
    feeDistribution: {
      burnPct: 50,
      holdersPct: 25,
      rewardsPct: 15,
      teamPct: 10
    },
    directPairs: [
      { pair: 'ARGUS/USDC', dex: 'ArgusSwap Main Pool', volume24h: 12450000, fees: 62250, liquidity: 2100000 },
      { pair: 'ARGUS/WETH', dex: 'Arc Uniswap v3', volume24h: 3820000, fees: 19100, liquidity: 750000 },
      { pair: 'ARGUS/TOLLY', dex: 'Tolly Dual Pool', volume24h: 2150000, fees: 10750, liquidity: 400000 }
    ]
  },
  {
    id: 'tolly',
    symbol: 'TOLLY',
    name: 'Tolly Protocol',
    contract: '0xbc43ce8dec648ea298c4275559b81d6261c90b67',
    color: '#10b981',
    icon: '⚡',
    chain: 'Arc L1 (Circle USDC-Native)',
    platform: 'Tolly Launchpad & Terminal',
    dex: 'Tolly Instant Locked DEX',
    tag: 'LOCKED LIQUIDITY LEADER',
    basePrice: 0.0825,
    initialSupply: 1000000000,
    currentSupply: 887400000,
    totalBurned: 112600000,
    pendingBurn: 8950000,
    burnWallet: '0x000000000000000000000000000000000000dEaD',
    burnWalletTxs: 412890,
    burnWalletTxRateSec: 1.8, // 1 tx every 1.8 seconds!
    volume24h: 32650000,
    liquidity: 5800000,
    marketCap: 73210500,
    feeRatePct: 1.0,
    curveProgress: 100, // Instant Pool
    priceChanges: {
      m5: '-0.8%',
      h1: '+4.2%',
      h6: '+18.5%',
      h24: '+74.2%'
    },
    feeDistribution: {
      burnPct: 40,
      holdersPct: 35,
      rewardsPct: 15,
      teamPct: 10
    },
    directPairs: [
      { pair: 'TOLLY/USDC', dex: 'Tolly Direct Pool (Locked)', volume24h: 22800000, fees: 114000, liquidity: 4200000 },
      { pair: 'TOLLY/ARGUS', dex: 'Tolly Cross-Pair', volume24h: 5400000, fees: 27000, liquidity: 950000 },
      { pair: 'TOLLY/WARP', dex: 'WarpDex Dual Pool', volume24h: 4450000, fees: 22250, liquidity: 650000 }
    ]
  },
  {
    id: 'ellips',
    symbol: 'ELLIPS',
    name: 'Ellipsis Finance',
    contract: '0x86f7424c3e1ebb3f42e1e687468e36d5f2a1222e',
    color: '#c084fc',
    icon: '🔮',
    chain: 'Arc L1 (Circle USDC-Native)',
    platform: 'Ellipsis Curve AMM',
    dex: 'Ellipsis Stableswap',
    tag: 'DEEP LIQUIDITY CURVE',
    basePrice: 0.0215,
    initialSupply: 1000000000,
    currentSupply: 978500000,
    totalBurned: 21500000,
    pendingBurn: 1850000,
    burnWallet: '0x000000000000000000000000000000000000dEaD',
    burnWalletTxs: 98400,
    burnWalletTxRateSec: 4.5,
    volume24h: 11200000,
    liquidity: 4100000,
    marketCap: 21037750,
    feeRatePct: 0.8,
    curveProgress: 100,
    priceChanges: {
      m5: '+0.2%',
      h1: '-1.5%',
      h6: '+5.1%',
      h24: '+18.9%'
    },
    feeDistribution: {
      burnPct: 45,
      holdersPct: 30,
      rewardsPct: 15,
      teamPct: 10
    },
    directPairs: [
      { pair: 'ELLIPS/USDC', dex: 'Ellipsis Primary Pool', volume24h: 8100000, fees: 32400, liquidity: 3200000 },
      { pair: 'ELLIPS/EURC', dex: 'Circle Euro Pool', volume24h: 2100000, fees: 8400, liquidity: 650000 },
      { pair: 'ELLIPS/WETH', dex: 'Ellipsis Bridge Pool', volume24h: 1000000, fees: 4000, liquidity: 250000 }
    ]
  },
  {
    id: 'warp',
    symbol: 'WARP',
    name: 'Warp Launchpad',
    contract: '0x384c60f98ecd4c26345499345c03d677e40f115e',
    color: '#f59e0b',
    icon: '🚀',
    chain: 'Arc L1 (Circle USDC-Native)',
    platform: 'CircleWarp Bonding Curve',
    dex: 'WarpDex AMM',
    tag: 'BONDING CURVE GRADUATION',
    basePrice: 0.0540,
    initialSupply: 1000000000,
    currentSupply: 915800000,
    totalBurned: 84200000,
    pendingBurn: 6400000,
    burnWallet: '0x000000000000000000000000000000000000dEaD',
    burnWalletTxs: 298400,
    burnWalletTxRateSec: 2.1,
    volume24h: 24800000,
    liquidity: 4600000,
    marketCap: 49453200,
    feeRatePct: 1.0,
    curveProgress: 91.5, // 91.5% to $69K graduation
    priceChanges: {
      m5: '+3.1%',
      h1: '+12.4%',
      h6: '+28.0%',
      h24: '+58.4%'
    },
    feeDistribution: {
      burnPct: 50,
      holdersPct: 25,
      rewardsPct: 15,
      teamPct: 10
    },
    directPairs: [
      { pair: 'WARP/USDC', dex: 'WarpDex Bonding Pool', volume24h: 16900000, fees: 84500, liquidity: 3100000 },
      { pair: 'WARP/TOLLY', dex: 'Warp Dual Pool', volume24h: 4900000, fees: 24500, liquidity: 850000 },
      { pair: 'WARP/ARGUS', dex: 'Argus Swap Link', volume24h: 3000000, fees: 15000, liquidity: 650000 }
    ]
  }
];
