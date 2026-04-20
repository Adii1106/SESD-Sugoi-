import React, { useState, useEffect } from 'react';
import { LogOut, Ticket, ArrowRightLeft, Sparkles, AlertTriangle, Compass, LayoutDashboard, Calendar, Users, ShieldCheck } from 'lucide-react';

export default function Dashboard({ token, user, onLogout }: any) {
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transfers' | 'explore'>('dashboard');
  
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [activeTransferTicketId, setActiveTransferTicketId] = useState<string|null>(null);

  const fetchHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const loadData = async () => {
    try {
      const [evRes, tickRes, transRes, outRes] = await Promise.all([
        fetch('/api/events', { headers: fetchHeaders }),
        fetch('/api/bookings/my-tickets', { headers: fetchHeaders }),
        fetch('/api/transfers/incoming', { headers: fetchHeaders }),
        fetch('/api/transfers/outgoing', { headers: fetchHeaders })
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (tickRes.ok) setMyTickets(await tickRes.json());
      if (transRes.ok) setIncomingTransfers(await transRes.json());
      if (outRes.ok) setOutgoingTransfers(await outRes.json());
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
        loadData();
        setActiveTab('dashboard');
      } else {
        const data = await res.json();
        alert(data.message || data.error);
      }
    } catch (e) {
      alert('Failed to book');
    }
  };

  const handleInitiateTransfer = async (tickets: any[]) => {
    if (!transferTargetEmail) return;
    // We just need to transfer one ticket from the available group
    const ticketToTransfer = tickets.find(t => t.status === 'ACTIVE');
    if (!ticketToTransfer) {
      alert("No active tickets available to transfer.");
      return;
    }

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({ ticketId: ticketToTransfer.id, receiverEmail: transferTargetEmail })
      });
      const data = await res.json();
      if (res.ok) {
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
        loadData();
      } else {
         const data = await res.json();
         alert(data.message || data.error);
      }
    } catch (e) {
      alert('Failed to process transfer');
    }
  };

  const handleBulkTransferResponse = async (requests: any[], action: 'accept' | 'reject') => {
    try {
      await Promise.all(requests.map(req => 
        fetch(`/api/transfers/${req.id}/${action}`, {
          method: 'POST',
          headers: fetchHeaders
        })
      ));
      loadData();
    } catch (e) {
      alert('Failed to process transfers');
    }
  };

  // Group tickets by event and status to display cleanly
  const groupedTickets = myTickets.reduce((acc: any, ticket: any) => {
    const key = `${ticket.event.id}-${ticket.status}`;
    if (!acc[key]) {
      acc[key] = {
        event: ticket.event,
        status: ticket.status,
        tickets: []
      };
    }
    acc[key].tickets.push(ticket);
    return acc;
  }, {});
  
  const groupedTicketsArray = Object.values(groupedTickets) as any[];

  // Group incoming transfers
  const groupedIncoming = incomingTransfers.reduce((acc: any, req: any) => {
    const key = `${req.ticket.event.id}-${req.sender.email}`;
    if (!acc[key]) {
      acc[key] = {
        event: req.ticket.event,
        sender: req.sender,
        requests: []
      };
    }
    acc[key].requests.push(req);
    return acc;
  }, {});
  const groupedIncomingArray = Object.values(groupedIncoming) as any[];

  // Group outgoing transfers
  const groupedOutgoing = outgoingTransfers.reduce((acc: any, req: any) => {
    const key = `${req.ticket.event.id}-${req.receiver.email}`;
    if (!acc[key]) {
      acc[key] = {
        event: req.ticket.event,
        receiver: req.receiver,
        requests: []
      };
    }
    acc[key].requests.push(req);
    return acc;
  }, {});
  const groupedOutgoingArray = Object.values(groupedOutgoing) as any[];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-body pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-accent-1 rounded-xl flex items-center justify-center">
            <Ticket className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-wider hidden sm:block">
            Sugoi<span className="text-accent-2">Tickets</span>
          </h1>
        </div>
        
        <nav className="flex-1 flex justify-center px-4">
          <div className="flex gap-1 bg-[#151520] p-1.5 rounded-full border border-white/5 shadow-inner">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'dashboard' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('transfers')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all relative ${activeTab === 'transfers' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <ArrowRightLeft size={18} /> <span className="hidden md:inline">Transfers</span>
              {incomingTransfers.length > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent-1 rounded-full animate-pulse"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('explore')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'explore' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Compass size={18} /> <span className="hidden md:inline">Explore</span>
            </button>
          </div>
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
             <span className="text-xs text-white/50 font-medium">Logged in as</span>
             <span className="font-semibold text-sm">{user?.name}</span>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-accent-2 to-accent-1 rounded-full flex items-center justify-center font-bold text-white shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={onLogout} 
            className="text-white/40 hover:text-red-400 p-2 rounded-lg transition-colors bg-white/5 hover:bg-red-400/10"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        
        {/* HERO HEADER FOR EACH TAB */}
        {activeTab === 'dashboard' && (
          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-2">My Tickets</h2>
            <p className="text-white/50 text-lg">Manage your purchased tickets and transfers.</p>
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-2">Incoming Transfers</h2>
            <p className="text-white/50 text-lg">Review and accept tickets sent to you by others.</p>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-2">Explore Events</h2>
            <p className="text-white/50 text-lg">Discover upcoming events and secure your spot.</p>
          </div>
        )}

        {/* TAB CONTENTS */}
        <div>
          {/* TAB 1: YOUR TICKETS */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedTicketsArray.length === 0 && (
                <div className="col-span-full bg-[#151520] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
                  <Ticket size={48} className="text-white/20 mb-4" />
                  <p className="text-xl font-medium text-white/50 mb-6">You don't own any tickets yet.</p>
                  <button onClick={() => setActiveTab('explore')} className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors">Browse Events</button>
                </div>
              )}
              
              {groupedTicketsArray.map((group: any, i: number) => (
                <div key={`${group.event.id}-${group.status}`} className="bg-[#151520] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg ${
                      group.status === 'ACTIVE' ? 'bg-accent-2/20 text-accent-2' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {group.status === 'ACTIVE' ? 'Active' : 'Transfer Pending'}
                    </span>
                    <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                      <Ticket size={14} /> x{group.tickets.length}
                    </span>
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-2 text-white">{group.event.title}</h4>
                  <div className="flex items-center gap-2 text-white/50 mb-6 font-medium text-sm">
                    <Calendar size={16} />
                    {new Date(group.event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="mt-auto">
                    {group.status === 'ACTIVE' && activeTransferTicketId !== group.event.id && (
                      <button 
                        className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        onClick={() => setActiveTransferTicketId(group.event.id)}
                      >
                        Transfer a Ticket <ArrowRightLeft size={16} />
                      </button>
                    )}
                    
                    {activeTransferTicketId === group.event.id && (
                      <div className="bg-[#0a0a0f] p-4 rounded-xl border border-white/10">
                        <label className="text-xs text-white/50 mb-2 block uppercase font-bold">Transfer To</label>
                        <input 
                          type="email" 
                          placeholder="Email address..." 
                          value={transferTargetEmail} 
                          onChange={e => setTransferTargetEmail(e.target.value)}
                          className="w-full bg-[#151520] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-1 mb-3"
                        />
                        <div className="flex gap-2">
                           <button className="flex-1 bg-accent-1 text-white py-2 rounded-lg text-sm font-bold hover:bg-accent-1/90" onClick={() => handleInitiateTransfer(group.tickets)}>Send</button>
                           <button className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm font-medium hover:bg-white/20" onClick={() => setActiveTransferTicketId(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                    
                    {group.status === 'PENDING_TRANSFER' && (
                      <div className="w-full bg-orange-500/10 text-orange-400 py-3 rounded-xl text-center text-sm font-medium">
                        Awaiting Recipient
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: TRANSFERS */}
          {activeTab === 'transfers' && (
            <div className="space-y-12">
              
              {/* Incoming Transfers Section */}
              <section>
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <ArrowRightLeft className="text-accent-2" /> Incoming Requests
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedIncomingArray.length === 0 && (
                    <div className="col-span-full bg-[#151520] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
                      <ArrowRightLeft size={48} className="text-white/20 mb-4" />
                      <p className="text-lg font-medium text-white/50">You have no pending incoming transfers.</p>
                    </div>
                  )}
                  
                  {groupedIncomingArray.map((group: any) => (
                    <div key={`${group.event.id}-${group.sender.email}`} className="bg-[#151520] border border-accent-2/30 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ArrowRightLeft size={64} />
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 text-xs font-bold uppercase rounded-lg bg-accent-2/20 text-accent-2 inline-block">
                            Action Required
                          </span>
                          <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                            <Ticket size={14} /> x{group.requests.length}
                          </span>
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-1">{group.event.title}</h4>
                        <div className="flex items-center gap-2 text-white/50 text-sm">
                          <Calendar size={14} /> {new Date(group.event.date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-[#0a0a0f] rounded-xl p-4 mb-6 border border-white/5">
                        <p className="text-xs text-white/40 uppercase font-bold mb-1">Sender</p>
                        <p className="text-white font-medium truncate" title={group.sender.email}>{group.sender.email}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold hover:bg-white/90 transition-colors"
                          onClick={() => handleBulkTransferResponse(group.requests, 'accept')}
                        >
                          Accept All
                        </button>
                        <button 
                          className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-medium hover:bg-white/20 transition-colors"
                          onClick={() => handleBulkTransferResponse(group.requests, 'reject')}
                        >
                          Decline All
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Outgoing Transfers Section */}
              <section>
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <Ticket className="text-accent-1" /> Sent Tickets (Pending)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedOutgoingArray.length === 0 && (
                    <div className="col-span-full bg-[#151520] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
                      <Ticket size={48} className="text-white/20 mb-4" />
                      <p className="text-lg font-medium text-white/50">You haven't sent any tickets.</p>
                    </div>
                  )}
                  
                  {groupedOutgoingArray.map((group: any) => (
                    <div key={`${group.event.id}-${group.receiver.email}`} className="bg-[#151520] border border-accent-1/20 rounded-2xl p-6 relative overflow-hidden">
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 text-xs font-bold uppercase rounded-lg bg-orange-500/20 text-orange-400 inline-block">
                            Awaiting Accept
                          </span>
                          <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                            <Ticket size={14} /> x{group.requests.length}
                          </span>
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-1">{group.event.title}</h4>
                        <div className="flex items-center gap-2 text-white/50 text-sm">
                          <Calendar size={14} /> {new Date(group.event.date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-[#0a0a0f] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-white/40 uppercase font-bold mb-1">Sent To</p>
                        <p className="text-white font-medium truncate" title={group.receiver.email}>{group.receiver.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
            </div>
          )}

          {/* TAB 3: AVAILABLE EVENTS */}
          {activeTab === 'explore' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {events.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-white/50">No events found.</p>
                </div>
              )}
              
              {events.map((ev: any) => (
                <div key={ev.id} className="bg-[#151520] border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:border-white/30 hover:shadow-xl transition-all duration-300 flex flex-col group">
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-1/10 text-accent-1 font-semibold text-xs rounded-lg mb-3">
                      <Users size={14} /> {ev.availableCapacity} Spots Left
                    </span>
                    <h4 className="text-xl font-bold text-white leading-snug mb-2 group-hover:text-accent-1 transition-colors">
                      {ev.title}
                    </h4>
                    <p className="text-white/50 text-sm flex items-center gap-1.5">
                      <Calendar size={14} /> {new Date(ev.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button 
                    className="mt-auto w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-accent-1 hover:text-white transition-colors" 
                    onClick={() => handleBookTicket(ev.id)}
                  >
                    Book Ticket
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
