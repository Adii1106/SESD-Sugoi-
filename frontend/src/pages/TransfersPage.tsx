import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Inbox, Check, X, Send, Clock, User } from 'lucide-react';

export default function TransfersPage({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
  const [transfers, setTransfers] = useState<any[]>([]);
  const [sentTransfers, setSentTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchIncoming();
    fetchSent();
  }, [token]);

  const fetchIncoming = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/transfers/incoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransfers(res.data);
    } catch (err) {
      setError('Failed to load incoming transfers');
    } finally {
      if (activeTab === 'incoming') setLoading(false);
    }
  };

  const fetchSent = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/transfers/sent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentTransfers(res.data);
    } catch (err) {
      console.error('Failed to load sent transfers');
    } finally {
      if (activeTab === 'sent') setLoading(false);
    }
  };

  const handleTransfer = async (transferId: string, action: 'accept' | 'reject') => {
    try {
      setError('');
      await axios.post(`${import.meta.env.VITE_API_URL}/transfers/${transferId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Transfer successfully ${action}ed.`);
      fetchIncoming();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} transfer`);
    }
  };

  // Group sent transfers by Receiver and Time (within same minute) to show "Batch"
  const groupedSent = sentTransfers.reduce((acc: any[], tr: any) => {
    const timeKey = new Date(tr.createdAt).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    const key = `${tr.receiver.email}-${timeKey}-${tr.ticket.event.id}`;
    
    const existing = acc.find(item => item.key === key);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        key,
        receiver: tr.receiver,
        event: tr.ticket.event,
        status: tr.status,
        createdAt: tr.createdAt,
        count: 1
      });
    }
    return acc;
  }, []);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Transfer Dashboard</h2>
        <div className="tab-switcher" style={{ display: 'flex', background: 'var(--surface-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('incoming')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              background: activeTab === 'incoming' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'incoming' ? 'var(--bg-app)' : 'var(--text-primary)',
              transition: 'all 0.2s'
            }}
          >
            Incoming
          </button>
          <button 
            onClick={() => setActiveTab('sent')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              background: activeTab === 'sent' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'sent' ? 'var(--bg-app)' : 'var(--text-primary)',
              transition: 'all 0.2s'
            }}
          >
            Sent History
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '16px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent-danger)', borderRadius: '12px', marginBottom: '2rem' }}>{error}</div>}
      {success && <div style={{ padding: '16px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-success)', borderRadius: '12px', marginBottom: '2rem' }}>{success}</div>}

      {activeTab === 'incoming' ? (
        transfers.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} opacity={0.5} />
            <p>You have no pending ticket transfers.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {transfers.map(tr => (
              <div key={tr.id} className="surface-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Ticket for {tr.ticket.event.title}</h3>
                  <p className="subtext">From: {tr.sender.name} ({tr.sender.email})</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-primary" 
                    style={{ background: 'var(--accent-success)', color: '#fff' }} 
                    onClick={() => handleTransfer(tr.id, 'accept')}
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent-danger)' }} 
                    onClick={() => handleTransfer(tr.id, 'reject')}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        groupedSent.length === 0 ? (
          <div className="empty-state">
            <Send size={48} opacity={0.5} />
            <p>You haven't shared any tickets yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {groupedSent.map(group => (
              <div key={group.key} className="surface-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px' }}>{group.count} Ticket(s) Shared</h3>
                    <span className={`badge ${group.status.toLowerCase()}`}>{group.status}</span>
                  </div>
                  <p className="subtext" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> To: {group.receiver.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(group.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-primary)' }}>Event: {group.event.title}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
