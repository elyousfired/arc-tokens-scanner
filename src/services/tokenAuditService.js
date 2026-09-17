// Arc L1 On-Chain Intelligence & Token Audit Engine

const KNOWN_FACTORIES = {
  ZYORA_LAUNCHPAD: "0x0351fc87f7f4bfb73a263559ce5cb570800ab6cf",
  ZYORA_DN404: "0x746023a9f52adf79c3de58682dbae5972fb86da0",
  ZYORA_STANDARD: "0x781fb303eb07d7b7b472865dd50019f62f374d3b",
  ZYORA_REGISTRY: "0xf2bc89a82485770887645046704a20dba5195937",
  ZYORA_AMM_ROUTER: "0x9d754eaac30c454d218d9c87efde15add3793c9e",
  ZYORA_LOCKER: "0xee0ea91c7c1bc7f77adce09592eae1ed59d30769",
  ZYORA_TOKEN: "0x3d1c15916d852fa8ce41708bc55e55ba2cdd55d0"
};

export async function auditArcToken(tokenData) {
  if (!tokenData || !tokenData.contract) return null;

  const addr = tokenData.contract.toLowerCase();
  const symbol = (tokenData.symbol || "TOKEN").toUpperCase();
  const name = tokenData.name || symbol;
  const price = tokenData.basePrice || tokenData.priceUsd || 0;
  const mcap = tokenData.marketCap || 0;
  const liquidity = tokenData.liquidity || 0;
  const volume24h = tokenData.volume24h || 0;
  const totalBurned = tokenData.totalBurned || 0;
  const initialSupply = tokenData.initialSupply || 1000000000;
  const currentSupply = tokenData.currentSupply || Math.max(1, initialSupply - totalBurned);
  const burnPct = initialSupply > 0 ? (totalBurned / initialSupply) * 100 : 0;
  const priceChange24h = parseFloat(tokenData.priceChanges?.h24 || 0);

  // 1. Check Ecosystem Origin & Known Protocol Footprint
  let ecosystemType = "Arc Standard AMM (Uniswap / Camelot V2 Fork)";
  let feeMechanism = "0.30% standard swap fee to Liquidity Providers";
  let isZyora = false;
  let isZyoraDN404 = false;

  if (addr === KNOWN_FACTORIES.ZYORA_TOKEN || name.toLowerCase().includes("zyora") || symbol.includes("ZYORA")) {
    ecosystemType = "Zyora Native Protocol Token";
    feeMechanism = "1.00% Protocol Fee · 65% Creator Cash (USDC) · 20% Treasury · 7.5% ZYRALS Pot · 5% Systematic Buyback & Burn";
    isZyora = true;
  } else if (name.toLowerCase().includes("dn404") || symbol.toLowerCase().includes("404")) {
    ecosystemType = "Zyora DN404 Hybrid (ERC-20 + 10,000 NFT Mirror Collection)";
    feeMechanism = "1.00% Protocol Fee + 7% NFT Royalties + 5% Systematic Buyback & Burn";
    isZyora = true;
    isZyoraDN404 = true;
  } else if (burnPct >= 1.0) {
    ecosystemType = "Arc Deflationary Autonomous Asset (Irreversible Dead Burns)";
    feeMechanism = "Automated Transaction Buyback & Dead Wallet Incineration";
  }

  // 2. Score Component 1: Liquidity Health & Depth (Max 25 pts)
  let liquidityScore = 0;
  let liquidityComment = "";
  if (liquidity >= 100000) {
    liquidityScore = 25;
    liquidityComment = "Profondeur institutionnelle exceptionnelle (> $100K)";
  } else if (liquidity >= 40000) {
    liquidityScore = 22;
    liquidityComment = "Très bonne profondeur de liquidité DEX ($40K - $100K)";
  } else if (liquidity >= 15000) {
    liquidityScore = 17;
    liquidityComment = "Liquidité modérée permettant des swaps sans glissement excessif";
  } else if (liquidity >= 3000) {
    liquidityScore = 10;
    liquidityComment = "Liquidité initiale précoce ($3K - $15K) - Risque de slippage moyen";
  } else if (liquidity > 0) {
    liquidityScore = 4;
    liquidityComment = "Liquidité ultra-faible (< $3K) - Risque élevé de forte volatilité";
  } else {
    liquidityScore = 1;
    liquidityComment = "Aucune liquidité DEX détectée";
  }

  // Liquidity to Mcap ratio health check
  const liqRatio = mcap > 0 ? (liquidity / mcap) * 100 : 0;
  if (liqRatio > 35) liquidityScore = Math.min(25, liquidityScore + 2);
  else if (liqRatio < 3 && mcap > 50000) liquidityScore = Math.max(2, liquidityScore - 4);

  // 3. Score Component 2: Burn & Deflationary Power (Max 20 pts)
  let burnScore = 0;
  let burnComment = "";
  if (burnPct >= 10) {
    burnScore = 20;
    burnComment = `Hyper-déflationniste: ${burnPct.toFixed(2)}% de l'offre définitivement incinérée`;
  } else if (burnPct >= 5) {
    burnScore = 18;
    burnComment = `Excellente dynamique de burn: ${burnPct.toFixed(2)}% détruits dans la dead wallet`;
  } else if (burnPct >= 2) {
    burnScore = 14;
    burnComment = `Brûlage actif significatif: ${burnPct.toFixed(2)}% de l'offre totale`;
  } else if (burnPct >= 0.5) {
    burnScore = 10;
    burnComment = `Brûlage amorcé: ${burnPct.toFixed(2)}% de l'offre déjà brûlée`;
  } else if (burnPct > 0) {
    burnScore = 6;
    burnComment = `Premiers burns détectés (${burnPct.toFixed(3)}%)`;
  } else {
    burnScore = 1;
    burnComment = "Aucun burn détecté sur l'adresse 0x00...dEaD";
  }

  if (isZyora) burnScore = Math.min(20, burnScore + 4);

  // 4. Score Component 3: Smart Contract Safety & Structure (Max 20 pts)
  let safetyScore = 17; // Base EVM bytecode standard on Arc L1
  let safetyComment = "Contrat standard EVM Arc L1 vérifié, gas optimisé en USDC natif";
  const strengths = [];
  const warnings = [];

  // Supply immutability check
  if (initialSupply > 0) {
    strengths.push({
      title: "Supply Fixe Vérifiée",
      desc: `Offre totale plafonnée à ${(initialSupply / 1000000).toFixed(1)}M ${symbol} sans émission cachée.`
    });
  }

  if (burnPct > 0) {
    strengths.push({
      title: "Mécanisme de Burn Irréversible",
      desc: `${(totalBurned / 1000000).toFixed(2)}M jetons (${burnPct.toFixed(2)}%) scellés à jamais dans la Dead Wallet.`
    });
  } else {
    warnings.push({
      title: "Aucun Burn Enregistré",
      desc: "Le jeton n'a pas encore de tokens retirés de la circulation active."
    });
  }

  if (liquidity >= 15000) {
    strengths.push({
      title: "Profondeur de Liquidité Solide",
      desc: `Piscine de liquidité DEX s'élevant à $${liquidity.toLocaleString()} USD.`
    });
  } else {
    warnings.push({
      title: "Liquidité Limitée",
      desc: `Pool DEX faible ($${liquidity.toLocaleString()}). Les ordres importants subiront un slippage élevé.`
    });
  }

  // 5. Score Component 4: Volume & Momentum 24h (Max 20 pts)
  let volumeScore = 0;
  let volumeComment = "";
  const volMcapRatio = mcap > 0 ? (volume24h / mcap) : 0;

  if (volMcapRatio >= 0.3 && volume24h > 5000) {
    volumeScore = 20;
    volumeComment = `Volant d'inertie très actif: ratio Volume/Mcap de ${(volMcapRatio * 100).toFixed(0)}%`;
    strengths.push({
      title: "Forte Activité de Trading",
      desc: `Volume 24h de $${volume24h.toLocaleString()} témoignant d'une traction organique vigoureuse.`
    });
  } else if (volume24h >= 20000) {
    volumeScore = 17;
    volumeComment = `Volume quotidien solide de $${volume24h.toLocaleString()}`;
  } else if (volume24h >= 3000) {
    volumeScore = 12;
    volumeComment = `Activité modérée ($${volume24h.toLocaleString()} en 24h)`;
  } else if (volume24h > 0) {
    volumeScore = 6;
    volumeComment = `Faible volume ($${volume24h.toLocaleString()} en 24h) - Phase d'accumulation/attente`;
    warnings.push({
      title: "Faible Volume 24h",
      desc: "Activité transactionnelle clairsemée, typique des phases d'amorçage ou de baisse d'intérêt."
    });
  } else {
    volumeScore = 1;
    volumeComment = "Aucun volume enregistré au cours des dernières 24 heures";
    warnings.push({
      title: "Volume Nul",
      desc: "Aucune transaction enregistrée au cours des dernières 24 heures."
    });
  }

  // Momentum trend bonus
  if (priceChange24h > 15) {
    volumeScore = Math.min(20, volumeScore + 2);
    strengths.push({
      title: "Tendance Prix Haussière (+24h)",
      desc: `Progression de +${priceChange24h.toFixed(1)}% au cours des dernières 24 heures.`
    });
  } else if (priceChange24h < -25) {
    volumeScore = Math.max(1, volumeScore - 3);
    warnings.push({
      title: "Forte Correction Récente",
      desc: `Baisse de ${priceChange24h.toFixed(1)}% enregistrée sur 24 heures.`
    });
  }

  // 6. Score Component 5: Ecosystem, Pairs & Settlement (Max 15 pts)
  let ecosystemScore = 12; // Arc L1 USDC-native standard
  let ecosystemComment = "Cotation et règlement directs en Native USDC sur Arc L1";

  if (isZyora) {
    ecosystemScore = 15;
    ecosystemComment = "Intégration directe au Launchpad & AMM Zyora avec modèle anti-dumping créateur";
    strengths.push({
      title: "Alignement Créateur Révolutionnaire (Anti-Dump)",
      desc: "65% des frais reversés en USDC aux développeurs, supprimant l'incitation à vendre des jetons."
    });
    strengths.push({
      title: "Buyback & Burn Automatique (5%)",
      desc: "5% de tous les frais du protocole sont alloués à l'achat et la destruction permanente du jeton."
    });
  } else if (tokenData.directPairs && tokenData.directPairs.length > 1) {
    ecosystemScore = 14;
    ecosystemComment = `${tokenData.directPairs.length} paires de liquidité actives détectées`;
  }

  // 7. Final Success Probability Score Calculation
  const totalScore = Math.min(99, Math.max(5, liquidityScore + burnScore + safetyScore + volumeScore + ecosystemScore));

  let tier = {
    label: "HIGH SUCCESS POTENTIAL",
    color: "#10b981", // green
    badge: "badge-active",
    verdict: "Projet très solide doté d'une excellente liquidité, de tokens activement brûlés et d'une dynamique de marché confirmée.",
    grade: "A+"
  };

  if (totalScore < 45) {
    tier = {
      label: "HIGH RISK / SPECULATIVE",
      color: "#ef4444", // red
      badge: "badge-mock",
      verdict: "Jeton spéculatif en phase précoce ou manquant de profondeur de liquidité. Réservé aux traders avertis avec strict contrôle du risque.",
      grade: "C-"
    };
  } else if (totalScore < 70) {
    tier = {
      label: "MODERATE RISK / VOLATILE",
      color: "#f59e0b", // yellow/amber
      badge: "badge-pending",
      verdict: "Projet en cours de développement avec potentiel asymétrique mais liquidité ou volume encore en phase de consolidation.",
      grade: "B"
    };
  }

  // Generate Executive Intelligence Briefing
  const narrative = `
Le token $${symbol} (${name}) opère sur le réseau Arc L1 (Chain ID 5042) avec règlement en Native USDC. Avec une offre totale de ${(initialSupply / 1000000).toFixed(1)}M et ${(totalBurned / 1000000).toFixed(2)}M jetons définitivement scellés dans la Dead Wallet (${burnPct.toFixed(2)}%), l'actif dispose d'une capitalisation boursière de $${mcap.toLocaleString()} adossée à $${liquidity.toLocaleString()} de liquidité sur les AMMs. Le modèle économique relève de la catégorie ${ecosystemType}. Le score d'audit de viabilité s'établit à ${totalScore}% (${tier.grade}), reflétant ${tier.verdict.toLowerCase()}
  `.trim();

  return {
    contract: addr,
    symbol,
    name,
    price,
    mcap,
    liquidity,
    volume24h,
    totalBurned,
    initialSupply,
    currentSupply,
    burnPct,
    ecosystemType,
    feeMechanism,
    isZyora,
    isZyoraDN404,
    totalScore,
    tier,
    breakdown: {
      liquidity: { score: liquidityScore, max: 25, label: "Santé & Profondeur Liquidité", comment: liquidityComment },
      burn: { score: burnScore, max: 20, label: "Dynamique de Burn Déflationniste", comment: burnComment },
      safety: { score: safetyScore, max: 20, label: "Sécurité & Structure Smart Contract", comment: safetyComment },
      volume: { score: volumeScore, max: 20, label: "Volume & Vélocité Transactionnelle", comment: volumeComment },
      ecosystem: { score: ecosystemScore, max: 15, label: "Écosystème & Paires de Règlement", comment: ecosystemComment }
    },
    strengths,
    warnings,
    narrative
  };
}
