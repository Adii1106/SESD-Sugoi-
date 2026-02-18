# End-to-End Sequence Flow

This sequence highlights the flow of user bookings into the granular ticket transfer engine. Crucially, it demonstrates how the database transaction state and the observer-driven notifications are handled by the backend.

![Sequence Diagram](./Diagrams/Sequence.png)

```mermaid
sequenceDiagram
    actor Sender as User (Sender)
    actor Receiver as User (Receiver)
    participant Auth as Auth Service
    participant API as Booking / Transfer Controllers
    participant DB as PostgreSQL (Prisma)
    participant Notify as Notification Observer

    %% Booking Phase
    Note over Sender,Notify: PHASE 1: Booking a Ticket
    Sender->>Auth: Login(credentials)
    Auth-->>Sender: Return JWT Token
    Sender->>API: POST /bookings (eventId, quantity=1)
    API->>DB: Check event capacity (Row Lock)
    DB-->>API: Capacity Available
    API->>DB: Commit INSERT Booking & TICKET(Owner = Sender, Status = ACTIVE)
    DB-->>API: Success
    API-->>Sender: 201 Created (Booking Success)

    %% Transfer Initiation
    Note over Sender,Notify: PHASE 2: Initiating a Ticket Transfer
    Sender->>API: POST /transfers (ticketId, receiverEmail)
    API->>DB: SELECT User WHERE email = receiverEmail
    alt Receiver not found
        DB-->>API: null
        API-->>Sender: 404 User Not Found
    else Receiver exists
        DB-->>API: Receiver Data (ID)
        API->>API: Strategy Pattern: Validate Eligibility
        Note right of API: Ticket must be ACTIVE.<br/>Event deadline must be valid.
        API->>DB: Start Transaction
        API->>DB: UPDATE Ticket SET status = 'PENDING_TRANSFER'
        API->>DB: INSERT TransferRequest (status = PENDING)
        DB-->>API: Commit Transaction
        API->>Notify: Emit Event: 'transfer.initiated'
        Notify-->>Receiver: Dispatch Email Notification
        API-->>Sender: 201 Transfer Initiated Successfully
    end

    %% Transfer Resolution
    Note over Receiver,Notify: PHASE 3: Receiver Accepts Transfer
    Receiver->>API: POST /transfers/{transferId}/accept
    API->>DB: Start DB Transaction
    API->>DB: Validate Receiver corresponds to Transfer Request
    API->>DB: UPDATE TransferRequest SET status = 'ACCEPTED'
    API->>DB: UPDATE Ticket SET owner_id = receiver_id, status = 'ACTIVE'
    DB-->>API: Commit Transaction
    API->>Notify: Emit Event: 'transfer.completed'
    Notify-->>Sender: Dispatch Receipt Email
    Notify-->>Receiver: Dispatch Ticket Ready Email
    API-->>Receiver: 200 Transfer Accepted
```
