'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SettingPage() {
  const [operatorName, setOperatorName] = useState('Udit Veer Singh');
  const [operatorId, setOperatorId] = useState('9140');
  const [primaryPhone, setPrimaryPhone] = useState('+91 9456923238');
  const [emergencyContact, setEmergencyContact] = useState('+91 8383629470');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: '20px' }}>
        <Link href="/" className="back-link" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Operator &amp; Telemetry Settings</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Hardware Link Configuration · Vehicle Registration · Emergency Rescue Profiles
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <form onSubmit={handleSave} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="panel-title" style={{ borderBottom: '1px solid var(--line-dim)', paddingBottom: '10px' }}>
            👤 Operator Profile
          </h3>

          <div className="token-form-grid">
            <div className="token-field">
              <label>Operator Name</label>
              <input type="text" value={operatorName} onChange={(e) => setOperatorName(e.target.value)} required />
            </div>
            <div className="token-field">
              <label>Operator Badge ID</label>
              <input type="text" value={operatorId} onChange={(e) => setOperatorId(e.target.value)} required />
            </div>
            <div className="token-field">
              <label>Primary Contact Phone</label>
              <input type="tel" value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} required />
            </div>
            <div className="token-field">
              <label>Roadside SOS Emergency Contact</label>
              <input type="tel" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} required />
            </div>
          </div>

          <h3 className="panel-title" style={{ borderBottom: '1px solid var(--line-dim)', paddingBottom: '10px', marginTop: '12px' }}>
            📡 Telemetry Connection
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div>
              <strong style={{ fontSize: '14px', color: '#ffffff' }}>Auto-Poll ESP32 Telemetry</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Automatically refresh sensor readings every 4 seconds</div>
            </div>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--signal-cyan)' }}
            />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              Save Preferences
            </button>
            {saved && (
              <span style={{ color: 'var(--signal-green)', fontSize: '13px', fontWeight: 600 }}>
                ✓ Settings saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
