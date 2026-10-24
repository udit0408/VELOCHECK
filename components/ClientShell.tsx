'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import AIAssistantModal from './AIAssistantModal';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <Navbar onOpenAIAssistant={() => setAiOpen(true)} />
      <main className="vc-page">{children}</main>
      <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      
      {/* Floating Quick AI Button */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50px',
          padding: '12px 20px',
          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s ease'
        }}
      >
        <span>✨</span>
        <span>AI Tyre Scan &amp; Help</span>
      </button>
    </>
  );
}
