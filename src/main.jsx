import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import './index.css'

// Global recovery for stale chunk hashes after Vite deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[HAXLR8] New deployment detected, reloading page for fresh bundles...', event);
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
