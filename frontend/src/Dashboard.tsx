import React, { useState, useEffect } from 'react';

export default function Dashboard({ token, user, onLogout }: any) {
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [activeTransferTicketId, setActiveTransferTicketId] = useState<string|null>(null);

  const fetchHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const loadData = async () => {
    try {
      const [evRes, tickRes, transRes] = await Promise.all([
        fetch('/api/events', { headers: fetchHeaders }),
        fetch('/api/bookings/my-tickets', { headers: fetchHeaders }),
        fetch('/api/transfers/incoming', { headers: fetchHeaders })
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (tickRes.ok) setMyTickets(await tickRes.json());
      if (transRes.ok) setIncomingTransfers(await transRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookTicket = async (eventId: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({ eventId, quantity: 1 })
      });
      if (res.ok) {
        alert('Ticket booked!');
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || data.error);
      }
    } catch (e) {
      alert('Failed to book');
    }
  };

  const handleInitiateTransfer = async () => {
    if (!transferTargetEmail || !activeTransferTicketId) return;
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({ ticketId: activeTransferTicketId, receiverEmail: transferTargetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Transfer initiated!');
        setTransferTargetEmail('');
        setActiveTransferTicketId(null);
        loadData();
      } else {
        alert(data.message || data.error);
      }
    } catch (e) {
      alert('Failed to transfer');
    }
  };

  const handleTransferResponse = async (transferId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/transfers/${transferId}/${action}`, {
        method: 'POST',
        headers: fetchHeaders
      });
      if (res.ok) {
        alert(`Transfer ${action}ed successfully.`);
        loadData();
      } else {
         const data = await res.json();
         alert(data.message || data.error);
      }
    } catch (e) {
      alert('Failed to process transfer');
    }
  };

  return (
    <div className="app-container">
      <header className="nav-header">
        <div className="nav-logo">
          <h1>SugoiTickets.</h1>
        </div>
        <div className="user-profile">
          <span style={{ fontWeight: 600 }}>{user?.name}</span>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <button onClick={onLogout} style={{ border: 'none', background: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer', marginLeft: '1rem', fontWeight: 'bold' }}>Logout</button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <h2>Book. Own.<br/>Transfer Securely.</h2>
          <p>Your tickets are always under your control.</p>
        </section>

        {/* SECTION 1: YOUR TICKETS */}
        <section className="dashboard-section">
          <h3>Your Tickets</h3>
          <div className="grid">
            {myTickets.length === 0 && <p style={{color: 'var(--text-muted)'}}>No tickets owned yet.</p>}
            {myTickets.map((t: any) => (
              <div key={t.id} className="surface-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`badge ${t.status === 'ACTIVE' ? 'active' : 'pending'}`}>
                    {t.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING TRANSFER'}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: {t.id.slice(0,8)}</span>
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t.event.title}</h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{new Date(t.event.date).toLocaleDateString()}</p>
                
                {t.status === 'ACTIVE' && activeTransferTicketId !== t.id && (
                  <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTransferTicketId(t.id)}>Transfer Ticket</button>
                )}
                {activeTransferTicketId === t.id && (
                  <div style={{display: 'flex', gap: '8px', flexDirection: 'column'}}>
                    <input 
                      type="email" 
                      placeholder="Receiver Email..." 
                      value={transferTargetEmail} 
                      onChange={e => setTransferTargetEmail(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid gray', background: 'transparent', color: 'var(--text-main)'}}
                    />
                    <div style={{display: 'flex', gap: '8px'}}>
                       <button className="btn-primary" style={{flex: 1}} onClick={handleInitiateTransfer}>Send</button>
                       <button className="btn-secondary" style={{flex: 1}} onClick={() => setActiveTransferTicketId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
                {t.status === 'PENDING_TRANSFER' && (
                  <button className="btn-secondary" style={{ width: '100%', opacity: 0.5 }} disabled>Awaiting Acceptance...</button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: PENDING TRANSFERS (INCOMING) */}
        <section className="dashboard-section">
          <h3 style={{ color: 'var(--primary-color)' }}>Incoming Transfers</h3>
          <div className="grid">
            {incomingTransfers.length === 0 && <p style={{color: 'var(--text-muted)'}}>No incoming requests.</p>}
            {incomingTransfers.map((req: any) => (
              <div key={req.id} className="surface-card" style={{ border: '1px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge pending">REQUIRES ACTION</span>
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{req.ticket.event.title}</h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>From: {req.sender.email}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={() => handleTransferResponse(req.id, 'accept')} style={{ flex: 1, backgroundColor: 'var(--accent-success)' }}>Accept</button>
                  <button className="btn-secondary" onClick={() => handleTransferResponse(req.id, 'reject')} style={{ flex: 1, color: 'var(--text-main)', border: '1px solid rgba(134,134,139,0.3)', background: 'transparent' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: AVAILABLE EVENTS */}
        <section className="dashboard-section">
          <h3>Available Events</h3>
          <div className="grid">
            {events.length === 0 && <p style={{color: 'var(--text-muted)'}}>No events loaded.</p>}
            {events.map((ev: any) => (
              <div key={ev.id} className="surface-card">
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ev.title}</h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{new Date(ev.date).toLocaleDateString()} • {ev.availableCapacity} Tickets Left</p>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleBookTicket(ev.id)}>Book Ticket</button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
