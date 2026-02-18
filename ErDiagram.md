# Relational Entity Diagram

This strictly outlines the normalized design of the PostgreSQL schema tables representing the underlying data engine. 

The granular `TICKET` row allows for single-item transfers, rather than awkwardly transferring batch-level `BOOKING` rows.

![ER Diagram](./Diagrams/ERDiagram.png)

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places (1:N)"
    USER ||--o{ TICKET : "owns (1:N)"
    USER ||--o{ TRANSFER_REQUEST : "sends (1:N)"
    USER ||--o{ TRANSFER_REQUEST : "receives (1:N)"
    USER ||--o{ EVENT : "administers (1:N)"
    
    EVENT ||--o{ BOOKING : "tracks (1:N)"
    EVENT ||--o{ TICKET : "associates (1:N)"
    
    BOOKING ||--|{ TICKET : "generates (1:N)"
    
    TICKET ||--o{ TRANSFER_REQUEST : "undergoes (1:N)"

    USER {
        uuid id PK
        string full_name
        string email
        string password_hash
        string role "USER | ADMIN"
        datetime created_at
    }

    EVENT {
        uuid id PK
        uuid admin_id FK
        string title
        datetime start_date
        int capacity_total
        int capacity_available
        datetime created_at
    }

    BOOKING {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        int quantity
        datetime created_at
    }

    TICKET {
        uuid id PK
        uuid booking_id FK
        uuid event_id FK
        uuid owner_id FK
        string status "ACTIVE | PENDING_TRANSFER | USED"
        datetime created_at
    }

    TRANSFER_REQUEST {
        uuid id PK
        uuid ticket_id FK
        uuid sender_id FK
        uuid receiver_id FK
        string status "PENDING | ACCEPTED | REJECTED | EXPIRED"
        datetime created_at
        datetime expires_at
    }
```
