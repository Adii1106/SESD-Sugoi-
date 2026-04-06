import React, { useState } from 'react';

export default function Auth({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Leveraging Vite proxy
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Authentication failed');

      onLogin(data.token || '', data.user || data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div className="surface-card" style={{ width: '400px', maxWidth: '90%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>SugoiTickets</h2>
        {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          )}
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" className="btn-primary">{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: 'var(--primary-color)' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px', 
  borderRadius: '8px', 
  border: '1px solid rgba(134,134,139,0.3)', 
  background: 'transparent', 
  color: 'var(--text-main)', 
  fontSize: '15px'
};
