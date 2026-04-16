import React, { useState } from 'react';
import { Ticket, ShieldCheck, Zap, ArrowRight, ArrowRightLeft, X } from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
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
    } finally {
      setLoading(false);
    }
  };

  if (!showAuthForm) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-body">
        {/* Navbar */}
        <header className="px-8 py-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-accent-1 rounded-lg flex items-center justify-center">
              <Ticket className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-wider">
              Sugoi<span className="text-accent-2">Tickets</span>
            </h1>
          </div>
          <nav className="flex gap-6 items-center">
            <button onClick={() => { setIsLogin(true); setShowAuthForm(true); }} className="text-white/80 hover:text-white font-medium transition-colors">Sign In</button>
            <button onClick={() => { setIsLogin(false); setShowAuthForm(true); }} className="bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">Get Started</button>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-1/10 text-accent-1 border border-accent-1/20 font-medium mb-8">
            <SparklesIcon size={16} /> The Next Generation of Ticketing
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Secure, Seamless, &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-1 via-accent-5 to-accent-2">
              Verifiable Tickets.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12">
            Buy, manage, and securely transfer your event tickets all in one place. Built for speed, security, and a flawless user experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => { setIsLogin(false); setShowAuthForm(true); }} className="bg-gradient-to-r from-accent-1 to-accent-2 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,58,242,0.3)]">
              Start Booking Now <ArrowRight size={20} />
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
            <div className="bg-[#151520] p-8 rounded-2xl border border-white/5 hover:border-accent-1/50 transition-colors">
              <div className="h-12 w-12 bg-accent-1/20 text-accent-1 rounded-xl flex items-center justify-center mb-6"><Ticket size={24} /></div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-white/60 leading-relaxed">Secure your spot at the hottest events instantly with our high-performance booking engine.</p>
            </div>
            <div className="bg-[#151520] p-8 rounded-2xl border border-white/5 hover:border-accent-2/50 transition-colors">
              <div className="h-12 w-12 bg-accent-2/20 text-accent-2 rounded-xl flex items-center justify-center mb-6"><ArrowRightLeft size={24} /></div>
              <h3 className="text-xl font-bold mb-3">Secure Transfers</h3>
              <p className="text-white/60 leading-relaxed">Transfer tickets to friends safely. Our system ensures tickets are verified and authentic.</p>
            </div>
            <div className="bg-[#151520] p-8 rounded-2xl border border-white/5 hover:border-accent-3/50 transition-colors">
              <div className="h-12 w-12 bg-accent-3/20 text-accent-3 rounded-xl flex items-center justify-center mb-6"><ShieldCheck size={24} /></div>
              <h3 className="text-xl font-bold mb-3">Fraud Protection</h3>
              <p className="text-white/60 leading-relaxed">No more fake tickets. Every transfer is logged and authorized by the recipient.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative px-4 font-body">
      <button 
        onClick={() => setShowAuthForm(false)} 
        className="absolute top-8 left-8 text-white/50 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowRight className="rotate-180" size={20} /> Back to Home
      </button>

      <div className="bg-[#151520] border border-white/10 p-8 md:p-12 rounded-3xl w-full max-w-[450px] shadow-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="h-14 w-14 bg-accent-1 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,58,242,0.4)]">
            <Ticket className="text-white" size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-white/50 mb-8">
          {isLogin ? 'Sign in to manage your tickets' : 'Join SugoiTickets to start booking'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
            <AlertTriangleIcon className="shrink-0 mt-0.5" size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
              <input 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1 transition-all"
                placeholder="John Doe" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input 
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1 transition-all"
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <input 
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1 transition-all"
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl mt-4 hover:bg-white/90 transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center mt-8 text-white/50">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-white hover:text-accent-1 font-semibold transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>;
}

function AlertTriangleIcon(props: any) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
}
