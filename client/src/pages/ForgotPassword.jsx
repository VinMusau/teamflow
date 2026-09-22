import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-xl font-bold text-slate-100">Check your email</h1>
          <p className="mt-2 text-sm text-slate-400">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link. It expires in 1 hour.
          </p>
          <Link to="/login" className="mt-6 inline-block text-sm text-indigo-400 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-xl font-bold text-slate-100">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="mt-6 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>

        <Link to="/login" className="mt-4 block text-center text-sm text-indigo-400 hover:underline">
          Back to login
        </Link>
      </form>
    </div>
  );
}