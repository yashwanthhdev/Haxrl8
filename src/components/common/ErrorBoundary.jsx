import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Uncaught Boundary Error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('haxlr8_leader_confirmed');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fffaf3',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          padding: 24,
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: 460,
            width: '100%',
            background: '#ffffff',
            borderRadius: 24,
            padding: '36px 28px',
            border: '2px solid #fed7aa',
            boxShadow: '0 12px 36px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
              Flight Telemetry Re-sync
            </h2>
            <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: '0 0 24px' }}>
              A new version of the flight deck is available or your session requires re-synchronization. Click below to refresh your flight controls.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                Refresh Flight Deck ↻
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/login'; }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Go to Commander Login →
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
