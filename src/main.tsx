import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
function App() {
  const [status, setStatus] = useState('Checking...');
  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setStatus(d.status))
      .catch(() => setStatus('Backend offline'));
  }, []);
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 720, margin: '5rem auto', padding: 20 }}>
      <h1>DTRPS Admin</h1>
      <p>Admin dashboard starter</p>
      <p>
        Backend: <strong>{status}</strong>
      </p>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
