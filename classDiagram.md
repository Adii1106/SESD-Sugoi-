# OOP Domain Data Models & Hierarchy

This diagram showcases the application of standard Object-Oriented principles in the domain models (Inheritance, Enums) alongside architectural implementations of common patterns like the **Strategy Pattern**.

![Class Diagram](./Diagrams/classDiagram.png)

```mermaid
classDiagram
    %% Base Identity Domain
    class User {
        +UUID id
        +String name
        +String email
        +String passwordHash
        +Role role
        +login()
        +register()
    }
    
    class Admin {
        +createEvent()
        +manageCapacity()
    }
    
    %% Core Entities Domain
    class Event {
        +UUID id
        +String title
        +DateTime date
        +int capacity
        +int availableCapacity
        +UUID adminId
    }
    
    class Booking {
        +UUID id
        +UUID userId
        +UUID eventId
        +int quantity
        +DateTime createdAt
    }
    
    class Ticket {
        +UUID id
        +UUID bookingId
        +UUID eventId
        +UUID ownerId
        +TicketStatus status
    }
    
    class TransferRequest {
        +UUID id
        +UUID ticketId
        +UUID senderId
        +UUID receiverId
        +TransferStatus status
        +DateTime expiresAt
    }

    %% Enumerations
    class TicketStatus {
        <<enumeration>>
        ACTIVE
        PENDING_TRANSFER
        USED
        CANCELLED
    }
    
    class TransferStatus {
        <<enumeration>>
        PENDING
        ACCEPTED
        REJECTED
        EXPIRED
    }
    
    %% Entity Relationships
    User <|-- Admin : Extends
    User "1" -- "*" Booking : makes
    User "1" -- "*" Ticket : owns
    User "1" -- "*" TransferRequest : initiates/receives
    Event "1" -- "*" Booking : receives
    Event "1" -- "*" Ticket : provides
    Booking "1" -- "*" Ticket : provisions
    Ticket "1" -- "*" TransferRequest : locked by

    %% Application Service & Pattern Implementation
    class TransferService {
        -ITransferValidationStrategy validator
        +initiateTransfer(ticketId, senderId, receiverEmail)
        +generateTransferRequest()
        +processAcceptance(transferId, receiverId)
        +processRejection(transferId, receiverId)
    }
    
    class ITransferValidationStrategy {
        <<interface>>
        +validate(ticket, event, sender)
    }

    class DeadlineValidationStrategy {
        +int deadlineThresholdHours
        +validate(ticket, event, sender)
    }
    
    class MaxTransfersValidationStrategy {
        +validate(ticket, event, sender)
    }

    ITransferValidationStrategy <|.. DeadlineValidationStrategy : Implements
    ITransferValidationStrategy <|.. MaxTransfersValidationStrategy : Implements
    TransferService --> ITransferValidationStrategy : Consumes (Strategy)
```
