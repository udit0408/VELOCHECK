'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'fleet'>('pro');
  const [modalOpen, setModalOpen] = useState(false);

  const handleUpgrade = (plan: 'free' | 'pro' | 'fleet') => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: '20px' }}>
        <Link href="/" className="back-link" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Subscription &amp; Premium Membership</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Priority Roadside Dispatch · Guaranteed Towing SLA · Comprehensive TPMS Telemetry
          </p>
        </div>
      </div>

      <div className="pricing-grid" style={{ marginBottom: '30px' }}>
        {/* Free Plan */}
        <div className="price-card">
          <h3 className="plan-name">Standard Owner</h3>
          <p className="plan-desc">For everyday commuters &amp; single vehicle owners</p>
          <div className="price-tag">₹0 <span>/ lifetime</span></div>
          <ul className="plan-features">
            <li>✓ Real-time 4-wheel pressure &amp; temperature alerts</li>
            <li>✓ Visual tread scanner photo estimate</li>
            <li>✓ Access to roadside towing contacts</li>
            <li>✓ Manual maintenance service logbook</li>
            <li>✕ Guaranteed 15-minute roadside dispatch SLA</li>
            <li>✕ Multi-vehicle garage sync</li>
          </ul>
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '20px' }}
            disabled
          >
            Current Active Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="price-card featured">
          <span className="featured-badge">RECOMMENDED</span>
          <h3 className="plan-name">Pro Roadside &amp; Family</h3>
          <p className="plan-desc">Guaranteed towing rescue and dual vehicle telemetry</p>
          <div className="price-tag">₹199 <span>/ month</span></div>
          <ul className="plan-features">
            <li>✓ Everything in Standard Owner</li>
            <li>✓ Multi-vehicle monitoring (Car + Bike simultaneously)</li>
            <li>✓ Guaranteed 15-minute flatbed towing dispatch</li>
            <li>✓ Unlimited verified digital booking passes</li>
            <li>✓ 2 Complimentary Nitrogen fill vouchers / year</li>
            <li>✓ Priority technical hotline support 24/7</li>
          </ul>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => handleUpgrade('pro')}
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Commercial Fleet */}
        <div className="price-card">
          <h3 className="plan-name">Commercial Fleet</h3>
          <p className="plan-desc">For taxi fleets, cargo trucks, and multi-vehicle operators</p>
          <div className="price-tag">₹999 <span>/ month</span></div>
          <ul className="plan-features">
            <li>✓ Up to 15 vehicles on single dashboard</li>
            <li>✓ ESP32 API webhook telemetry stream</li>
            <li>✓ Fleet tread wear velocity predictions</li>
            <li>✓ Dedicated fleet account manager</li>
            <li>✓ Centralized GST billing &amp; monthly service invoicing</li>
          </ul>
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => handleUpgrade('fleet')}
          >
            Contact Fleet Sales
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {modalOpen && (
        <div className="vc-modal-backdrop open" onClick={() => setModalOpen(false)}>
          <div className="vc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="vc-modal-head">
              <div className="vc-modal-title">
                <span>⭐</span>
                <span>Activate {selectedPlan.toUpperCase()} Plan</span>
              </div>
              <button type="button" className="vc-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="vc-modal-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
              <h3 style={{ margin: '0 0 8px', color: '#ffffff' }}>Velocheck Pro Membership</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px' }}>
                Instant activation enabled for Operator 9140 · Udit Veer Singh. Your vehicles UP32 EV 2026 and UP32 AW 7094 will have priority 24/7 roadside dispatch unlocked.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={() => {
                  alert('Pro membership simulated activation successful!');
                  setModalOpen(false);
                }}
              >
                Confirm Membership (Demo Mode)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
