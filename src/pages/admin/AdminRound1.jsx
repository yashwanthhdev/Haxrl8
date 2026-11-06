import React from 'react';
import { ChevronRight } from 'lucide-react';
import Round1ResultsSection from '../../components/admin/Round1ResultsSection';

export default function AdminRound1() {
  return (
    <>
      {/* Top Navigation */}
      <header
        style={{
          minHeight: 60,
          background: '#ffffff',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px clamp(14px, 3vw, 28px)',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>
            Final Evaluation Leaderboard (Round 1 + Round 2)
          </h1>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Home</span>
            <ChevronRight size={12} />
            <span style={{ color: '#111827' }}>Final Results (R1 + R2)</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'clamp(14px, 3vw, 24px)',
          background: '#F8FAFC'
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Round1ResultsSection />
        </div>
      </div>
    </>
  );
}
