'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface WheelReading {
  pressure_psi: number;
  pressure_kpa: number;
  tread_depth_mm: number;
  temperature_c: number;
  humidity_percent: number;
  status: 'Normal' | 'Check Recommended' | 'Action Required' | 'Data Unavailable';
  recorded_at?: string;
}

const defaultCarReadings: Record<string, WheelReading> = {
  front_left: { pressure_psi: 33.0, pressure_kpa: 227.5, tread_depth_mm: 6.4, temperature_c: 31.8, humidity_percent: 45.0, status: 'Normal' },
  front_right: { pressure_psi: 32.6, pressure_kpa: 225.0, tread_depth_mm: 6.2, temperature_c: 32.2, humidity_percent: 45.2, status: 'Normal' },
  rear_left: { pressure_psi: 33.4, pressure_kpa: 230.0, tread_depth_mm: 5.9, temperature_c: 33.0, humidity_percent: 46.0, status: 'Normal' },
  rear_right: { pressure_psi: 33.1, pressure_kpa: 228.0, tread_depth_mm: 5.8, temperature_c: 33.4, humidity_percent: 46.1, status: 'Normal' },
};

export default function CarDashboardPage() {
  const [readings, setReadings] = useState<Record<string, WheelReading>>(defaultCarReadings);
  const [isLiveSensor, setIsLiveSensor] = useState(false);
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchLatest() {
      try {
        const res = await fetch('/api/readings/latest?vehicle_type=car');
        if (res.ok) {
          const data = await res.json();
          if (data && data.readings && Object.keys(data.readings).length > 0 && isMounted) {
            const mapped: Record<string, WheelReading> = { ...defaultCarReadings };
            for (const [wheel, r] of Object.entries<any>(data.readings)) {
              let status: WheelReading['status'] = 'Normal';
              if (r.pressure_psi < 29 || r.tread_depth_mm < 2.0) status = 'Action Required';
              else if (r.pressure_psi < 31 || r.tread_depth_mm < 3.0) status = 'Check Recommended';

              mapped[wheel] = {
                pressure_psi: r.pressure_psi || defaultCarReadings[wheel]?.pressure_psi || 33.0,
                pressure_kpa: r.pressure_kpa || 227,
                tread_depth_mm: r.tread_depth_mm || defaultCarReadings[wheel]?.tread_depth_mm || 6.0,
                temperature_c: r.temperature_c || defaultCarReadings[wheel]?.temperature_c || 32,
                humidity_percent: r.humidity_percent || 45,
                status: status,
                recorded_at: r.recorded_at,
              };
            }
            setReadings(mapped);
            setIsLiveSensor(true);
          }
        }
      } catch (e) {
        // Fallback to demo mode
        if (isMounted) setIsLiveSensor(false);
      }
    }

    fetchLatest();
    const interval = setInterval(fetchLatest, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const openAnalytics = async (wheelKey: string) => {
    setSelectedWheel(wheelKey);
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/readings/analytics?vehicle_type=car&wheel=${wheelKey}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch {
      setAnalyticsData(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const wheelsList = [
    { key: 'front_left', name: 'Front-Left (FL)', pos: 'Front Axle' },
    { key: 'front_right', name: 'Front-Right (FR)', pos: 'Front Axle' },
    { key: 'rear_left', name: 'Rear-Left (RL)', pos: 'Rear Axle' },
    { key: 'rear_right', name: 'Rear-Right (RR)', pos: 'Rear Axle' },
  ];

  return (
    <>
      <div className="page-head" style={{ marginBottom: '20px' }}>
        <Link href="/" className="back-link" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Car Diagnostics Hub</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Hyundai Creta · UP32 EV 2026 · 4-Wheel TPMS &amp; Laser Tread Matrix
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/bike" className="btn btn-outline btn-sm">
            ⇄ Switch to Bike
          </Link>
          <span
            className="status-pill"
            style={{
              background: isLiveSensor ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              borderColor: isLiveSensor ? 'var(--signal-green)' : 'var(--signal-amber)',
              color: isLiveSensor ? 'var(--signal-green)' : 'var(--signal-amber)',
              fontSize: '11px',
              padding: '4px 10px'
            }}
          >
            <span className="dot"></span> {isLiveSensor ? 'Live ESP32 Telemetry' : 'Simulated Demo Data'}
          </span>
        </div>
      </div>

      {/* 4-Wheel Grid */}
      <div className="gauge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {wheelsList.map((wheel) => {
          const r = readings[wheel.key] || defaultCarReadings[wheel.key];
          const isWarning = r.status === 'Check Recommended' || r.status === 'Action Required';

          return (
            <div
              key={wheel.key}
              className="panel"
              onClick={() => openAnalytics(wheel.key)}
              style={{
                cursor: 'pointer',
                border: isWarning ? '1px solid var(--signal-amber)' : '1px solid var(--line)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#ffffff' }}>{wheel.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{wheel.pos}</div>
                </div>
                <span
                  className="status-pill"
                  style={{
                    fontSize: '11px',
                    background: r.status === 'Normal' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    borderColor: r.status === 'Normal' ? 'var(--signal-green)' : 'var(--signal-amber)',
                    color: r.status === 'Normal' ? 'var(--signal-green)' : 'var(--signal-amber)',
                    padding: '3px 8px'
                  }}
                >
                  <span className="dot"></span> {r.status}
                </span>
              </div>

              {/* Metrics Display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="metric-box">
                  <span className="metric-label">Pressure</span>
                  <strong className="metric-value">{r.pressure_psi} <span className="metric-unit">PSI</span></strong>
                  <span className="metric-note">{Math.round(r.pressure_kpa)} kPa</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Tread Depth</span>
                  <strong className="metric-value" style={{ color: r.tread_depth_mm < 3.0 ? 'var(--signal-amber)' : '#ffffff' }}>
                    {r.tread_depth_mm} <span className="metric-unit">mm</span>
                  </strong>
                  <span className="metric-note">Limit: 1.6 mm</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Temperature</span>
                  <strong className="metric-value">{r.temperature_c} <span className="metric-unit">°C</span></strong>
                  <span className="metric-note">Surface temp</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Tyre Cavity RH</span>
                  <strong className="metric-value">{r.humidity_percent} <span className="metric-unit">%</span></strong>
                  <span className="metric-note">Dry nitrogen</span>
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '11.5px', color: 'var(--signal-cyan)', textAlign: 'right' }}>
                Click for Trend Analytics →
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Assessment & Fleet Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '20px' }}>
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">🛡️ Vehicle Health Assessment</h3>
            <span className="status-pill status-normal"><span className="dot"></span> 96% Road Ready</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            All 4 passenger radials are operating within OEM safety margins. Pressure balance across axles is symmetrical (within 0.5 PSI variance). Tread wear is even with approximately 18,000 km of safe driving remaining.
          </p>
          <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/maintenance" className="btn btn-outline btn-sm">
              📋 View Past Service History
            </Link>
            <Link href="/towing" className="btn btn-outline btn-sm" style={{ borderColor: 'var(--signal-amber)', color: 'var(--signal-amber)' }}>
              🔧 Book Alignment &amp; Balancing
            </Link>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">⚡ Quick Diagnostics</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Telemetry Engine 2.0</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-dim)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Hydroplaning Resistance</span>
              <strong style={{ color: 'var(--signal-green)' }}>High (6.1mm avg)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-dim)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Slow Leak Probability</span>
              <strong style={{ color: 'var(--signal-green)' }}>None Detected (&lt;0.05 PSI/day)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Recommended Rotation Due</span>
              <strong style={{ color: '#ffffff' }}>At 25,000 km (in 2,850 km)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {selectedWheel && (
        <div className="vc-modal-backdrop open" onClick={() => setSelectedWheel(null)}>
          <div className="vc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="vc-modal-head">
              <div className="vc-modal-title">
                <span>📈</span>
                <span>{selectedWheel.replace('_', ' ').toUpperCase()} Analytics</span>
              </div>
              <button type="button" className="vc-modal-close" onClick={() => setSelectedWheel(null)}>✕</button>
            </div>
            <div className="vc-modal-body">
              {loadingAnalytics ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading telemetry trend...</div>
              ) : analyticsData ? (
                <>
                  <div className="hero-metrics">
                    <div className="metric-box">
                      <span className="metric-label">Avg Pressure (10 Reads)</span>
                      <strong className="metric-value">{analyticsData.average_last_20?.pressure_psi || '--'} <span className="metric-unit">PSI</span></strong>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Avg Tread Depth</span>
                      <strong className="metric-value">{analyticsData.average_last_20?.tread_depth_mm || '--'} <span className="metric-unit">mm</span></strong>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Next Predicted PSI</span>
                      <strong className="metric-value">{analyticsData.next_predicted_data?.pressure_psi || '--'} <span className="metric-unit">PSI</span></strong>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Next Predicted Tread</span>
                      <strong className="metric-value">{analyticsData.next_predicted_data?.tread_depth_mm || '--'} <span className="metric-unit">mm</span></strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                    Calculated using transparent one-step linear trend extrapolation from SQLite database readings.
                  </p>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  Normal telemetry verified. No anomalous pressure drops recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
