'use client';

import React from 'react';
import Link from 'next/link';

interface NotificationItem {
  id: number;
  type: 'info' | 'warn' | 'crit';
  headline: string;
  meta: string;
  time: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    type: 'info',
    headline: 'ESP32 Wi-Fi Telemetry Synchronized',
    meta: 'All 4 wheel sensors on UP32 EV 2026 reporting baseline thermal stability.',
    time: '2 mins ago'
  },
  {
    id: 2,
    type: 'warn',
    headline: 'Tyre Rotation Advisory (2,850 km remaining)',
    meta: 'Scheduled front-to-rear rotation recommended soon to preserve 6.0mm tread balance.',
    time: 'Yesterday'
  },
  {
    id: 3,
    type: 'crit',
    headline: 'Micro Pressure Drop Alert (Resolved)',
    meta: 'Front-Left tyre experienced 0.8 PSI dip on 20 July. Successfully repaired at Gomti Nagar Pitstop.',
    time: '14 Oct 2026'
  }
];

export default function NotificationPage() {
  return (
    <>
      <div className="page-head" style={{ marginBottom: '20px' }}>
        <Link href="/" className="back-link" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Safety Alerts &amp; Telemetry Feed</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Real-Time Vehicle Notifications · Pressure &amp; Tread Alerts
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <ul className="notif-list">
          {mockNotifications.map((notif) => (
            <li key={notif.id} className={`notif-item ${notif.type}`}>
              <div>
                <div className="headline">{notif.headline}</div>
                <div className="meta">{notif.meta}</div>
              </div>
              <div className="time">{notif.time}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
