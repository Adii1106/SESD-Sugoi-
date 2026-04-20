import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Search, SendHorizontal } from 'lucide-react';

export default function MyTicketsPage({ token }: { token: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferEmail, setTransferEmail] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferQty, setTransferQty] = useState(1);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      setError('Failed to load your tickets.');
    } finally {
      setLoading(false);
    }
  };

  // Group tickets by Event ID to allow bulk actions
  const ticketGroups = tickets.reduce((acc: any, ticket: any) => {
    const eid = ticket.event.id;
    if (!acc[eid]) {
      acc[eid] = { 
        event: ticket.event, 
        activeTickets: [], 
        allTickets: [] 
      };
    }
    acc[eid].allTickets.push(ticket);
    if (ticket.status === 'ACTIVE') acc[eid].activeTickets.push(ticket);
    return acc;
  }, {});

  const initiateTransfer = async (groupId: string) => {
    if (!transferEmail) return;
    const group = ticketGroups[groupId];
    if (!group) return;

    try {
      setSending(true);
      setError('');
      setSuccess('');
      
      const payload = {
        eventId: group.event.id,
        quantity: transferQty,
        receiverEmail: transferEmail
      };

      console.log('[Frontend] Sending transfer payload:', payload);

      await axios.post(`${import.meta.env.VITE_API_URL}/transfers`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Secure transfer request initiated for ${transferQty} ticket(s) to ${transferEmail}.`);
      setSelectedTicket(null);
      setTransferEmail('');
      setTransferQty(1);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Transfer failed');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="app-container">
      <h2 className="page-title">My Tickets</h2>
      
      {error && <div style={{ padding: '16px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent-danger)', borderRadius: '12px', marginBottom: '2rem' }}>{error}</div>}
      {success && <div style={{ padding: '16px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-success)', borderRadius: '12px', marginBottom: '2rem' }}>{success}</div>}

      {Object.keys(ticketGroups).length === 0 ? (
        <div className="empty-state">
          <Ticket size={48} opacity={0.5} />
          <p>You haven't booked any tickets yet.</p>
        </div>
      ) : (
        <div className="grid">
          {Object.values(ticketGroups).map((group: any) => (
            <div key={group.event.id} className="surface-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px' }}>{group.event.title}</h3>
                <span className="badge active">{group.allTickets.length} Ticket(s)</span>
              </div>
              <p className="subtext" style={{ marginBottom: '8px' }}>
                {new Date(group.event.date).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {group.activeTickets.length} Active / {group.allTickets.length - group.activeTickets.length} Pending
              </p>

              {group.activeTickets.length > 0 && (
                selectedTicket === group.event.id ? (
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        min="1" 
                        max={group.activeTickets.length} 
                        value={transferQty}
                        onChange={e => setTransferQty(Number(e.target.value))}
                        style={{ width: '60px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                      <input 
                        type="email" 
                        placeholder="Receiver Email" 
                        value={transferEmail}
                        onChange={e => setTransferEmail(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-primary" 
                        onClick={() => initiateTransfer(group.event.id)} 
                        style={{ flex: 1 }}
                        disabled={sending}
                      >
                        {sending ? 'Processing...' : `Send ${transferQty}`}
                      </button>
                      <button className="btn-secondary" onClick={() => setSelectedTicket(null)} disabled={sending}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-secondary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => {
                    setSelectedTicket(group.event.id);
                    setTransferQty(1);
                  }}>
                    <SendHorizontal size={16} /> Transfer Tickets
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
