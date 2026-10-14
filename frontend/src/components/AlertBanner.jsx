import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function AlertBanner({ type = 'info', message, onClose, validationErrors }) {
  if (!message && (!validationErrors || Object.keys(validationErrors).length === 0)) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'danger':
      case 'error':
        return <AlertCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const alertClass = type === 'error' ? 'alert-danger' : `alert-${type}`;

  return (
    <div className={`alert ${alertClass}`}>
      <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        {message && <div style={{ fontWeight: 500 }}>{message}</div>}
        {validationErrors && Object.keys(validationErrors).length > 0 && (
          <ul style={{ margin: '6px 0 0 16px', fontSize: '0.84rem' }}>
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}</strong>: {error}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.7,
            display: 'flex',
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
