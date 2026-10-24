'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onOpenAIAssistant?: () => void;
}

export default function Navbar({ onOpenAIAssistant }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/car', label: 'Car Hub' },
    { href: '/bike', label: 'Bike Hub' },
    { href: '/towing', label: 'Towing & Rescue' },
    { href: '/maintenance', label: 'Service Logs' },
    { href: '/subscription', label: 'Plans' },
    { href: '/setting', label: 'Settings' },
    { href: '/notification', label: 'Alerts' },
  ];

  return (
    <header className="vc-header">
      <div className="vc-brand">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="mark" aria-hidden="true"></span>
          <div>
            <h1 className="title" style={{ margin: 0 }}>VELOCHECK</h1>
            <p className="tagline" style={{ margin: 0 }}>Fleet Telemetry &amp; Tyre Safety</p>
          </div>
        </Link>
      </div>

      <nav className="desktop-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{
                textDecoration: 'none',
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                borderColor: isActive ? 'var(--signal-cyan)' : 'var(--line)',
                background: isActive ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              {link.label}
            </Link>
          );
        })}

        {onOpenAIAssistant && (
          <button
            type="button"
            onClick={onOpenAIAssistant}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid var(--signal-cyan)',
              color: 'var(--signal-cyan)',
              fontWeight: 700,
              padding: '6px 14px',
              cursor: 'pointer'
            }}
          >
            ✨ AI Assistant
          </button>
        )}
      </nav>

      <div className="vc-header-meta">
        Telemetry Link<br />
        <strong id="espLinkStatus" style={{ color: 'var(--signal-green)' }}>● Online Direct</strong>
      </div>
    </header>
  );
}
