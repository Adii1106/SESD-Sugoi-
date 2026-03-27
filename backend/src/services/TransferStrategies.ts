import prisma from '../utils/prismaClient';

export interface ITransferValidationStrategy {
  validate(ticketId: string, senderId: string): Promise<boolean>;
}

export class OwnershipValidationStrategy implements ITransferValidationStrategy {
  async validate(ticketId: string, senderId: string): Promise<boolean> {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw { status: 404, message: 'Ticket not found.' };
    if (ticket.ownerId !== senderId) throw { status: 403, message: 'Unauthorized: You do not own this ticket.' };
    if (ticket.status !== 'ACTIVE') throw { status: 400, message: `Ticket cannot be transferred. Status is currently: ${ticket.status}` };
    return true;
  }
}

export class DeadlineValidationStrategy implements ITransferValidationStrategy {
  async validate(ticketId: string, senderId: string): Promise<boolean> {
    const ticket = await prisma.ticket.findUnique({ 
      where: { id: ticketId },
      include: { event: true }
    });
    
    if (!ticket || !ticket.event) return false;
    
    const timeUntilEvent = ticket.event.date.getTime() - new Date().getTime();
    if (timeUntilEvent < 24 * 60 * 60 * 1000) {
      throw { status: 400, message: 'Transfers are strictly locked within 24 hours of the event starting.' };
    }
    
    return true;
  }
}
