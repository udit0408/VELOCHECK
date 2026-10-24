'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TokenModal, { ServicePass } from '@/components/TokenModal';

interface Driver {
  id: number;
  name: string;
  phone: string;
  rating: string;
  experience: string;
  vehicleType: string;
  trafficStatus: 'fast' | 'moderate' | 'slow';
  trafficDelay: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

const mockDrivers: Driver[] = [
  { id: 1, name: 'Neeraj Yadav', phone: '9456923238', rating: '8/10', experience: 'Experienced and provides a smooth ride', vehicleType: 'Flatbed Tow Truck', trafficStatus: 'fast', trafficDelay: 'Clear Route · 0m delay', lat: 26.861, lng: 80.938, distanceKm: 2.1 },
  { id: 2, name: 'Shivam Shukla', phone: '8965234238', rating: '7.8/10', experience: 'Expert driver for large vehicles & heavy flatbed', vehicleType: 'Heavy Flatbed', trafficStatus: 'moderate', trafficDelay: 'Moderate Flow · +4m delay', lat: 26.825, lng: 80.990, distanceKm: 4.8 },
  { id: 3, name: 'Sameer Khan', phone: '8383629470', rating: '10/10', experience: 'Top rated quick response roadside driver', vehicleType: 'Rapid Wheel Lift', trafficStatus: 'fast', trafficDelay: 'Fast Route · 0m delay', lat: 26.842, lng: 80.912, distanceKm: 1.4 },
  { id: 4, name: 'Ajeet Kumar', phone: '7642989892', rating: '7.5/10', experience: '24/7 night roadside towing & puncture repair', vehicleType: 'Hydraulic Tow Truck', trafficStatus: 'slow', trafficDelay: 'Congestion Delay · +8m', lat: 26.885, lng: 80.965, distanceKm: 6.2 },
  { id: 5, name: 'Raghu', phone: '6969325639', rating: '8/10', experience: 'Heavy vehicle specialist with hydraulic lift', vehicleType: 'Heavy Lift Truck', trafficStatus: 'moderate', trafficDelay: 'Medium Flow · +3m delay', lat: 26.810, lng: 80.930, distanceKm: 5.1 },
];

export default function TowingPage() {
  const [selectedDriver, setSelectedDriver] = useState<Driver>(mockDrivers[2]); // Sameer Khan
  const [trafficLive, setTrafficLive] = useState(true);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [myPassesModalOpen, setMyPassesModalOpen] = useState(false);
  const [initialServiceType, setInitialServiceType] = useState<'TOWING' | 'TYRE_CHECKUP' | 'TYRE_REPLACEMENT'>('TOWING');
  const [savedPasses, setSavedPasses] = useState<ServicePass[]>([]);

  useEffect(() => {
    loadSavedPasses();
  }, []);

  const loadSavedPasses = async () => {
    // Try from local storage
    try {
      const local = JSON.parse(localStorage.getItem('velocheck_passes') || '[]');
      setSavedPasses(local);
    } catch {}

    // Also fetch from API
    try {
      const res = await fetch('/api/passes');
      if (res.ok) {
        const data = await res.json();
        if (data.passes && data.passes.length > 0) {
          setSavedPasses(data.passes);
        }
      }
    } catch {}
  };

  const handleOpenBook = (type: 'TOWING' | 'TYRE_CHECKUP' | 'TYRE_REPLACEMENT') => {
    setInitialServiceType(type);
    setTokenModalOpen(true);
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: '16px' }}>
        <Link href="/" className="back-link" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Roadside Towing &amp; Service Bookings</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Live Towing Fleet Dispatch &amp; Verified Service Bay Passes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOpenBook('TOWING')}>
            🎟️ Book Pass
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { loadSavedPasses(); setMyPassesModalOpen(true); }}>
            📋 My Passes ({savedPasses.length})
          </button>
        </div>
      </div>

      {/* Service Quick Bar */}
      <div className="service-quick-bar">
        <div className="service-quick-card towing" onClick={() => handleOpenBook('TOWING')}>
          <div className="sqc-icon">🚨</div>
          <div className="sqc-body">
            <strong>Emergency Towing Dispatch</strong>
            <span>Live roadside fleet with GPS route &amp; traffic ETA</span>
          </div>
          <button type="button" className="sqc-btn">Dispatch →</button>
        </div>

        <div className="service-quick-card checkup" onClick={() => handleOpenBook('TYRE_CHECKUP')}>
          <div className="sqc-icon">🔍</div>
          <div className="sqc-body">
            <strong>Service Center: Tyre Checkup</strong>
            <span>3D laser tread depth, TPMS &amp; wheel balance</span>
          </div>
          <button type="button" className="sqc-btn">Book Bay →</button>
        </div>

        <div className="service-quick-card replacement" onClick={() => handleOpenBook('TYRE_REPLACEMENT')}>
          <div className="sqc-icon">🔄</div>
          <div className="sqc-body">
            <strong>Service Center: Tyre Replacement</strong>
            <span>Premium radials, high-speed balancing &amp; swap</span>
          </div>
          <button type="button" className="sqc-btn">Reserve Tyres →</button>
        </div>
      </div>

      {/* Tow Layout: Map Panel + Driver Cards */}
      <div className="tow-layout">
        {/* Map Panel */}
        <section className="tow-map-panel" aria-label="Interactive map of nearby towing trucks">
          <div className="tow-map-head">
            <span className="map-api-tag">✓ OpenStreetMap Active</span>
            <button
              className={`btn btn-sm ${trafficLive ? 'btn-traffic-active' : 'btn-outline'}`}
              type="button"
              onClick={() => setTrafficLive(!trafficLive)}
            >
              🚦 Traffic: {trafficLive ? 'LIVE ON' : 'OFF'}
            </button>
          </div>

          {/* Interactive Map Viewport */}
          <div className="tow-map-frame" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090e1a', padding: '16px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px', borderRadius: '8px', background: 'radial-gradient(circle at center, #111a2e 0%, #080c14 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {/* Radar Grid Circles */}
              <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1px dashed rgba(14, 165, 233, 0.2)' }}></div>
              <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(14, 165, 233, 0.15)' }}></div>
              <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(14, 165, 233, 0.3)' }}></div>

              {/* User Center Pulse */}
              <div className="user-marker-wrap" style={{ zIndex: 10 }}>
                <div className="user-marker-pulse"></div>
                <div className="user-marker-dot"></div>
              </div>
              <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700, marginTop: '8px', zIndex: 10 }}>
                You (Hazratganj, Lucknow)
              </span>

              {/* Driver Pin */}
              <div
                style={{
                  position: 'absolute',
                  top: '35%',
                  right: '25%',
                  background: 'var(--signal-amber)',
                  color: '#090e1a',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 0 14px rgba(245, 158, 11, 0.6)',
                  zIndex: 10
                }}
              >
                <span>🚚</span>
                <span>{selectedDriver.name} ({selectedDriver.distanceKm} km)</span>
              </div>
            </div>
          </div>

          {/* Traffic Legend */}
          <div className="traffic-legend">
            <span className="traffic-pill fast"><i className="dot"></i> Fast / Clear</span>
            <span className="traffic-pill moderate"><i className="dot"></i> Moderate (+3-5m)</span>
            <span className="traffic-pill slow"><i className="dot"></i> Heavy Delay (+8m)</span>
          </div>

          <p className="tow-map-readout" role="status">
            Selected driver: <strong>{selectedDriver.name}</strong> · Estimated ETA ~12 mins via Hazratganj Corridor.
          </p>
        </section>

        {/* Driver Cards List */}
        <ul className="tow-list">
          {mockDrivers.map((driver) => {
            const isSelected = selectedDriver.id === driver.id;

            return (
              <li
                key={driver.id}
                className={`tow-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDriver(driver)}
              >
                <div className="tow-top">
                  <div className="tow-avatar-btn">
                    <span>🚚</span>
                  </div>
                  <div>
                    <span className="tow-label">Driver Name:</span>
                    <strong className="tow-name">{driver.name}</strong>
                  </div>
                  <span className="tow-distance">{driver.distanceKm} km</span>
                </div>

                <div className="tow-row">
                  <span className="tow-label">Phone Contact:</span>
                  <a
                    className="tow-phone"
                    href={`tel:${driver.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Call ${driver.name}`}
                  >
                    📞 {driver.phone}
                  </a>
                </div>

                <div className="tow-row">
                  <span className="tow-label">Driver Rating:</span>
                  <div className="tow-rating-line">
                    <span className="tow-rating">{driver.rating}</span>
                    <span className="rating-bar"><i style={{ width: '85%' }}></i></span>
                  </div>
                </div>

                <p className="tow-note">{driver.experience}</p>

                <div className={`tow-traffic-tag ${driver.trafficStatus}`}>
                  {driver.trafficDelay}
                </div>

                <div className="tow-card-actions">
                  <button type="button" className="btn btn-outline tow-select-btn">
                    📍 {isSelected ? 'Selected' : 'View on Map'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm tow-dispatch-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDriver(driver);
                      handleOpenBook('TOWING');
                    }}
                  >
                    ⚡ Book Tow Truck
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Book Token Modal */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        initialServiceType={initialServiceType}
      />

      {/* My Passes Modal */}
      {myPassesModalOpen && (
        <div className="vc-modal-backdrop open" onClick={() => setMyPassesModalOpen(false)} style={{ zIndex: 100000 }}>
          <div className="vc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="vc-modal-head">
              <div className="vc-modal-title">
                <span>📋</span>
                <span>My Active Service Passes</span>
              </div>
              <button type="button" className="vc-modal-close" onClick={() => setMyPassesModalOpen(false)}>✕</button>
            </div>
            <div className="vc-modal-body">
              {savedPasses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  No active booking passes yet. Click "Book Pass" to generate your first digital token.
                </div>
              ) : (
                <div className="my-tokens-list">
                  {savedPasses.map((p) => (
                    <div key={p.token_id} className="token-item-card">
                      <div className="token-item-left">
                        <span className="token-item-code">{p.token_id}</span>
                        <div className="token-item-meta">
                          <strong>{p.vehicle_number} ({p.vehicle_type})</strong> · {p.provider_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--signal-amber)', fontWeight: 600, marginTop: '2px' }}>
                          🔐 PIN: {p.security_pin}
                        </div>
                      </div>
                      <span className="status-pill status-normal" style={{ fontSize: '11px' }}>
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
