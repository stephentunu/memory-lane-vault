import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) setError(error.message);
    else setMessage('Check your email to confirm your account!');
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[400px] animate-fadeUp">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-light tracking-[0.14em]" style={{ color: 'var(--gold2)' }}>MEMOIRHUB</h1>
          <p className="font-mono-label text-[8px] tracking-[0.32em] uppercase mt-1" style={{ color: 'var(--muted-text)' }}>PERSONAL MEDIA VAULT</p>
        </div>

        <div className="rounded-vault p-8" style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)' }}>
          <h2 className="font-display text-xl font-light mb-6" style={{ color: 'var(--cream)' }}>Create your vault</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 font-body text-sm outline-none transition-all"
                style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)', color: 'var(--txt)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(200,164,74,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--bdr2)'; e.target.style.boxShadow = 'none'; }}
                required />
            </div>
            <div>
              <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 font-body text-sm outline-none transition-all"
                style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)', color: 'var(--txt)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(200,164,74,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--bdr2)'; e.target.style.boxShadow = 'none'; }}
                required minLength={6} />
            </div>

            {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
            {message && <p className="text-sm" style={{ color: 'var(--success)' }}>{message}</p>}

            <button type="submit" disabled={loading}
              className="w-full rounded-lg py-2.5 font-body text-sm font-medium transition-all hover:-translate-y-px hover:shadow-glow-gold"
              style={{ background: 'var(--gold)', color: '#120e00' }}>
              {loading ? '...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-body text-sm" style={{ color: 'var(--txt2)' }}>
          Already have an account?{' '}
          <Link to="/login" className="transition-colors hover:underline" style={{ color: 'var(--gold)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
