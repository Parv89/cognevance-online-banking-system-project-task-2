import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, LayoutDashboard, History, CreditCard, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="#" className="brand" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
          <div className="brand-icon">
            <Landmark size={20} />
          </div>
          <div>
            <span>Apex</span>
            <span style={{ color: 'var(--primary-accent)' }}>Vault</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
              ONLINE BANKING
            </span>
          </div>
        </a>

        <div className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <History size={18} />
            <span>Transactions</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <CreditCard size={18} />
            <span>Accounts</span>
          </button>

          <div className="user-badge">
            <div className="user-avatar" title={user?.fullName || user?.username}>
              {getInitials(user?.fullName || user?.username)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.fullName || user?.username}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                @{user?.username}
              </span>
            </div>

            <button
              onClick={logout}
              className="nav-btn"
              style={{ color: 'var(--danger)', marginLeft: '8px' }}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
