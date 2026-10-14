import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import AccountCard from '../components/AccountCard';
import TransferModal from '../components/TransferModal';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import NewAccountModal from '../components/NewAccountModal';
import AlertBanner from '../components/AlertBanner';
import { CreditCard, PlusCircle, Send, ArrowDownCircle, ArrowUpCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [newAccountOpen, setNewAccountOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAccounts();
      if (res.success && res.data) {
        setAccounts(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAction = (type, accNum) => {
    setSelectedAcc(accNum);
    if (type === 'transfer') setTransferOpen(true);
    if (type === 'deposit') setDepositOpen(true);
    if (type === 'withdraw') setWithdrawOpen(true);
  };

  const handleSuccess = (data, msg) => {
    setSuccessMessage(msg);
    fetchAccounts();
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amt || 0);
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);

  return (
    <div>
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
            Account Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            View and manage your demand deposit, savings, and commercial accounts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setNewAccountOpen(true)}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <PlusCircle size={16} />
            <span>Open New Account</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={fetchAccounts}
            disabled={loading}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <RefreshCw size={14} className={loading ? 'spinner spinner-dark' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      <AlertBanner type="danger" message={error} onClose={() => setError('')} />

      {/* Aggregate Balance Callout */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Liquidity Across All Accounts
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {formatCurrency(totalBalance)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span>FDIC Mock Insurance Coverage Active (Demo)</span>
        </div>
      </div>

      {/* Accounts Grid */}
      {loading && accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner spinner-dark" />
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Loading accounts...</p>
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid-2">
          {accounts.map((account) => (
            <div key={account.id} className="card" style={{ padding: '20px' }}>
              <AccountCard account={account} />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginTop: '16px',
                }}
              >
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '8px' }}
                  onClick={() => handleAction('transfer', account.accountNumber)}
                >
                  <Send size={14} />
                  <span>Transfer</span>
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '8px' }}
                  onClick={() => handleAction('deposit', account.accountNumber)}
                >
                  <ArrowDownCircle size={14} color="var(--success)" />
                  <span>Deposit</span>
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '8px' }}
                  onClick={() => handleAction('withdraw', account.accountNumber)}
                >
                  <ArrowUpCircle size={14} color="var(--danger)" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <CreditCard size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No Accounts Registered</h3>
          <p style={{ fontSize: '0.88rem' }}>Create your first checking or savings account to start banking.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => setNewAccountOpen(true)}
          >
            Open New Account
          </button>
        </div>
      )}

      {/* Modals */}
      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        accounts={accounts}
        initialSourceAcc={selectedAcc}
        onSuccess={handleSuccess}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        accounts={accounts}
        initialAccount={selectedAcc}
        onSuccess={handleSuccess}
      />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        accounts={accounts}
        initialAccount={selectedAcc}
        onSuccess={handleSuccess}
      />

      <NewAccountModal
        isOpen={newAccountOpen}
        onClose={() => setNewAccountOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
