import { useEffect, useState } from 'react';
import api from './api/axios';

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold">TeamFlow</h1>
        <p className="mt-1 text-sm text-slate-400">Day 1 — setup check</p>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
          {error && (
            <p className="text-red-400">API error: {error}</p>
          )}
          {!error && !health && (
            <p className="text-slate-400">Checking API…</p>
          )}
          {health && (
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-slate-400">Status:</span>{' '}
                <span className="text-emerald-400">{health.status}</span>
              </p>
              <p>
                <span className="text-slate-400">Service:</span>{' '}
                {health.service}
              </p>
              <p>
                <span className="text-slate-400">Time:</span>{' '}
                {health.timestamp}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}