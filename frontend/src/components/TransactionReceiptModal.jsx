import React from 'react';
import { CheckCircle2, Printer, X, ShieldCheck, ArrowRight } from 'lucide-react';

export default function TransactionReceiptModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleString();
    return new Date(dateStr).toLocaleString();
  };

  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amt || 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            OFFICIAL TRANSACTION RECEIPT
          </span>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Success header */}
        <div style={{ textAlign: 'center', padding: '16px 0 20px', borderBottom: '1px dashed var(--border-color)' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>
            {formatAmount(transaction.amount)}
          </h2>
          <div
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              backgroundColor: '#ecfdf5',
              color: 'var(--success)',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {transaction.status} — {transaction.type}
          </div>
        </div>

        {/* Details list */}
        <div style={{ padding: '16px 0', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Reference No.</span>
            <span className="mono" style={{ fontWeight: 600 }}>{transaction.transactionReference}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Date &amp; Time</span>
            <span>{formatDate(transaction.createdAt)}</span>
          </div>

          {transaction.sourceAccountNumber && transaction.sourceAccountNumber !== 'CASH / SYSTEM' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>From Account</span>
              <span className="mono" style={{ fontWeight: 600 }}>{transaction.sourceAccountNumber}</span>
            </div>
          )}

          {transaction.targetAccountNumber && transaction.targetAccountNumber !== 'CASH / ATM' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>To Account</span>
              <span className="mono" style={{ fontWeight: 600 }}>{transaction.targetAccountNumber}</span>
            </div>
          )}

          {transaction.description && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Description</span>
              <span style={{ maxWidth: '60%', textAlign: 'right' }}>{transaction.description}</span>
            </div>
          )}

          {transaction.balanceAfter !== null && transaction.balanceAfter !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-color)',
                fontWeight: 600,
              }}
            >
              <span>Ending Available Balance</span>
              <span style={{ color: 'var(--primary-accent)' }}>{formatAmount(transaction.balanceAfter)}</span>
            </div>
          )}
        </div>

        {/* Security watermark footer */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>ApexVault Cryptographic Audit Recorded (Simulated)</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePrint}>
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
