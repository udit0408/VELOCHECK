'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MaintenanceLog {
  id?: number;
  service_date: string;
  vehicle_number: string;
  service_type: string;
  workshop_name: string;
  tyre_section: string;
  odometer_km?: number;
  cost_inr?: number;
  notes?: string;
}

const defaultLogs: MaintenanceLog[] = [
  {
    id: 1,
    service_date: '2026-09-15',
    vehicle_number: 'UP32 AW 7094',
    service_type: 'Tyre Rotation & Dynamic Balance',
    workshop_name: 'Velocheck Cyber Hub - Hazratganj',
    tyre_section: 'Front & Rear Axles',
    odometer_km: 18450,
    cost_inr: 650,
    notes: 'Rotated front to rear cross pattern, balanced 4 wheels with zinc weights'
  },
  {
    id: 2,
    service_date: '2026-07-20',
    vehicle_number: 'UP32 AW 7094',
    service_type: 'Nitrogen Purge & Bead Seal',
    workshop_name: 'Velocheck Pitstop - Gomti Nagar',
    tyre_section: 'All 4 Tyres',
    odometer_km: 15200,
    cost_inr: 350,
    notes: 'Repaired micro bead slow leak on FL rim. Pressures holding solid at 33 PSI'
  },
  {
    id: 3,
    service_date: '2026-04-10',
    vehicle_number: 'UP32 EV 2026',
    service_type: 'New Radial Replacement',
    workshop_name: 'Velocheck Highway Express - Shaheed Path',
    tyre_section: 'Front Pair (FL + FR)',
    odometer_km: 11300,
    cost_inr: 7800,
    notes: 'Fitted Bridgestone Turanza 195/65 R15 with high-speed laser balancing'
  }
];

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>(defaultLogs);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNumber, setVehicleNumber] = useState('UP32 AW 7094');
  const [serviceType, setServiceType] = useState('Tyre Rotation & Balance');
  const [workshopName, setWorkshopName] = useState('Velocheck Hub - Hazratganj');
  const [tyreSection, setTyreSection] = useState('All 4 Tyres');
  const [odometerKm, setOdometerKm] = useState('19200');
  const [costInr, setCostInr] = useState('600');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/maintenance');
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          setLogs(data.logs);
        }
      }
    } catch {
      // Keep defaults
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: MaintenanceLog = {
      service_date: serviceDate,
      vehicle_number: vehicleNumber.toUpperCase(),
      service_type: serviceType,
      workshop_name: workshopName,
      tyre_section: tyreSection,
      odometer_km: parseInt(odometerKm) || undefined,
      cost_inr: parseFloat(costInr) || undefined,
      notes: notes
    };

    setLogs([newLog, ...logs]);
    setModalOpen(false);

    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch {}
  };

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.vehicle_number.toLowerCase().includes(q) ||
      log.service_type.toLowerCase().includes(q) ||
      log.workshop_name.toLowerCase().includes(q) ||
      log.tyre_section.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="page-head" style={{ marginBottom: '20px' }}>
        <Link href="/" className="back-link" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Tyre &amp; Vehicle Maintenance Logbook</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Authorized Workshop Receipts · Alignment &amp; Dynamic Balancing Records
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setModalOpen(true)}
        >
          ➕ Log Service
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="metric-box">
          <span className="metric-label">Logged Services</span>
          <strong className="metric-value">{logs.length} <span className="metric-unit">Entries</span></strong>
          <span className="metric-note">Lifetime history</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Last Alignment</span>
          <strong className="metric-value">15 Sep <span className="metric-unit">2026</span></strong>
          <span className="metric-note">Hazratganj Bay</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Next Rotation In</span>
          <strong className="metric-value">2,850 <span className="metric-unit">km</span></strong>
          <span className="metric-note">Cross-pattern due</span>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by vehicle plate, service type, or workshop name..."
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '13.5px',
            outline: 'none'
          }}
        />
      </div>

      {/* Logs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLogs.map((log, idx) => (
          <div key={idx} className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <strong style={{ fontSize: '16px', color: '#ffffff' }}>{log.service_type}</strong>
                <div style={{ fontSize: '12px', color: 'var(--signal-cyan)', marginTop: '2px', fontWeight: 600 }}>
                  {log.vehicle_number} · {log.tyre_section}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12.5px', color: '#ffffff', fontWeight: 700 }}>
                  {log.cost_inr ? `₹${log.cost_inr.toLocaleString()}` : 'Free Warranty'}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{log.service_date}</div>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>🏢 {log.workshop_name}</span>
              {log.odometer_km && <span>🛣️ {log.odometer_km.toLocaleString()} km</span>}
            </div>

            {log.notes && (
              <p style={{ marginTop: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '4px', margin: '8px 0 0' }}>
                📝 {log.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* New Log Modal */}
      {modalOpen && (
        <div className="vc-modal-backdrop open" onClick={() => setModalOpen(false)}>
          <div className="vc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="vc-modal-head">
              <div className="vc-modal-title">
                <span>➕</span>
                <span>Log Maintenance Service</span>
              </div>
              <button type="button" className="vc-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="vc-modal-body">
              <form onSubmit={handleAddLog}>
                <div className="token-form-grid">
                  <div className="token-field">
                    <label>Service Date</label>
                    <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} required />
                  </div>
                  <div className="token-field">
                    <label>Vehicle Plate</label>
                    <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} required />
                  </div>
                  <div className="token-field full">
                    <label>Service Type</label>
                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                      <option value="Tyre Rotation & Dynamic Balance">Tyre Rotation &amp; Dynamic Balance</option>
                      <option value="Laser Wheel Alignment">Laser Wheel Alignment</option>
                      <option value="Nitrogen Purge & Seal">Nitrogen Purge &amp; Seal</option>
                      <option value="Puncture Repair (Mushroom Plug)">Puncture Repair (Mushroom Plug)</option>
                      <option value="New Radial Replacement">New Radial Replacement</option>
                    </select>
                  </div>
                  <div className="token-field full">
                    <label>Workshop / Center</label>
                    <input type="text" value={workshopName} onChange={(e) => setWorkshopName(e.target.value)} required />
                  </div>
                  <div className="token-field">
                    <label>Tyre Section</label>
                    <input type="text" value={tyreSection} onChange={(e) => setTyreSection(e.target.value)} required />
                  </div>
                  <div className="token-field">
                    <label>Odometer (km)</label>
                    <input type="number" value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} />
                  </div>
                  <div className="token-field full">
                    <label>Cost (INR)</label>
                    <input type="number" value={costInr} onChange={(e) => setCostInr(e.target.value)} />
                  </div>
                  <div className="token-field full">
                    <label>Work Notes / Observations</label>
                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Balanced with 15g zinc weight, torqued lugs to 110 Nm" />
                  </div>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                    Save Service Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
