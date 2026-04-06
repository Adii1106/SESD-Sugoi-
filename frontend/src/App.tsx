import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('sugoi_token'));
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sugoi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('sugoi_token', newToken);
    localStorage.setItem('sugoi_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('sugoi_token');
    localStorage.removeItem('sugoi_user');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <Auth onLogin={handleLogin} />;
  }

  return <Dashboard token={token} user={user} onLogout={handleLogout} />;
}
