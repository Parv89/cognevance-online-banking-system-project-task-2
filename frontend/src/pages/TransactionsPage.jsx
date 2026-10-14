import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import TransactionReceiptModal from '../components/TransactionReceiptModal';
import AlertBanner from '../components/AlertBanner';
import { History, Search, Filter, Receipt, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fetchTransactions = async (pageNum = 0, currentType = typeFilter) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getTransactions({
        type: currentType,
        page: pageNum,
        size: 15,
      });

      if (res.success && res.data) {
        setTransactions(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
        setPage(res.data.number || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(0, typeFilter);
  }, [typeFilter]);

  const handleFilterChange = (newType) => {
    setTypeFilter(newType);
    setPage(0);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      fetchTransactions(page + 1, typeFilter);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      fetchTransactions(page - 1, typeFilter);
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amt || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter in-memory by search term
  const filteredList = transactions.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.transactionReference?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.sourceAccountNumber?.toLowerCase().includes(term) ||
      t.targetAccountNumber?.toLowerCase().includes(term)
    );
  });

  const exportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = ['Reference,Date,Type,Amount,Status,Source,Destination,Description'];
    const rows = filteredList.map((t) =>
      `"${t.transactionReference}","${t.createdAt}","${t.type}","${t.amount}","${t.status}","${t.sourceAccountNumber}","${t.targetAccountNumber}","${t.description || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexvault_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Transaction History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Comprehensive immutable transaction ledger and account auditing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={exportCSV}
            disabled={filteredList.length === 0}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => fetchTransactions(page, typeFilter)}
            disabled={loading}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <RefreshCw size={14} className={loading ? 'spinner spinner-dark' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />

      <div className="card">
        {/* Controls: Type filters & Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`btn ${typeFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search reference or memo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.88rem' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)',
              }}
            />
          </div>
        </div>

        {/* Transactions Table */}
        {loading && transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner spinner-dark" />
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Fetching transactions...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Source Account</th>
                    <th>Destination Account</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((txn) => {
                    const isCredit = txn.type === 'DEPOSIT';
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
                        <td className="mono" style={{ fontSize: '0.84rem' }}>
                          {txn.sourceAccountNumber}
                        </td>
                        <td className="mono" style={{ fontSize: '0.84rem' }}>
                          {txn.targetAccountNumber}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: isCredit ? 'var(--success)' : 'var(--danger)',
                          }}
                        >
                          {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {txn.balanceAfter ? formatCurrency(txn.balanceAfter) : '—'}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                            {txn.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedTxn(txn);
                              setReceiptOpen(true);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
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

            {/* Pagination footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>
                Showing <strong>{filteredList.length}</strong> of <strong>{totalElements}</strong> transactions
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px' }}
                  onClick={handlePrevPage}
                  disabled={page === 0 || loading}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px' }}
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1 || loading}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <History size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>No Transactions Found</h3>
            <p style={{ fontSize: '0.88rem' }}>
              {searchTerm ? 'No results matched your search criteria.' : 'No transactions recorded under this filter.'}
            </p>
          </div>
        )}
      </div>

      <TransactionReceiptModal
        isOpen={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setSelectedTxn(null);
        }}
        transaction={selectedTxn}
      />
    </div>
  );
}
