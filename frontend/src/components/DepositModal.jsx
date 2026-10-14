import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ArrowDownCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function DepositModal({ isOpen, onClose, accounts, onSuccess, initialAccount }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      if (initialAccount) {
        setAccountNumber(initialAccount);
      } else {
        setAccountNumber(accounts[0].accountNumber);
      }
    }
  }, [accounts, initialAccount, isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accountNumber) {
      setError('Please select an account');
      return;
    }
    if (numAmount <= 0) {
      setError('Deposit amount must be greater than $0.00');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.deposit({
        accountNumber,
        amount: numAmount,
        description: description.trim() || 'Demo Cash Deposit',
      });

      if (res.success && res.data) {
        onSuccess(res.data, `Successfully deposited $${numAmount.toFixed(2)}!`);
        handleClose();
      }
    } catch (err) {
      setError(err.message || 'Deposit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
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
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowDownCircle size={20} />
            </div>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>Deposit Funds</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Simulate instant demo credit to account
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
            <label className="form-label">Select Deposit Account</label>
            <select
              className="form-select"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={submitting}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountNumber} ({acc.accountType}) — Current: ${parseFloat(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Deposit Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="50000.00"
              className="form-input mono"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              required
            />

            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {[100, 250, 500, 1000, 2500].map((val) => (
                <button
                  key={val}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                  onClick={() => setAmount(val.toString())}
                  disabled={submitting}
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Deposit Source / Memo (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Salary check, Cash deposit, Tax refund"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={100}
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
            <ShieldCheck size={16} color="var(--success)" />
            <span>Funds are immediately validated and credited server-side.</span>
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
              className="btn btn-success"
              style={{ flex: 2 }}
              disabled={submitting || numAmount <= 0}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  <span>Processing Deposit...</span>
                </>
              ) : (
                <>
                  <ArrowDownCircle size={16} />
                  <span>Deposit ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
