import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Users } from 'lucide-react';

export default function EventsPage({ token }: { token: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  if (loading) return <div className="loading-spinner" />;
  if (error) return <div className="empty-state">{error}</div>;

  return (
    <div className="app-container">
      <h2 className="page-title">Available Events</h2>
      
      {events.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} opacity={0.5} />
          <p>No events currently available for booking.</p>
        </div>
      ) : (
        <div className="grid">
          {events.map((ev) => (
            <div key={ev.id} className="surface-card">
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{ev.title}</h3>
              <p className="subtext" style={{ marginBottom: '16px', flex: 1 }}>{ev.description || 'Join this exclusive tech conference.'}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> {new Date(ev.date).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ev.availableCapacity < 10 ? 'var(--accent-danger)' : 'inherit' }}>
                  <Users size={16} /> {ev.availableCapacity} left
                </span>
              </div>
              
              <Link to={`/events/${ev.id}`} className="btn-primary" style={{ width: '100%' }}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
