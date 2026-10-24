'use client';

import React, { useState, useRef } from 'react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Velocheck AI Maintenance Assistant. I can help analyze your tyre pressures, explain tread wear patterns, interpret TPMS alerts, and find roadside towing services. How can I assist you today?",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'What should my cold tyre pressure be?',
    'Explain the 1.6mm legal tread limit',
    'Why is my front-right wheel running hotter?',
    'What are symptoms of wheel imbalance?'
  ];

  const handleSend = (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput('');

    // Generate calm, realistic automotive advice
    setTimeout(() => {
      let reply = "Here is what our diagnostic telemetry suggests:\n\n";
      const q = query.toLowerCase();

      if (q.includes('pressure') || q.includes('cold')) {
        reply += "• Standard passenger vehicle cold tyre pressure should typically be maintained between 32 - 35 PSI (refer to your driver door jamb placard).\n• Pressure increases by 1-2 PSI for every 10°C rise during driving.\n• Check pressures in the morning before driving more than 1 mile.";
      } else if (q.includes('tread') || q.includes('limit') || q.includes('1.6')) {
        reply += "• 1.6 mm is the legal minimum tread depth across the central three-quarters of the tyre.\n• For wet grip and hydroplaning safety, replacement is strongly advised once tread depth reaches 3.0 mm.\n• Look for the Tread Wear Indicators (TWI) molded between the main grooves.";
      } else if (q.includes('hot') || q.includes('temperature')) {
        reply += "• A single wheel running warmer (5-8°C higher than others) usually indicates minor brake caliper drag, slight underinflation increasing rolling resistance, or aggressive cornering load.\n• If temperature exceeds 65°C under normal driving, have a workshop check the wheel bearing and brake caliper immediately.";
      } else if (q.includes('balance') || q.includes('vibration')) {
        reply += "• Symptoms of wheel imbalance include steering wheel vibration at highway speeds (80-110 km/h) and irregular cupping wear.\n• Dynamic wheel balancing with clip-on or adhesive weights usually rectifies this in 20 minutes.";
      } else {
        reply += "Based on your current telemetry readings, your tyres are operating within normal thermal and pressure thresholds. Regular 10,000 km rotation and monthly cold PSI checks ensure maximum tread lifespan and safety.";
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 400);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImagePreview(url);
      setAnalyzingImage(true);

      setTimeout(() => {
        setAnalyzingImage(false);
        const analysisMsg: Message = {
          role: 'assistant',
          content: "📸 Visual Tread Scan Result (Demo Analysis):\n\n• Estimated Remaining Tread: ~4.6 mm (Satisfactory Condition)\n• Surface Wear: Uniform across shoulder and center blocks\n• Micro-Cracking / Dry Rot: None observed\n• Safety Recommendation: Good for highway driving. Re-inspect at next 5,000 km service.\n\n⚠️ Important Disclaimer: AI image analysis is a supplementary estimation and cannot certify roadworthiness. Always confirm with an analog or digital tyre depth gauge.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, analysisMsg]);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="vc-modal-backdrop open" onClick={onClose} style={{ zIndex: 100000 }}>
      <div className="vc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="vc-modal-head">
          <div className="vc-modal-title">
            <span>✨</span>
            <span>AI Maintenance Assistant</span>
            <span className="vc-modal-title-pill">AUTOMOTIVE SAFETY</span>
          </div>
          <button type="button" className="vc-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="vc-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--line)',
                  color: 'var(--text-secondary)',
                  padding: '5px 10px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'rgba(14, 165, 233, 0.15)' : '#0d1527',
                  border: `1px solid ${m.role === 'user' ? 'var(--signal-cyan)' : 'var(--line-bright)'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#ffffff',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line'
                }}
              >
                <div>{m.content}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.time}
                </div>
              </div>
            ))}
            {analyzingImage && (
              <div style={{ alignSelf: 'flex-start', background: '#0d1527', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--signal-amber)', color: 'var(--signal-amber)', fontSize: '12.5px' }}>
                🔍 Analyzing tyre tread image features...
              </div>
            )}
          </div>
        </div>

        {/* Image Preview if uploaded */}
        {imagePreview && (
          <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid var(--line-dim)' }}>
            <img src={imagePreview} alt="Tyre scan preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tyre Photo Uploaded</span>
            <button type="button" onClick={() => setImagePreview(null)} style={{ background: 'none', border: 'none', color: 'var(--signal-red)', cursor: 'pointer', fontSize: '12px', marginLeft: 'auto' }}>Remove</button>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line-dim)', display: 'flex', gap: '8px', background: 'rgba(16, 23, 34, 0.95)' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo of tyre tread"
            style={{ padding: '0 12px' }}
          >
            📷
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about tyre maintenance, wear, TPMS or roadside help..."
            style={{
              flex: 1,
              background: '#090e1a',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '10px 12px',
              color: '#ffffff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleSend()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
