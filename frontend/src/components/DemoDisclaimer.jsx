import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function DemoDisclaimer() {
  return (
    <div className="demo-disclaimer-banner">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="badge">DEMO ENVIRONMENT</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} color="#f59e0b" />
          Online Banking Management System — Academic Internship Project. All accounts and funds are strictly simulated.
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.85, fontSize: '0.78rem' }}>
        <ShieldCheck size={14} color="#10b981" />
        <span>Spring Security &amp; JWT Protected</span>
      </div>
    </div>
  );
}
