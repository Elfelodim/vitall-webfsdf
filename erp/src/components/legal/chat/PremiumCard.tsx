import React from 'react';
import { FilePdf, ShieldCheck, Gavel } from '@phosphor-icons/react';
import styles from './LegalChatbot.module.css';

type PremiumCardProps = {
  title: string;
  description: string;
  date: string;
  onDownload?: () => void;
};

export const PremiumCard: React.FC<PremiumCardProps> = ({ title, description, date, onDownload }) => {
  return (
    <div className={`${styles.animateSlideUp} ${styles.card3dHover} ${styles.glowEffect}`} style={{
      width: '100%',
      maxWidth: '450px', 
      background: 'linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(5,5,5,0.98) 100%)',
      border: '1px solid rgba(255,215,0,0.3)',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
      marginBottom: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default'
    }}>
      {/* Decorative premium header */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '6px',
        background: 'var(--premium-accent)',
        boxShadow: '0 0 10px rgba(255,215,0,0.8)'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          width: '50px', height: '50px', borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(212,175,55,0.05) 100%)', 
          border: '1px solid rgba(255,215,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FFDF00',
          boxShadow: '0 0 15px rgba(255,215,0,0.2)'
        }}>
          <Gavel weight="duotone" size={32} />
        </div>
        <div>
          <h3 className={styles.shimmerText} style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>Documento Jurídico</h3>
          <span style={{ fontSize: '0.8rem', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <ShieldCheck weight="fill" /> Generado por IA Premium
          </span>
        </div>
      </div>

      <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '12px', lineHeight: 1.3 }}>{title}</h4>
      <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '24px' }}>
        {description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,215,0,0.15)', paddingTop: '20px' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{date}</span>
        
        <button 
          onClick={onDownload}
          style={{
            background: 'var(--premium-accent)',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '0.95rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(255,215,0,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,215,0,0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(255,215,0,0.3)';
          }}
        >
          <FilePdf weight="fill" size={20} />
          Descargar Acción de Tutela
        </button>
      </div>
    </div>
  );
};
