'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface WheelReading {
  pressure_psi: number;
  pressure_kpa: number;
  tread_depth_mm: number;
  temperature_c: number;
  humidity_percent: number;
  status: 'Normal' | 'Check Recommended' | 'Action Required';
}

const defaultBikeReadings: Record<string, WheelReading> = {
  front: { pressure_psi: 32.0, pressure_kpa: 220.6, tread_depth_mm: 5.2, temperature_c: 32.4, humidity_percent: 48.0, status: 'Normal' },
  rear: { pressure_psi: 34.0, pressure_kpa: 234.4, tread_depth_mm: 4.8, temperature_c: 34.1, humidity_percent: 47.5, status: 'Normal' },
};

export default function BikeDashboardPage() {
  const [readings, setReadings] = useState<Record<string, WheelReading>>(defaultBikeReadings);
  const [isLiveSensor, setIsLiveSensor] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchLatest() {
      try {
        const res = await fetch('/api/readings/latest?vehicle_type=bike');
        if (res.ok) {
          const data = await res.json();
          if (data && data.readings && Object.keys(data.readings).length > 0 && isMounted) {
            const mapped: Record<string, WheelReading> = { ...defaultBikeReadings };
            for (const [wheel, r] of Object.entries<any>(data.readings)) {
              let status: WheelReading['status'] = 'Normal';
              if (r.pressure_psi < 28 || r.tread_depth_mm < 1.8) status = 'Action Required';
              else if (r.pressure_psi < 30 || r.tread_depth_mm < 2.5) status = 'Check Recommended';

              mapped[wheel] = {
                pressure_psi: r.pressure_psi || defaultBikeReadings[wheel]?.pressure_psi || 32.0,
                pressure_kpa: r.pressure_kpa || 220,
                tread_depth_mm: r.tread_depth_mm || defaultBikeReadings[wheel]?.tread_depth_mm || 5.0,
                temperature_c: r.temperature_c || defaultBikeReadings[wheel]?.temperature_c || 33,
                humidity_percent: r.humidity_percent || 48,
                status: status,
              };
            }
            setReadings(mapped);
            setIsLiveSensor(true);
          }
        }
      } catch (e) {
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

  const wheelsList = [
    { key: 'front', name: 'Front Wheel', icon: '🏍️' },
    { key: 'rear', name: 'Rear Wheel', icon: '🏍️' },
  ];

  return (
    <>
      <div className="page-head" style={{ marginBottom: '20px' }}>
        <Link href="/" className="back-link" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Two-Wheeler Telemetry Hub</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Royal Enfield Classic 350 · UP32 AW 7094 · Dual-Channel TPMS Matrix
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/car" className="btn btn-outline btn-sm">
            ⇄ Switch to Car
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

      {/* 2-Wheel Grid */}
      <div className="gauge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {wheelsList.map((wheel) => {
          const r = readings[wheel.key] || defaultBikeReadings[wheel.key];

          return (
            <div key={wheel.key} className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{wheel.icon}</span>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#ffffff' }}>{wheel.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Tube-type Spoke Rim</div>
                  </div>
                </div>
                <span className="status-pill status-normal">
                  <span className="dot"></span> {r.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="metric-box">
                  <span className="metric-label">Pressure</span>
                  <strong className="metric-value">{r.pressure_psi} <span className="metric-unit">PSI</span></strong>
                  <span className="metric-note">{Math.round(r.pressure_kpa)} kPa</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Tread Depth</span>
                  <strong className="metric-value">{r.tread_depth_mm} <span className="metric-unit">mm</span></strong>
                  <span className="metric-note">Legal Limit: 1.6 mm</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Temperature</span>
                  <strong className="metric-value">{r.temperature_c} <span className="metric-unit">°C</span></strong>
                  <span className="metric-note">Ambient: 28°C</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Air Humidity</span>
                  <strong className="metric-value">{r.humidity_percent} <span className="metric-unit">%</span></strong>
                  <span className="metric-note">Normal Moisture</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bike Specific Safety Notes */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <h3 className="panel-title" style={{ marginBottom: '8px' }}>🏍️ Motorcycle Dynamic Safety Notice</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
          Unlike cars, motorcycle tyre pressure directly dictates lean angle stability, contact patch radius, and turn-in precision. Front wheel pressure at 32 PSI ensures responsive counter-steering, while rear pressure at 34 PSI prevents high-speed wallowing under pillion or luggage loads.
        </p>
      </div>
    </>
  );
}
