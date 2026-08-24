import React from 'react';
import { Robot } from '@phosphor-icons/react';
import styles from './LegalChatbot.module.css';

export type MessageProps = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
  isPremium?: boolean;
};

export const ChatMessage: React.FC<MessageProps> = ({ text, sender, timestamp, isTyping, isPremium }) => {
  const isUser = sender === 'user';

  return (
    <div 
      className={`${styles.animateSlideUp} flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{ display: 'flex', width: '100%', marginBottom: '1.5rem', justifyContent: isUser ? 'flex-end' : 'flex-start' }}
    >
      {!isUser && (
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', background: isPremium ? 'var(--premium-accent)' : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0,
          boxShadow: isPremium ? '0 4px 10px rgba(212,175,55,0.3)' : '0 4px 10px rgba(0,0,0,0.2)'
        }}>
          {isPremium ? <Robot weight="fill" color="black" size={20} /> : <Robot weight="fill" color="white" size={20} />}
        </div>
      )}
      
      <div style={{
        maxWidth: '75%',
        padding: '12px 18px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? (isPremium ? 'var(--premium-user-bubble)' : 'var(--user-bubble)') : (isPremium ? 'var(--premium-bot-bubble)' : 'var(--bot-bubble)'),
        border: isUser ? (isPremium ? '1px solid rgba(212,175,55,0.2)' : 'none') : (isPremium ? '1px solid var(--premium-border)' : '1px solid var(--glass-border)'),
        backdropFilter: isUser ? 'none' : 'blur(10px)',
        color: '#f8fafc',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        fontSize: '0.95rem',
        lineHeight: '1.5',
      }}>
        {isTyping ? (
          <div style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: `${styles.pulseDot} 1.4s infinite ease-in-out both`, animationDelay: '-0.32s' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: `${styles.pulseDot} 1.4s infinite ease-in-out both`, animationDelay: '-0.16s' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: `${styles.pulseDot} 1.4s infinite ease-in-out both` }} />
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
        )}
        
        {!isTyping && (
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '8px', textAlign: isUser ? 'right' : 'left' }}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};
