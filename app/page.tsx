import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            <span className="badge-dot"></span> Certified Vehicle Telemetry &amp; Roadside Platform
          </span>
          <h1 className="hero-title">
            Drive Safer. <br />
            <span>Stay Road-Ready.</span>
          </h1>
          <p className="hero-subtitle">
            Monitor real-time tyre pressure and tread wear, predict maintenance before failures occur, and access trusted towing and workshop services in seconds.
          </p>
          <div className="hero-actions">
            <Link href="/car" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
              🚗 Open Car Dashboard
            </Link>
            <Link href="/bike" className="btn btn-outline" style={{ padding: '12px 24px', fontSize: '14px' }}>
              🏍️ Bike Dashboard
            </Link>
            <Link href="/towing" className="btn btn-outline" style={{ padding: '12px 24px', fontSize: '14px', borderColor: 'var(--signal-amber)', color: 'var(--signal-amber)' }}>
              🚨 Emergency Towing
            </Link>
          </div>
        </div>

        {/* Maintenance Summary Card beside Hero */}
        <div className="hero-card">
          <div className="hero-card-header">
            <div>
              <span className="card-label">Active Monitored Vehicle</span>
              <strong className="card-title">Hyundai Creta · UP32 EV 2026</strong>
            </div>
            <span className="status-pill status-normal">
              <span className="dot"></span> Normal
            </span>
          </div>

          <div className="hero-metrics">
            <div className="metric-box">
              <span className="metric-label">Average Pressure</span>
              <strong className="metric-value">33.2 <span className="metric-unit">PSI</span></strong>
              <span className="metric-note">Cold Target: 33 PSI</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Min Tread Depth</span>
              <strong className="metric-value">5.8 <span className="metric-unit">mm</span></strong>
              <span className="metric-note">Legal Limit: 1.6 mm</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Tyre Operating Temp</span>
              <strong className="metric-value">32.4 <span className="metric-unit">°C</span></strong>
              <span className="metric-note">Optimal range</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Next Service Due</span>
              <strong className="metric-value">2,850 <span className="metric-unit">km</span></strong>
              <span className="metric-note">Tyre Rotation Bay</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live ESP32 telemetry synchronized</span>
            <Link href="/car" style={{ fontSize: '12.5px', color: 'var(--signal-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Full 4-Wheel Diagnostics →
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section style={{ margin: '36px 0' }}>
        <h2 className="section-title">How Velocheck Works</h2>
        <p className="section-subtitle">A seamless system designed for everyday safety and preventative maintenance</p>
        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Direct Telemetry Ingest</h3>
            <p>ESP32 Bluetooth and Wi-Fi sensors capture tyre pressure, temperature, and tread clearance continuously while driving.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Predictive Analysis</h3>
            <p>Calculates linear tread wear velocity, alerts to slow micro-leaks, and evaluates thermal load across individual wheels.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Verified Roadside Assistance</h3>
            <p>Instant digital pass generation for certified roadside flatbed towing trucks and authorized tyre replacement pitstops.</p>
          </div>
        </div>
      </section>

      {/* Core Feature Grid */}
      <section style={{ margin: '36px 0' }}>
        <h2 className="section-title">Comprehensive Vehicle Protection</h2>
        <p className="section-subtitle">Everything you need to keep your tyres healthy and avoid roadside breakdowns</p>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Real-Time TPMS Monitoring</h3>
            <p>Precise individual wheel pressure sensing in PSI and kPa with instant threshold alerts before blowouts happen.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Laser Tread Depth Diagnostics</h3>
            <p>Track millimeter wear against the 1.6mm legal benchmark and plan replacement before rainy season hydroplaning risks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚨</div>
            <h3>Emergency Roadside Towing</h3>
            <p>Direct dispatch with live traffic delay routing and verified 4-digit PIN security passes for roadside safety.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Permanent Service History</h3>
            <p>Keep a digital logbook of tyre rotations, wheel balances, alignments, and punctures for higher resale value.</p>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section style={{ margin: '36px 0' }}>
        <h2 className="section-title">Transparent Plans for Every Driver</h2>
        <p className="section-subtitle">Choose the level of protection that fits your driving habits</p>
        <div className="pricing-grid">
          <div className="price-card">
            <h3 className="plan-name">Standard Owner</h3>
            <p className="plan-desc">For individual daily drivers and commuters</p>
            <div className="price-tag">₹0 <span>/ forever</span></div>
            <ul className="plan-features">
              <li>✓ Real-time 4-wheel pressure &amp; temperature</li>
              <li>✓ Visual tread depth scan simulation</li>
              <li>✓ Towing directory with direct contact</li>
              <li>✓ Manual maintenance service logbook</li>
            </ul>
            <Link href="/car" className="btn btn-outline" style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}>
              Get Started Free
            </Link>
          </div>

          <div className="price-card featured">
            <span className="featured-badge">MOST POPULAR</span>
            <h3 className="plan-name">Pro Roadside &amp; Family</h3>
            <p className="plan-desc">Complete peace of mind with guaranteed roadside dispatch</p>
            <div className="price-tag">₹199 <span>/ month</span></div>
            <ul className="plan-features">
              <li>✓ Everything in Standard Owner</li>
              <li>✓ Multi-vehicle monitoring (Car + Bike)</li>
              <li>✓ Unlimited Digital Service Booking Passes</li>
              <li>✓ Priority Flatbed Towing Dispatch (0-wait)</li>
              <li>✓ Complimentary Nitrogen Purge &amp; Dynamic Balance voucher</li>
            </ul>
            <Link href="/subscription" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}>
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
