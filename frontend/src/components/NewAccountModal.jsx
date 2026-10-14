import React, { useState } from 'react';
import { api } from '../api/client';
import { PlusCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function NewAccountModal({ isOpen, onClose, onSuccess }) {
  const [accountType, setAccountType] = useState('CHECKING');
  const [initialDeposit, setInitialDeposit] = useState('100.00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const depositVal = parseFloat(initialDeposit) || 0;
    if (depositVal < 0) {
      setError('Initial deposit cannot be negative');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.createAccount({
        accountType,
        initialDeposit: depositVal,
      });

      if (res.success && res.data) {
        onSuccess(res.data, `New ${accountType} account opened: ${res.data.accountNumber}`);
        handleClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to open account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAccountType('CHECKING');
    setInitialDeposit('100.00');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>Open New Account</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Create a secondary demo bank account
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select
              className="form-select"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              disabled={submitting}
            >
              <option value="CHECKING">Checking Account (Everyday Transactions)</option>
              <option value="SAVINGS">High-Yield Savings Account</option>
              <option value="BUSINESS">Business Commercial Account</option>
            </select>
            <p className="form-hint">
              Each account receives a unique 8-digit randomized account number.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Demo Opening Deposit (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.00"
              max="50000.00"
              className="form-input mono"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={16} color="var(--primary-accent)" />
            <span>Instant provisioning with FDIC mock demo backing.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  <span>Opening Account...</span>
                </>
              ) : (
                <span>Open Account</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
