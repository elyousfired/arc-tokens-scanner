import React from 'react';
import { Flame, Activity, Plus, Layers, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

export default function Navbar({ 
  tokens, 
  selectedToken, 
  onSelectToken, 
  onOpenAddModal 
}) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(4, 7, 17, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo & Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            onClick={() => onSelectToken(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
            }}>
              <Flame size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '0.5px', color: '#ffffff' }}>
                  ARC TERMINAL
                </span>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '900'
                }}>
                  100% USDC-NATIVE
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Suite Analytique On-Chain (Style Ember) pour Circle Arc L1
              </div>
            </div>
          </div>
        </div>

        {/* Quick Token Selector Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px 6px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            onClick={() => onSelectToken(null)}
            style={{
              background: selectedToken === null ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: selectedToken === null ? '#38bdf8' : '#94a3b8',
              border: selectedToken === null ? '1px solid #38bdf8' : 'none',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>ACCUEIL (HUB)</span>
          </button>

          {tokens.map(t => {
            const isSelected = selectedToken?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectToken(t)}
                style={{
                  background: isSelected ? `${t.color}25` : 'transparent',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? `1px solid ${t.color}` : 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{t.icon}</span>
                <span>{t.symbol}</span>
              </button>
            );
          })}
        </div>

        {/* Action Button & Network Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.70rem',
            fontWeight: '700',
            color: '#10b981'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>ARC L1 MAINNET</span>
            <span style={{ color: '#64748b' }}>|</span>
            <span>⚡ 0.8s FINALITY</span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            <Plus size={14} />
            <span>Ajouter Token</span>
          </button>
        </div>
      </div>
    </header>
  );
}
