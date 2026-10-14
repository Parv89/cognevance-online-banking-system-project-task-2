import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import DemoDisclaimer from './components/DemoDisclaimer';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import { Landmark, ShieldAlert, Heart } from 'lucide-react';

function BankingApp() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'transactions', 'accounts'

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div className="spinner spinner-dark" style={{ width: '40px', height: '40px' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Initializing ApexVault Secure Core...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <DemoDisclaimer />
        {authView === 'login' ? (
          <Login onNavigateToRegister={() => setAuthView('register')} />
        ) : (
          <Register onNavigateToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DemoDisclaimer />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'transactions' && <TransactionsPage />}
        {activeTab === 'accounts' && <AccountsPage />}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#ffffff',
          padding: '24px 20px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            ApexVault Online Banking Management System
          </p>
          <p>
            Developed as a Java Full Stack Internship Capstone Project. Built with React 18, Vite, Spring Boot 3.3.x, Spring Security, and MySQL 8.
          </p>
          <p style={{ marginTop: '8px', fontSize: '0.76rem', color: '#94a3b8' }}>
            Notice: All accounts, transactions, and banking numbers are entirely fictional for testing purposes. No real funds are stored or transferred.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BankingApp />
    </AuthProvider>
  );
}
