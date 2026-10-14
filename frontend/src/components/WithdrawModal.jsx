import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ArrowUpCircle, AlertCircle, X } from 'lucide-react';

export default function WithdrawModal({ isOpen, onClose, accounts, onSuccess, initialAccount }) {
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

  const currentSelectedAccount = accounts.find((a) => a.accountNumber === accountNumber);
  const availableBalance = currentSelectedAccount ? parseFloat(currentSelectedAccount.balance) : 0;
  const numAmount = parseFloat(amount) || 0;
  const isOverBalance = numAmount > availableBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accountNumber) {
      setError('Please select an account');
      return;
    }
    if (numAmount <= 0) {
      setError('Withdrawal amount must be greater than $0.00');
      return;
    }
    if (isOverBalance) {
      setError(`Insufficient balance. Maximum available is $${availableBalance.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.withdraw({
        accountNumber,
        amount: numAmount,
        description: description.trim() || 'Demo ATM Cash Withdrawal',
      });

      if (res.success && res.data) {
        onSuccess(res.data, `Successfully withdrew $${numAmount.toFixed(2)}!`);
        handleClose();
      }
    } catch (err) {
      setError(err.message || 'Withdrawal failed');
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
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpCircle size={20} />
            </div>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>Withdraw Funds</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Simulate ATM or branch withdrawal
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
            <label className="form-label">Withdraw From Account</label>
            <select
              className="form-select"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={submitting}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountNumber} ({acc.accountType}) — Available: ${parseFloat(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Withdrawal Amount (USD)</label>
              <span style={{ fontSize: '0.78rem', color: isOverBalance ? 'var(--danger)' : 'var(--text-muted)' }}>
                Max: ${availableBalance.toFixed(2)}
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={availableBalance}
              className={`form-input mono ${isOverBalance ? 'error' : ''}`}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              required
            />

            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {[20, 50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                  onClick={() => setAmount(val.toString())}
                  disabled={submitting || val > availableBalance}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Withdrawal Reason / Note (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cash for groceries, ATM withdrawal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={100}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
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
              className="btn btn-danger"
              style={{ flex: 2 }}
              disabled={submitting || isOverBalance || numAmount <= 0}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  <span>Processing Withdrawal...</span>
                </>
              ) : (
                <>
                  <ArrowUpCircle size={16} />
                  <span>Withdraw ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
