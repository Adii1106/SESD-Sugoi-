import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, LogOut, User, Calendar, MoveRight } from 'lucide-react';

export default function Navbar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/auth');
  };

  const navLinkStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: location.pathname === path ? 'rgba(0,0,0,0.05)' : 'transparent',
    color: location.pathname === path ? 'var(--text-main)' : 'var(--text-muted)',
    fontWeight: location.pathname === path ? 600 : 500,
  });

  return (
    <header className="nav-header">
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)' }} className="nav-logo">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
          <Ticket size={24} color="var(--primary-color)" />
          SugoiTickets
        </h1>
      </Link>
      
      {user ? (
        <nav className="nav-links">
          <Link to="/events" className="nav-link" style={navLinkStyle('/events')}>
            <Calendar size={18} /> Events
          </Link>
          <Link to="/my-tickets" className="nav-link" style={navLinkStyle('/my-tickets')}>
            <Ticket size={18} /> My Tickets
          </Link>
          <Link to="/transfers" className="nav-link" style={navLinkStyle('/transfers')}>
            <MoveRight size={18} /> Transfers
          </Link>
          
          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)', margin: '0 8px' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="var(--text-muted)" />
              {user.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 10px' }}>
              <LogOut size={16} />
            </button>
          </div>
        </nav>
      ) : (
        <nav className="nav-links">
          <Link to="/auth" className="btn-primary">Sign In</Link>
        </nav>
      )}
    </header>
  );
}
