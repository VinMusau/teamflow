import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(
    token ? '' : 'No verification token in the link.'
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    verifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus('success');
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification failed.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        {status === 'verifying' && (
          <p className="text-slate-400">Verifying your email…</p>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold text-emerald-400">
              Email verified
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Your account is now active. You can log in.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Go to login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-red-400">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-slate-400">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block text-sm text-indigo-400 hover:underline"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}