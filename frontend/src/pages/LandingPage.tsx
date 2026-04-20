import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Ticket, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="app-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ padding: '6rem 0' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '24px' }}>
          Book. Own. <br/>
          <span style={{ color: 'var(--primary-color)' }}>Transfer Securely.</span>
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.5 }}>
          The premier platform for frictionless tech event bookings. Own your access and seamlessly transfer tickets p2p with military-grade safety.
        </p>
        <Link to="/events" className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '100px' }}>
          Explore Events
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '4rem', textAlign: 'left' }}>
        <div className="surface-card">
          <Ticket size={32} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
          <h3>Instant Booking</h3>
          <p className="subtext" style={{ marginTop: '8px' }}>Real-time inventory and capacity tracking ensures you never miss out on major tech events.</p>
        </div>
        <div className="surface-card">
          <Users size={32} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
          <h3>P2P Transfers</h3>
          <p className="subtext" style={{ marginTop: '8px' }}>Can't make it? Transfer your ticket entirely to a friend securely just using their email address.</p>
        </div>
        <div className="surface-card">
          <ShieldCheck size={32} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
          <h3>Fraud Prevention</h3>
          <p className="subtext" style={{ marginTop: '8px' }}>Our atomic lock system prevents double-transfers and verifies definitive mathematical ownership.</p>
        </div>
      </div>
    </div>
  );
}
