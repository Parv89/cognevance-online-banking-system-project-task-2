import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AccountCard from '../components/AccountCard';
import TransferModal from '../components/TransferModal';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import NewAccountModal from '../components/NewAccountModal';
import TransactionReceiptModal from '../components/TransactionReceiptModal';
import AlertBanner from '../components/AlertBanner';
import {
  Send,
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Receipt,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [transferOpen, setTransferOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getDashboardSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleTransactionSuccess = (transaction, message) => {
    setSuccessMessage(message);
    setSelectedReceiptTxn(transaction);
    setReceiptOpen(true);
    fetchSummary();
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amt || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !summary) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner spinner-dark" style={{ width: '36px', height: '36px' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading your financial overview...</p>
      </div>
    );
  }

  const accounts = summary?.accounts || [];
  const activeAccount = accounts[activeAccountIndex] || accounts[0] || null;

  return (
    <div>
      {/* Welcome header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome back, {summary?.fullName || user?.fullName || 'Valued Customer'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Here is your live financial snapshot and available liquidity.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={fetchSummary}
          disabled={loading}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner spinner-dark' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      <AlertBanner
        type="success"
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />

      {error && (
        <AlertBanner
          type="danger"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Main Grid: Card & Stats */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Left Column: Account Card Presentation */}
        <div>
          {accounts.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '10px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              {accounts.map((acc, idx) => (
                <button
                  key={acc.id}
                  onClick={() => setActiveAccountIndex(idx)}
                  className={`btn ${idx === activeAccountIndex ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
                >
                  {acc.accountType} ({acc.accountNumber.slice(-4)})
                </button>
              ))}
            </div>
          )}

          <AccountCard account={activeAccount} />

          {/* Quick Actions Grid */}
          <div className="action-grid">
            <button className="action-btn" onClick={() => setTransferOpen(true)}>
              <div className="action-icon-wrap" style={{ backgroundColor: '#eff6ff', color: 'var(--primary-accent)' }}>
                <Send size={20} />
              </div>
              <span>Transfer</span>
            </button>

            <button className="action-btn" onClick={() => setDepositOpen(true)}>
              <div className="action-icon-wrap" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                <ArrowDownCircle size={20} />
              </div>
              <span>Deposit</span>
            </button>

            <button className="action-btn" onClick={() => setWithdrawOpen(true)}>
              <div className="action-icon-wrap" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <ArrowUpCircle size={20} />
              </div>
              <span>Withdraw</span>
            </button>

            <button className="action-btn" onClick={() => setNewAccountOpen(true)}>
              <div className="action-icon-wrap" style={{ backgroundColor: '#f5f3ff', color: 'var(--secondary)' }}>
                <PlusCircle size={20} />
              </div>
              <span>New Account</span>
            </button>
          </div>
        </div>

        {/* Right Column: Key Financial Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Combined Balance
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {formatCurrency(summary?.totalBalance)}
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#eff6ff',
                  color: 'var(--primary-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={24} />
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Across <strong>{summary?.totalAccounts || 1}</strong> active bank accounts
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Total Inflow / Deposits */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--success-bg)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowDownLeft size={18} />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Credited</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                {formatCurrency(summary?.monthlyDeposits)}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deposits &amp; Credits</span>
            </div>

            {/* Total Outflow / Debits */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowUpRight size={18} />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Debited</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>
                {formatCurrency(summary?.monthlyWithdrawals)}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Withdrawals &amp; Outflows</span>
            </div>
          </div>

          {/* Transfer Summary */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="var(--primary-accent)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Funds Transferred</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inter-account wire and P2P</div>
              </div>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {formatCurrency(summary?.monthlyTransfers)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Transactions</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live transaction records and audit ledger
            </p>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            onClick={() => setActiveTab('transactions')}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((txn) => {
                  const isCredit = txn.type === 'DEPOSIT' || (txn.type === 'TRANSFER' && txn.targetAccountNumber === activeAccount?.accountNumber);
                  return (
                    <tr key={txn.id}>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="mono" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {txn.transactionReference}
                      </td>
                      <td>
                        <span className={`badge-tag ${txn.type.toLowerCase()}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {txn.description || 'Banking Transaction'}
                      </td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: isCredit ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                          {txn.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedReceiptTxn(txn);
                            setReceiptOpen(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-accent)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                          }}
                          title="View receipt"
                        >
                          <Receipt size={14} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Receipt size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <p>No transactions found for this account yet.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '12px', fontSize: '0.85rem' }}
              onClick={() => setDepositOpen(true)}
            >
              Make Your First Deposit
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        accounts={accounts}
        initialSourceAcc={activeAccount?.accountNumber}
        onSuccess={handleTransactionSuccess}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        accounts={accounts}
        initialAccount={activeAccount?.accountNumber}
        onSuccess={handleTransactionSuccess}
      />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        accounts={accounts}
        initialAccount={activeAccount?.accountNumber}
        onSuccess={handleTransactionSuccess}
      />

      <NewAccountModal
        isOpen={newAccountOpen}
        onClose={() => setNewAccountOpen(false)}
        onSuccess={(acc, msg) => {
          setSuccessMessage(msg);
          fetchSummary();
        }}
      />

      <TransactionReceiptModal
        isOpen={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setSelectedReceiptTxn(null);
        }}
        transaction={selectedReceiptTxn}
      />
    </div>
  );
}
