import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Send, CheckCircle2, AlertCircle, X, Search, ShieldAlert } from 'lucide-react';

export default function TransferModal({ isOpen, onClose, accounts, onSuccess, initialSourceAcc }) {
  const [sourceAcc, setSourceAcc] = useState('');
  const [targetAcc, setTargetAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      if (initialSourceAcc) {
        setSourceAcc(initialSourceAcc);
      } else {
        setSourceAcc(accounts[0].accountNumber);
      }
    }
  }, [accounts, initialSourceAcc, isOpen]);

  if (!isOpen) return null;

  const currentSelectedAccount = accounts.find((a) => a.accountNumber === sourceAcc);
  const availableBalance = currentSelectedAccount ? parseFloat(currentSelectedAccount.balance) : 0;
  const numAmount = parseFloat(amount) || 0;
  const isOverBalance = numAmount > availableBalance;

  const handleLookupRecipient = async () => {
    if (!targetAcc.trim()) return;
    setLookingUp(true);
    setLookupError('');
    setRecipientInfo(null);
    try {
      const res = await api.lookupRecipient(targetAcc.trim());
      if (res.success && res.data) {
        setRecipientInfo(res.data);
      }
    } catch (err) {
      setLookupError(err.message || 'Recipient account not found');
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sourceAcc) {
      setError('Please select a source account');
      return;
    }
    if (!targetAcc.trim()) {
      setError('Please provide a destination account number');
      return;
    }
    if (sourceAcc.trim().toUpperCase() === targetAcc.trim().toUpperCase()) {
      setError('Source and destination accounts cannot be the same');
      return;
    }
    if (numAmount <= 0) {
      setError('Transfer amount must be greater than $0.00');
      return;
    }
    if (isOverBalance) {
      setError(`Insufficient funds. Your available balance is $${availableBalance.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.transfer({
        sourceAccountNumber: sourceAcc,
        targetAccountNumber: targetAcc.trim(),
        amount: numAmount,
        description: description.trim() || undefined,
      });

      if (res.success && res.data) {
        onSuccess(res.data, 'Transfer completed successfully!');
        handleClose();
      }
    } catch (err) {
      setError(err.message || 'Transfer failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTargetAcc('');
    setAmount('');
    setDescription('');
    setRecipientInfo(null);
    setLookupError('');
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
              <Send size={18} />
            </div>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>Transfer Money</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Instant inter-bank funds transfer
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
          {/* Source Account */}
          <div className="form-group">
            <label className="form-label">Transfer From Account</label>
            <select
              className="form-select"
              value={sourceAcc}
              onChange={(e) => setSourceAcc(e.target.value)}
              disabled={submitting}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountNumber} ({acc.accountType}) — Available: ${parseFloat(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Target Account */}
          <div className="form-group">
            <label className="form-label">Recipient Account Number</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. ACC-30048123"
                value={targetAcc}
                onChange={(e) => {
                  setTargetAcc(e.target.value);
                  setRecipientInfo(null);
                  setLookupError('');
                }}
                disabled={submitting}
                required
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flexShrink: 0, padding: '8px 12px' }}
                onClick={handleLookupRecipient}
                disabled={!targetAcc.trim() || lookingUp || submitting}
              >
                {lookingUp ? <span className="spinner spinner-dark" /> : <Search size={16} />}
                <span>Verify</span>
              </button>
            </div>

            {recipientInfo && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#065f46',
                }}
              >
                <CheckCircle2 size={16} color="#10b981" />
                <span>
                  Recipient verified: <strong>{recipientInfo.ownerName}</strong> ({recipientInfo.accountType})
                </span>
              </div>
            )}

            {lookupError && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldAlert size={16} />
                <span>{lookupError}</span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Transfer Amount (USD)</label>
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

            {/* Quick amount chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {[25, 50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                  onClick={() => setAmount(val.toString())}
                  disabled={submitting || val > availableBalance}
                >
                  +${val}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                onClick={() => setAmount(availableBalance.toFixed(2))}
                disabled={submitting || availableBalance <= 0}
              >
                Full Balance
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Payment Description / Memo (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rent, Freelance payout, Dinner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={100}
            />
          </div>

          {/* Action buttons */}
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
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={submitting || isOverBalance || numAmount <= 0}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
