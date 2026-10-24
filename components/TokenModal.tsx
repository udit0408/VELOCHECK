'use client';

import React, { useState, useEffect } from 'react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceType?: 'TOWING' | 'TYRE_CHECKUP' | 'TYRE_REPLACEMENT';
}

export interface ServicePass {
  token_id: string;
  created_at: string;
  service_type: string;
  vehicle_type: string;
  vehicle_number: string;
  contact_phone: string;
  provider_name: string;
  slot_time: string;
  location: string;
  security_pin: string;
  notes?: string;
  status: string;
}

export default function TokenModal({ isOpen, onClose, initialServiceType = 'TOWING' }: TokenModalProps) {
  const [serviceType, setServiceType] = useState(initialServiceType);
  const [vehicleType, setVehicleType] = useState('Hatchback');
  const [contactPhone, setContactPhone] = useState('9456923238');
  const [vehicleNumber, setVehicleNumber] = useState('UP32 AW 7094');
  const [provider, setProvider] = useState('Sameer Khan (8383629470)');
  const [slotTime, setSlotTime] = useState('Immediate Dispatch (ETA ~12 mins)');
  const [location, setLocation] = useState('Hazratganj, Lucknow (GPS Lock: 26.8467° N, 80.9462° E)');
  const [notes, setNotes] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [activePass, setActivePass] = useState<ServicePass | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateNewTokenId(serviceType);
  }, [serviceType]);

  const generateNewTokenId = (type: string) => {
    const prefix = type === 'TOWING' ? 'TOW' : type === 'TYRE_CHECKUP' ? 'CHK' : 'REP';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${randNum}-LKO`;
    setTokenId(code);
  };

  if (!isOpen) return null;

  const vehicleOptions = ['Bike', 'Heavy Cargo', 'Hatchback', 'Mini SUV', 'SUV'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const newPass: ServicePass = {
      token_id: tokenId,
      created_at: new Date().toISOString(),
      service_type: serviceType,
      vehicle_type: vehicleType,
      vehicle_number: vehicleNumber.toUpperCase(),
      contact_phone: contactPhone,
      provider_name: provider,
      slot_time: slotTime,
      location: location,
      security_pin: pin,
      notes: notes,
      status: 'ACTIVE'
    };

    // Save locally
    try {
      const existing = JSON.parse(localStorage.getItem('velocheck_passes') || '[]');
      localStorage.setItem('velocheck_passes', JSON.stringify([newPass, ...existing]));
    } catch {}

    // Save to backend SQLite API
    try {
      await fetch('/api/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPass)
      });
    } catch (err) {
      console.warn('Backend sync failed, saved in local storage', err);
    }

    setActivePass(newPass);
  };

  const handleCopy = () => {
    if (!activePass) return;
    navigator.clipboard?.writeText(activePass.token_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="vc-modal-backdrop open" onClick={onClose} style={{ zIndex: 100000 }}>
      <div className="vc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="vc-modal-head">
          <div className="vc-modal-title">
            <span>🎫</span>
            <span>Digital Service Pass Generator</span>
            <span className="vc-modal-title-pill">VERIFIED PASS</span>
          </div>
          <button type="button" className="vc-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="vc-modal-body">
          {!activePass ? (
            <>
              {/* Service Tabs */}
              <div className="service-tabs">
                <button
                  type="button"
                  className={`service-tab-btn ${serviceType === 'TOWING' ? 'active' : ''}`}
                  onClick={() => { setServiceType('TOWING'); setProvider('Sameer Khan (8383629470)'); }}
                >
                  🚨 Emergency Towing
                </button>
                <button
                  type="button"
                  className={`service-tab-btn ${serviceType === 'TYRE_CHECKUP' ? 'active' : ''}`}
                  onClick={() => { setServiceType('TYRE_CHECKUP'); setProvider('Velocheck Hub - Hazratganj'); }}
                >
                  🔍 Tyre Checkup
                </button>
                <button
                  type="button"
                  className={`service-tab-btn ${serviceType === 'TYRE_REPLACEMENT' ? 'active' : ''}`}
                  onClick={() => { setServiceType('TYRE_REPLACEMENT'); setProvider('Velocheck Pitstop - Gomti Nagar'); }}
                >
                  🔄 Tyre Replacement
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="token-form-grid">
                  {/* Auto generated banner */}
                  <div className="token-auto-banner full">
                    <div className="auto-banner-info">
                      <span className="auto-banner-label">⚡ APP AUTO-GENERATED TOKEN ID</span>
                      <div className="auto-banner-code">{tokenId}</div>
                      <span className="auto-banner-sub">Unique reservation token generated automatically</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => generateNewTokenId(serviceType)}
                      title="Generate another Token ID"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {/* Vehicle Type selector */}
                  <div className="token-field full">
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Select Vehicle Type *</span>
                      <span style={{ color: 'var(--signal-cyan)' }}>Selected: {vehicleType}</span>
                    </label>
                    <div className="vehicle-type-chips">
                      {vehicleOptions.map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={`vehicle-chip ${vehicleType === v ? 'active' : ''}`}
                          onClick={() => setVehicleType(v)}
                        >
                          {v === 'Bike' ? '🏍️' : v === 'Heavy Cargo' ? '🚛' : '🚗'} {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="token-field">
                    <label>Your Contact No. *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="token-field">
                    <label>Vehicle Plate No. *</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="token-field full">
                    <label>Assigned Provider / Bay</label>
                    <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                      {serviceType === 'TOWING' ? (
                        <>
                          <option value="Sameer Khan (8383629470)">⚡ Sameer Khan · Top Rated (10/10) · Rapid Express ETA ~10m</option>
                          <option value="Neeraj Yadav (9456923238)">Neeraj Yadav · Experienced Flatbed · ETA ~14m</option>
                          <option value="Shivam Shukla (8965234238)">Shivam Shukla · Heavy Vehicle Flatbed · ETA ~16m</option>
                          <option value="Ajeet Kumar (7642989892)">Ajeet Kumar · 24/7 Roadside Assistance · ETA ~18m</option>
                        </>
                      ) : (
                        <>
                          <option value="Velocheck Hub - Hazratganj">🏢 Velocheck Central Hub · Hazratganj (Bay 1)</option>
                          <option value="Velocheck Pitstop - Gomti Nagar">⚡ Velocheck Express Pitstop · Gomti Nagar</option>
                          <option value="Velocheck Diagnostic - Alambagh">🛠️ Velocheck Diagnostic Station · Alambagh</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="token-field full">
                    <label>Service Slot / Dispatch Time</label>
                    <select value={slotTime} onChange={(e) => setSlotTime(e.target.value)}>
                      <option value="Immediate Dispatch (ETA ~12 mins)">🚨 Immediate Emergency Dispatch (Priority 1)</option>
                      <option value="Today Afternoon (2:30 PM - 3:30 PM)">Today Afternoon · 2:30 PM - 3:30 PM</option>
                      <option value="Tomorrow Morning (10:00 AM - 11:00 AM)">Tomorrow Morning · 10:00 AM - 11:00 AM</option>
                    </select>
                  </div>

                  <div className="token-field full">
                    <label>Pickup / Service Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="token-field full">
                    <label>Special Instructions / Notes (Optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Front-left flat tyre, parked near roadside milestone"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                    ⚡ GENERATE SECURE DIGITAL PASS
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Pass Card View */
            <div id="printablePassCard">
              <div className="cyber-pass-card">
                <div className="pass-header">
                  <div className="pass-brand">
                    <span className="mark" style={{ width: '22px', height: '22px', borderRadius: '4px' }}></span>
                    <span className="pass-brand-tag">VELOCHECK PASS</span>
                  </div>
                  <span className="pass-status-pill">
                    <i className="dot"></i> CONFIRMED &amp; ACTIVE
                  </span>
                </div>

                <div className="pass-code-banner">
                  <span className="pass-code-label">OFFICIAL SERVICE TOKEN ID</span>
                  <div className="pass-code-value">{activePass.token_id}</div>
                  <button type="button" className="pass-copy-btn" onClick={handleCopy}>
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>

                <div className="pass-pin-box">
                  <div className="pass-pin-info">
                    <strong>🔐 SECURITY VERIFICATION PIN</strong>
                    <span>Show this 4-digit PIN to driver/technician on arrival</span>
                  </div>
                  <div className="pass-pin-number">{activePass.security_pin}</div>
                </div>

                <div className="pass-barcode-wrap">
                  <div className="pass-barcode" title="Verified Digital Barcode">
                    <div className="pass-laser-line"></div>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
                    SECURE VERIFIED TELEMETRY DISPATCH MATRIX
                  </span>
                </div>

                <div className="pass-details-grid">
                  <div className="pass-detail-item">
                    <span className="k">Service Category</span>
                    <span className="v cyan">{activePass.service_type}</span>
                  </div>
                  <div className="pass-detail-item">
                    <span className="k">Vehicle Type</span>
                    <span className="v" style={{ color: 'var(--signal-cyan)' }}>{activePass.vehicle_type}</span>
                  </div>
                  <div className="pass-detail-item">
                    <span className="k">Vehicle Registration</span>
                    <span className="v">{activePass.vehicle_number}</span>
                  </div>
                  <div className="pass-detail-item">
                    <span className="k">Your Contact</span>
                    <span className="v">{activePass.contact_phone}</span>
                  </div>
                  <div className="pass-detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="k">Assigned Provider</span>
                    <span className="v">{activePass.provider_name}</span>
                  </div>
                  <div className="pass-detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="k">Dispatch Slot</span>
                    <span className="v">{activePass.slot_time}</span>
                  </div>
                  <div className="pass-detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="k">Location</span>
                    <span className="v">{activePass.location}</span>
                  </div>
                </div>
              </div>

              <div className="pass-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.print()}
                  style={{ flex: 1 }}
                >
                  🖨️ Print / Save Pass
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setActivePass(null); generateNewTokenId(serviceType); }}
                >
                  ➕ Book Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
