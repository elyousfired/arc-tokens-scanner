import React, { useState } from 'react';
import { 
  Flame, TrendingUp, DollarSign, RefreshCw, Plus, ExternalLink, 
  Copy, Check, ArrowRight, ShieldCheck, Zap, BarChart2, Coins
} from 'lucide-react';
import { formatUSD, formatTokens, truncateAddress, calculateEmberTokenMetrics } from '../services/arcService';

export default function HomeHub({ 
  tokens, 
  onSelectToken, 
  onOpenAddModal 
}) {
  const [copiedContract, setCopiedContract] = useState(null);

  const handleCopy = (contract, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contract);
    setCopiedContract(contract);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  // Calcul des métriques cumulatives de l'écosystème Arc
  const globalStats = tokens.reduce((acc, t) => {
    const metrics = calculateEmberTokenMetrics(t);
    acc.totalVolume += metrics.combinedVolume24h;
    acc.totalFees += metrics.totalFeesDaily;
    acc.totalBurnUSD += metrics.burnRate.daily.usd;
    acc.totalHoldersUSD += metrics.dailyHoldersUSD;
    acc.totalMarketCap += t.marketCap;
    return acc;
  }, { totalVolume: 0, totalFees: 0, totalBurnUSD: 0, totalHoldersUSD: 0, totalMarketCap: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 🚀 BANNIÈRE D'ACCUEIL & STATS GLOBALES ARC L1 */}
      <div className="glass-panel" style={{
        borderRadius: '16px',
        padding: '24px 28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow de fond */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>🌐</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
                TABLEAU DE BORD ARC L1 — 4 TOKENS EN DIRECT
              </h1>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '680px' }}>
              Suivi On-Chain temps réel des tokens natifs sur la blockchain Arc (Circle). Cliquez sur n'importe quel token pour accéder à l'intégralité de sa suite analytique d'origine Ember (Tokenomics, Burn Wallet 1tx/2s, Revenus 24h, Projections d'Offre et Payback).
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.82rem' }}
          >
            <Plus size={16} />
            <span>+ Ajouter un Token Arc</span>
          </button>
        </div>

        {/* 4 Compteurs Globaux */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginTop: '22px'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Volume Global 24h</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#38bdf8', marginTop: '4px' }}>
              {formatUSD(globalStats.totalVolume, 0)}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Toutes paires confondues en USDC</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Revenus & Taxes 24h</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
              {formatUSD(globalStats.totalFees, 0)}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Frais générés pour l'écosystème</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Burn Quotidien Global</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#f87171', marginTop: '4px' }}>
              {formatUSD(globalStats.totalBurnUSD, 0)}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Racheté et brûlé on-chain chaque 24h</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Frais de Gas Arc Réseau</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#facc15', marginTop: '4px' }}>
              ~0.001$ USDC
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Stable, prévisible & sub-second</div>
          </div>
        </div>
      </div>

      {/* 🪙 GRILLE DES 4 CARTES INTERACTIVES */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🔥</span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffffff' }}>
              LES TOKENS SOUS SURVEILLANCE ({tokens.length} ACTIFS)
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Cliquez sur n'importe quel token pour ouvrir l'analyse approfondie
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {tokens.map((token) => {
            const metrics = calculateEmberTokenMetrics(token);
            const isGraduated = token.curveProgress >= 100;

            return (
              <div
                key={token.id}
                onClick={() => onSelectToken(token)}
                className="glass-card"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderTop: `3px solid ${token.color}`
                }}
              >
                {/* En-tête Carte */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: `${token.color}20`,
                      border: `1px solid ${token.color}50`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem'
                    }}>
                      {token.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff' }}>
                          {token.symbol}
                        </span>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#94a3b8',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontSize: '0.62rem',
                          fontWeight: '800'
                        }}>
                          {token.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {token.name}
                      </div>
                    </div>
                  </div>

                  {/* Bouton Copier Contrat */}
                  <button
                    onClick={(e) => handleCopy(token.contract, e)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: copiedContract === token.contract ? '#10b981' : '#94a3b8',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Copier l'adresse de contrat Arc"
                  >
                    {copiedContract === token.contract ? <Check size={12} /> : <Copy size={12} />}
                    <span>{truncateAddress(token.contract)}</span>
                  </button>
                </div>

                {/* Prix & Market Cap */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Prix USDC</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff' }}>
                      ${token.basePrice.toFixed(4)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Market Cap</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#38bdf8' }}>
                      {formatUSD(token.marketCap, 0)}
                    </div>
                  </div>
                </div>

                {/* Métriques Clés : Revenues, Burn, Payback */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.60rem', color: '#10b981', fontWeight: '700' }}>REVENUS 24H</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                      {formatUSD(metrics.totalFeesDaily, 0)}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.60rem', color: '#f87171', fontWeight: '700' }}>BURN TOTAL</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                      {metrics.pctBurned.toFixed(1)}% 🔥
                    </div>
                  </div>

                  <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.60rem', color: '#38bdf8', fontWeight: '700' }}>HOLDERS PAYBACK</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                      {formatUSD(metrics.dailyHoldersUSD, 0)}/j
                    </div>
                  </div>
                </div>

                {/* Bonding Curve / Statut */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '8px 10px',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Statut Liquidité :</span>
                    <strong style={{ color: isGraduated ? '#10b981' : '#f59e0b' }}>
                      {isGraduated ? '✅ POOL V4 LIQUIDITÉ VÉRINÉE' : `⏱️ CURVE: ${token.curveProgress}% ($69K)`}
                    </strong>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '5px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, token.curveProgress)}%`,
                      height: '100%',
                      background: isGraduated ? '#10b981' : 'linear-gradient(90deg, #f59e0b, #38bdf8)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>

                {/* CTA vers Deep Dive */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  color: token.color,
                  fontSize: '0.74rem',
                  fontWeight: '800'
                }}>
                  <span>VOIR ANALYSE COMPLÈTE (STYLE EMBER)</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 TABLEAU COMPARATIF BENCHMARK HEAD-TO-HEAD */}
      <div className="glass-panel" style={{ borderRadius: '14px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart2 size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffffff' }}>
            MATRICE COMPARATIVE EN TEMPS RÉEL (HEAD-TO-HEAD)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>TOKEN</th>
                <th style={{ padding: '10px 8px' }}>PRIX (USDC)</th>
                <th style={{ padding: '10px 8px' }}>MARKET CAP</th>
                <th style={{ padding: '10px 8px' }}>VOLUME 24H</th>
                <th style={{ padding: '10px 8px' }}>REVENUS 24H</th>
                <th style={{ padding: '10px 8px' }}>BURN TOTAL</th>
                <th style={{ padding: '10px 8px' }}>PAYBACK/JOUR</th>
                <th style={{ padding: '10px 8px' }}>FRÉQUENCE BURN</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(token => {
                const metrics = calculateEmberTokenMetrics(token);
                return (
                  <tr 
                    key={token.id}
                    onClick={() => onSelectToken(token)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{token.icon}</span>
                      <div>
                        <strong style={{ color: '#ffffff' }}>{token.symbol}</strong>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{token.name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontWeight: '700' }}>
                      ${token.basePrice.toFixed(4)}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#38bdf8', fontWeight: '800' }}>
                      {formatUSD(token.marketCap, 0)}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#ffffff' }}>
                      {formatUSD(metrics.combinedVolume24h, 0)}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#10b981', fontWeight: '800' }}>
                      {formatUSD(metrics.totalFeesDaily, 0)}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#f87171', fontWeight: '800' }}>
                      🔥 {metrics.pctBurned.toFixed(1)}% ({formatTokens(metrics.grandTotalBurnTokens)})
                    </td>
                    <td style={{ padding: '12px 8px', color: '#38bdf8', fontWeight: '800' }}>
                      {formatUSD(metrics.dailyHoldersUSD, 0)}/j
                    </td>
                    <td style={{ padding: '12px 8px', color: '#facc15', fontSize: '0.72rem' }}>
                      ⚡ 1 tx / {token.burnWalletTxRateSec}s
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button
                        style={{
                          background: `${token.color}20`,
                          border: `1px solid ${token.color}60`,
                          color: token.color,
                          padding: '4px 10px',
                          borderRadius: '5px',
                          fontSize: '0.70rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        Ouvrir ➔
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
