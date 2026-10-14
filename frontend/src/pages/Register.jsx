import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, User, Mail, Lock, Phone, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';
import AlertBanner from '../components/AlertBanner';

export default function Register({ onNavigateToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    initialDeposit: '1000.00',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors(null);

    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        initialDeposit: parseFloat(formData.initialDeposit) || 0,
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
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
          maxWidth: '520px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          padding: '36px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            Open Your Banking Account
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Instant digital enrollment with zero paperwork
          </p>
        </div>

        <AlertBanner
          type="danger"
          message={error}
          validationErrors={validationErrors}
          onClose={() => setError('')}
        />

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="e.g. jdoe99"
                value={formData.username}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className="form-input"
                placeholder="+1-555-0100"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Opening Demo Deposit (USD)</label>
              <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 600 }}>
                Demo Welcome Bonus
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.00"
              max="50000.00"
              name="initialDeposit"
              className="form-input mono"
              value={formData.initialDeposit}
              onChange={handleChange}
              disabled={submitting}
            />
            <p className="form-hint">
              This balance is pre-loaded into your primary savings account for instant transaction testing.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already registered? </span>
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-accent)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
