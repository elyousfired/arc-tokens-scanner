// Arc L1 On-Chain Revenue & Creator Earnings Service

const REVENUE_CACHE = new Map();

export const ARC_FEE_VAULTS = [
  {
    name: "Protocol Treasury & Revenue Vault",
    address: "0x7f77bad9eb06373fe3aee84f85a9d701ff820eeb",
    role: "Collects platform trading fee cuts and protocol reserves",
    color: "#38bdf8",
    sharePct: 40
  },
  {
    name: "Stakers & Liquidity Rewards Vault",
    address: "0x7e7df6f60581f13216c5e6fcfc5643b9f4261750",
    role: "Yield distribution stream for active LPs & stakers",
    color: "#10b981",
    sharePct: 30
  },
  {
    name: "Ecosystem Grants & Settlement Vault",
    address: "0xed2646c879caa74b0b44efefd34aeaf8a8a71bcc",
    role: "AMM router gas settlements and developer grants",
    color: "#a855f7",
    sharePct: 20
  },
  {
    name: "Automated Buyback & Burn Vault",
    address: "0xef1d61f88041ad0536b64b71b2825dbf348f2c4d",
    role: "Executes market buybacks incinerating tokens to dead address",
    color: "#f97316",
    sharePct: 10
  }
];

const KNOWN_CREATORS = {
  "0xece5ca8bf9220718e5727754026757512212cb3c": {
    address: "0x7d613c6316ede9d257f3bf512777cb4ea4a6bee4",
    type: "Smart Contract Admin / Deployer",
    name: "ArgusPad Core"
  },
  "0xbc43ce8dec648ea298c4275559b81d6261c90b67": {
    address: "0xe740d161461d48722bccc761c6f4e26778c87683",
    type: "On-Chain Contract Deployer",
    name: "Tolly Deployer"
  },
  "0x8bcb94279fc2c984ec34e0c1f2192df8c69ea4f0": {
    address: "0xa6735bb37672908c2c5e57a52682898d4612838f",
    type: "On-Chain Contract Deployer",
    name: "Architects Deployer"
  },
  "0x5b4da7b7fe57a0d12ef1ed4d4a232d06e6e7c84a": {
    address: "0x5b4da7b7fe57a0d12ef1ed4d4a232d06e6e7c84a",
    type: "Bonding Curve Liquidity Pool",
    name: "Pi Network Deployer"
  }
};

/**
 * Reads the native gas/USDC balance of any address on Arc L1 (1 ARC = 1 USDC)
 */
export async function getArcUsdcBalance(address) {
  if (!address) return 0;
  try {
    const res = await fetch("https://rpc.mainnet.arc.io", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"]
      })
    });
    if (!res.ok) return 0;
    const json = await res.json();
    if (!json.result || json.result === "0x") return 0;
    // Standard Arc L1 18 decimals native USDC
    return Number(BigInt(json.result) / 10000000000000000n) / 100;
  } catch (err) {
    console.warn("getArcUsdcBalance error:", err);
    return 0;
  }
}

/**
 * Finds the Creator / Deployer wallet for any token contract
 */
export async function findTokenCreator(contractAddress) {
  if (!contractAddress) return null;
  const clean = contractAddress.toLowerCase();

  // 1. Check known verified creators
  if (KNOWN_CREATORS[clean]) {
    return KNOWN_CREATORS[clean];
  }

  // 2. Check cache
  if (REVENUE_CACHE.has(clean)) {
    return REVENUE_CACHE.get(clean);
  }

  // 3. Query on-chain owner()
  try {
    const res = await fetch("https://rpc.mainnet.arc.io", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: clean, data: "0x8da5cb5b" }, "latest"]
      })
    });
    const json = await res.json();
    if (json.result && json.result !== "0x" && !json.result.endsWith("0000000000000000000000000000000000000000")) {
      const creator = {
        address: "0x" + json.result.slice(-40),
        type: "Smart Contract Admin / Owner",
        name: "Verified Token Owner"
      };
      REVENUE_CACHE.set(clean, creator);
      return creator;
    }
  } catch {}

  // 4. Scrape creator from Arc Etherscan
  try {
    const res = await fetch(`https://arc.etherscan.io/address/${clean}`);
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/title='Creator Address \((0x[a-fA-F0-9]{40})\)'/i) ||
                html.match(/contract code at\s+<a[^>]*href='\/address\/(0x[a-fA-F0-9]{40})'/i) ||
                html.match(/href='\/address\/(0x[a-fA-F0-9]{40})'[^>]*title='Creator/i);
      if (m && m[1]) {
        const creator = {
          address: m[1],
          type: "On-Chain Contract Deployer",
          name: "Contract Creator"
        };
        REVENUE_CACHE.set(clean, creator);
        return creator;
      }
    }
  } catch {}

  return null;
}

/**
 * Returns full live revenue & fee analytics for a token
 */
export async function fetchTokenRevenueData(token) {
  if (!token) return null;
  const contract = token.contract || token.id;
  const volume24h = Number(token.volume24h) || 0;
  const feeRatePct = Number(token.feeRatePct) || 1.0;

  // 1. Calculate fees generated from volume
  const dailyTotalFeesUsd = Math.round((volume24h * feeRatePct) / 100);
  const estimatedAnnualFeesUsd = dailyTotalFeesUsd * 365;

  // 2. Resolve creator wallet & balance
  const creator = await findTokenCreator(contract);
  let creatorBalanceUsd = 0;
  if (creator?.address) {
    creatorBalanceUsd = await getArcUsdcBalance(creator.address);
  }

  // 3. Fetch network fee vaults live balances
  const vaultsWithBalances = await Promise.all(
    ARC_FEE_VAULTS.map(async (v) => {
      const bal = await getArcUsdcBalance(v.address);
      return {
        ...v,
        currentBalanceUsd: Math.round(bal)
      };
    })
  );

  const totalVaultsUsd = vaultsWithBalances.reduce((sum, v) => sum + v.currentBalanceUsd, 0);

  return {
    dailyTotalFeesUsd,
    estimatedAnnualFeesUsd,
    creatorWallet: creator?.address || null,
    creatorType: creator?.type || "Deployer Wallet",
    creatorBalanceUsd: Math.round(creatorBalanceUsd),
    vaults: vaultsWithBalances,
    totalVaultsUsd
  };
}
