# Design Pattern Implementation: Strategy Pattern

This application integrates advanced Object-Oriented methodologies inside `backend/src/services/TransferStrategies.ts`. Rather than tightly coupling all "transfer rule mechanics" directly inside the core `TransferService`, the application employs the **Strategy Design Pattern**.

## The Problem
When a user attempts to transfer a ticket, a variety of evolving constraints must be validated:
* Does the person actually own this ticket?
* Is the ticket already locked within a previous pending transfer?
* **Is the event starting soon?** Many systems impose a "no transfers within 24 hours of the event" rule.

If all of this logic resided directly inside `TransferService.initiateTransfer()`, adding new rules (like "VIP Tickets cannot be transferred") would require constantly tearing open and modifying the primary transaction engine.

## The Solution: Strategy Interface Pattern
We extracted the concept of a "validation rule" into a strictly enforced TypeScript interface:

```typescript
export interface ITransferValidationStrategy {
  validate(ticketId: string, senderId: string): Promise<boolean>;
}
```

We then implemented isolated concrete classes that implement this exact interface:

### 1. `OwnershipValidationStrategy`
Runs an atomic database check to query if the sender is strictly the `ownerId` of the current ticket and enforces the state-machine rules preventing a `PENDING_TRANSFER` ticket from being transferred twice.

### 2. `DeadlineValidationStrategy`
Analyzes the inner-joined `event.date` tracking to determine the exact millisecond differential. If the transfer is attempted within a set threshold (e.g., `< 24 hours`), the strategy errors out and safely prevents the core transaction.

### How The Engine Consumes Strategies
Inside the `TransferService.ts`, the code simply instantiates the required rules and loops through their `validate()` methods. 

```typescript
const ownershipRule = new OwnershipValidationStrategy();
const deadlineRule = new DeadlineValidationStrategy();

await ownershipRule.validate(ticketId, senderId);
await deadlineRule.validate(ticketId, senderId);
```
 
This adheres flawlessly to the **O of SOLID: The Open/Closed Principle**. The `TransferService` is closed for modification, but entirely open for extension! A developer can construct endless new `ITransferValidationStrategy` classes in the future without risking breaking the core transfer loop!
