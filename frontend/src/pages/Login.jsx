import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, Lock, User, ArrowRight, ShieldCheck, KeyRound, Check } from 'lucide-react';
import AlertBanner from '../components/AlertBanner';

export default function Login({ onNavigateToRegister }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
    setSubmitting(true);
    try {
      await login(demoUser, demoPass);
    } catch (err) {
      setError(err.message || 'Quick login failed. Ensure backend has initialized sample data.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          padding: '36px 32px',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 14px',
              backgroundColor: '#eff6ff',
              color: 'var(--primary-accent)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Landmark size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
            Apex<span style={{ color: 'var(--primary-accent)' }}>Vault</span> Online
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Secure Corporate &amp; Retail Banking Portal
          </p>
        </div>

        <AlertBanner type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your banking username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                required
                style={{ paddingLeft: '38px' }}
              />
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textTransform: 'uppercase',
            }}
          >
            <KeyRound size={14} color="var(--primary-accent)" />
            <span>Internship Quick Demo Credentials</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px 10px', textAlign: 'left' }}
              onClick={() => handleQuickLogin('john_doe', 'Password@123')}
              disabled={submitting}
            >
              <div>
                <strong>john_doe</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Primary: $5,450</div>
              </div>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px 10px', textAlign: 'left' }}
              onClick={() => handleQuickLogin('jane_smith', 'Password@123')}
              disabled={submitting}
            >
              <div>
                <strong>jane_smith</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Primary: $3,800</div>
              </div>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>New to ApexVault? </span>
          <button
            onClick={onNavigateToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-accent)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Open an Account
          </button>
        </div>
      </div>
    </div>
  );
}
