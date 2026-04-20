import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Users, Ticket, CheckCircle2 } from 'lucide-react';

export default function EventDetailsPage({ token }: { token: string }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ev, setEv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const found = res.data.find((e: any) => e.id === id);
        if (found) setEv(found);
        else setError('Event not found');
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, token]);

  const handleBook = async () => {
    setBooking(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, { eventId: id, quantity: qty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Successfully booked ${qty} ticket(s)!`);
      setEv({ ...ev, availableCapacity: ev.availableCapacity - qty });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-spinner" />;
  if (error && !ev) return <div className="empty-state">{error}</div>;

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate('/events')} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        Back to Events
      </button>

      {success && (
        <div style={{ padding: '16px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-success)', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <strong>{success}</strong>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent-danger)', borderRadius: '12px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div className="surface-card" style={{ padding: '3rem' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{ev.title}</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {ev.description || 'An amazing technology conference that you do not want to miss.'}
        </p>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 500 }}>
            <div style={{ padding: '12px', background: 'rgba(0,113,227,0.1)', borderRadius: '10px', color: 'var(--primary-color)' }}><Calendar size={24} /></div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Date</div>
              {new Date(ev.date).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 500 }}>
            <div style={{ padding: '12px', background: 'rgba(52,199,89,0.1)', borderRadius: '10px', color: 'var(--accent-success)' }}><Users size={24} /></div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Availability</div>
              {ev.availableCapacity} / {ev.totalCapacity}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input 
            type="number" 
            min="1" 
            max={ev.availableCapacity} 
            value={qty} 
            onChange={e => setQty(Number(e.target.value))} 
            style={{ width: '80px', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '16px', outline: 'none' }}
          />
          <button 
            className="btn-primary" 
            onClick={handleBook} 
            disabled={booking || ev.availableCapacity === 0}
            style={{ padding: '12px 24px', fontSize: '16px', flex: 1 }}
          >
            <Ticket size={20} />
            {booking ? 'Reserving...' : ev.availableCapacity === 0 ? 'Sold Out' : `Book ${qty} Ticket(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
