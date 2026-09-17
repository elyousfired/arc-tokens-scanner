// Service to scan Arc L1 Dead Burn Wallet (0x000000000000000000000000000000000000dEaD) live

const RPC_URL = 'https://rpc.mainnet.arc.io';
const DEAD_TOPIC = '0x000000000000000000000000000000000000000000000000000000000000dead';
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// In-memory token metadata cache
export const tokenCache = {
  '0xece5ca8bf9220718e5727754026757512212cb3c': { symbol: 'ARGUS', name: 'ArgusPad Token', decimals: 18, price: 0.02017 },
  '0xbc43ce8dec648ea298c4275559b81d6261c90b67': { symbol: 'TOLLY', name: 'Tolly Protocol', decimals: 18, price: 0.006308 },
  '0x86f7424c3e1ebb3f42e1e687468e36d5f2a1222e': { symbol: 'ELLIPS', name: 'Ellipsis Finance', decimals: 18, price: 0.0002476 },
  '0x384c60f98ecd4c26345499345c03d677e40f115e': { symbol: 'WARP', name: 'Warp Launchpad', decimals: 18, price: 0.000383 },
};

async function rpcPost(method, params = []) {
  try {
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result || null;
  } catch (err) {
    console.warn(`RPC ${method} error:`, err);
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

export async function fetchTokenMeta(contractAddress) {
  const addr = contractAddress.toLowerCase();
  if (tokenCache[addr]) return tokenCache[addr];

  let symbol = 'ARC-TOKEN';
  let decimals = 18;

  try {
    const symHex = await rpcPost('eth_call', [{ to: addr, data: '0x95d89b41' }, 'latest']);
    const decodedSym = decodeAbiString(symHex);
    if (decodedSym) symbol = decodedSym;

    const decHex = await rpcPost('eth_call', [{ to: addr, data: '0x313ce567' }, 'latest']);
    if (decHex && decHex !== '0x') {
      const parsedDec = parseInt(decHex, 16);
      if (!isNaN(parsedDec) && parsedDec > 0 && parsedDec <= 36) {
        decimals = parsedDec;
      }
    }
  } catch {}

  const meta = { symbol, decimals, price: 0 };
  tokenCache[addr] = meta;
  return meta;
}

export async function scanDeadWalletBurns(blockSpan = 150) {
  try {
    const blockHex = await rpcPost('eth_blockNumber', []);
    if (!blockHex) return { burns: [], currentBlock: 0 };
    const currentBlock = parseInt(blockHex, 16);
    const fromBlock = '0x' + Math.max(0, currentBlock - blockSpan).toString(16);

    const logs = await rpcPost('eth_getLogs', [{
      fromBlock,
      toBlock: 'latest',
      topics: [TRANSFER_TOPIC, null, DEAD_TOPIC]
    }]);

    if (!logs || !Array.isArray(logs)) return { burns: [], currentBlock };

    // Newest first
    const sorted = logs.slice().reverse();
    const items = [];

    for (const l of sorted) {
      const contract = l.address.toLowerCase();
      let meta = tokenCache[contract];
      if (!meta) {
        meta = await fetchTokenMeta(contract);
      }

      const raw = BigInt(l.data || '0x0');
      const dec = meta.decimals || 18;
      let tokens = 0;
      if (dec >= 6) {
        const shift = 10n ** BigInt(dec - 4);
        tokens = Number(raw / shift) / 10000;
      } else {
        tokens = Number(raw) / (10 ** dec);
      }

      const blockNum = parseInt(l.blockNumber, 16);
      const fromAddr = '0x' + (l.topics[1]?.slice(26) || '').toLowerCase();
      const blocksAgo = currentBlock - blockNum;

      items.push({
        tx: l.transactionHash,
        shortTx: l.transactionHash.slice(0, 8) + '...' + l.transactionHash.slice(-6),
        contract,
        symbol: meta.symbol,
        decimals: meta.decimals,
        tokens,
        usd: tokens * (meta.price || 0),
        from: fromAddr,
        shortFrom: fromAddr.slice(0, 6) + '...' + fromAddr.slice(-4),
        blockNumber: blockNum,
        blocksAgo,
        timeAgo: blocksAgo <= 1 ? 'just now' : `${blocksAgo * 2}s ago`
      });
    }

    return { burns: items, currentBlock };
  } catch (err) {
    console.error('Scan dead wallet burns failed:', err);
    return { burns: [], currentBlock: 0 };
  }
}
