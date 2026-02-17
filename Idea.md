# System Design: Event / Workshop Booking System with Ticket Transfer

## 1. Project Overview
This project presents an enterprise-grade backend system designed to handle event and workshop ticket bookings. Unlike standard CRUD applications, this system introduces a sophisticated **Ticket Transfer Engine** allowing users to programmatically transfer the ownership of their tickets to other registered users. The project places a heavy emphasis on backend system design principles, concurrent data management, layered architecture, and object-oriented design patterns.

## 2. Core Problem & Real-World Solution
**The Problem:** Traditional event booking systems often treat tickets as static assets. When attendees cannot make an event, they resort to insecure "email-forwarding," which obscures true attendance from organizers and opens the door to scalping and double-spending fraud (where the original buyer and the transferee both attempt to use the same QR code).
**The Solution:** This platform integrates a built-in **Closed-Loop Ticket Transfer System**. The system acts as the absolute source of truth for ownership. To mitigate concurrent "double-spend" attempts, tickets are securely "Soft Locked" during transfer negotiations.

## 3. Key System Features
* **Authentication & User Management:** Granular tracking of Users vs. Admins. Both endpoints (booking and transferring) require robust JWT authentication.
* **Granular Booking:** Users book capacity which issues distinct `Ticket` entities (allowing partial transfers from a batch booking point of view).
* **Robust Transfer Engine:**
    * Validates user and target eligibility.
    * Applies an atomic soft-lock (`PENDING_TRANSFER` status) on the ticket.
    * Mandates an Accept/Reject flow by the receiver.
    * Guarantees transactional consistency during ownership swaps.
* **Optional Future Scalability:** Designed to easily snap-in advanced Strategy constraints (Transfer Deadlines) and Waitlists.

## 4. Technical Architecture
The application uses a **Layered Domain-Driven Design (DDD)** approach:
1. **Controller Layer:** Express.js routing, payload validation, and JWT payload unmarshalling.
2. **Service Layer:** Carries the core business rules, transactional logic, and invokes Domain Patterns (Strategy pattern for transfer rules).
3. **Repository/ORM Layer:** Driven by Prisma ORM; acts as the data access gateway decoupling the database implementation from the Service layer.

### 4.1. Applied Design Patterns
* **Strategy Pattern:** Validates real-time transfer constraints (e.g., locking transfers 24 hours before the event).
* **Observer Pattern:** Subscribes to backend events (`TransferAccepted`, `BookingCreated`) and handles generic Side-Effects like email service triggers without blocking the main event thread.

## 5. Technology Stack
* **Backend Runtime:** Node.js equipped with TypeScript for Interface enforcement. 
* **Framework:** Express.js 
* **Database:** PostgreSQL (Ideal for ACID-compliant transactions preventing race conditions during transfers).
* **Database Mapping:** Prisma ORM.

## 6. Project Scope & Deliverables
The core deliverables of this design phase focus exclusively on mapping the architectural blueprint.
* `useCaseDiagram.md`
* `sequenceDiagram.md`
* `classDiagram.md`
* `ErDiagram.md`
 
