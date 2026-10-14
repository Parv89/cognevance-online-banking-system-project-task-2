import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, ShieldCheck } from 'lucide-react';

export default function AccountCard({ account, onAction }) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!account) return null;

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const getCardGradient = (type) => {
    switch (type) {
      case 'CHECKING':
        return 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
      case 'BUSINESS':
        return 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)';
      case 'SAVINGS':
      default:
        return 'linear-gradient(135deg, #0a2540 0%, #1e40af 100%)';
    }
  };

  return (
    <div
      className="bank-card"
      style={{
        background: getCardGradient(account.accountType),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', opacity: 0.9 }}>
            APEXVAULT
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 600,
            }}
          >
            {account.accountType}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
            {account.status}
          </span>
        </div>
      </div>

      <div style={{ margin: '14px 0 10px' }}>
        <div className="card-chip"></div>
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Account Number
        </div>
        <div className="bank-card-number">
          <span>{account.accountNumber}</span>
          <button
            onClick={copyAccountNumber}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              padding: '4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
            }}
            title="Copy account number"
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="bank-card-footer">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Available Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '2px',
                display: 'flex',
              }}
              title={showBalance ? 'Hide Balance' : 'Show Balance'}
            >
              {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="bank-card-balance">
            {showBalance ? formatCurrency(account.balance, account.currency) : '••••••••'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>Cardholder</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{account.ownerName || 'Demo Customer'}</div>
        </div>
      </div>
    </div>
  );
}
