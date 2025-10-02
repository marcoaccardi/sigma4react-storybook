import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './App.css'
import '@react-sigma/core/lib/style.css'

// Note: StrictMode is disabled due to a bug in @react-sigma/core
// The SigmaContainer component's useEffect (lines 92-110) lacks a cleanup function
// to call sigma.kill() on unmount, causing WebGL context leaks.
// StrictMode's double-mounting amplifies this issue, creating 2x contexts per render.
// See: node_modules/@react-sigma/core/src/components/SigmaContainer.tsx

createRoot(document.getElementById('root')!).render(
  <App />
)