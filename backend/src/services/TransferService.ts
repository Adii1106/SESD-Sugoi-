import prisma from '../utils/prismaClient';
import { OwnershipValidationStrategy, DeadlineValidationStrategy } from './TransferStrategies';

export class TransferService {
  static async initiateTransfer(ticketId: string, senderId: string, receiverEmail: string) {
    const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
    if (!receiver) throw { status: 404, message: 'Target receiver user not found in the system.' };

    if (senderId === receiver.id) throw { status: 400, message: 'Cannot transfer a ticket to yourself.' };

    // Apply Strategy Validations
    const ownershipRule = new OwnershipValidationStrategy();
    const deadlineRule = new DeadlineValidationStrategy();
    
    await ownershipRule.validate(ticketId, senderId);
    await deadlineRule.validate(ticketId, senderId);

    // Apply Soft-Lock and emit Transfer object atomically
    return prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: 'PENDING_TRANSFER' }
      });

      const expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      const request = await tx.transferRequest.create({
        data: {
          ticketId,
          senderId,
          receiverId: receiver.id,
          status: 'PENDING',
          expiresAt
        }
      });

      return request;
    });
  }

  static async acceptTransfer(transferId: string, receiverId: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.transferRequest.findUnique({ where: { id: transferId } });
      if (!request) throw { status: 404, message: 'Transfer request not found.' };
      
      if (request.receiverId !== receiverId) throw { status: 403, message: 'Unauthorized.' };
      if (request.status !== 'PENDING') throw { status: 400, message: 'Transfer is no longer pending.' };
      if (new Date() > request.expiresAt) throw { status: 400, message: 'Transfer request expired.' };

      await tx.transferRequest.update({
        where: { id: transferId },
        data: { status: 'ACCEPTED' }
      });

      await tx.ticket.update({
        where: { id: request.ticketId },
        data: { ownerId: receiverId, status: 'ACTIVE' }
      });

      return { message: 'Ticket successfully transferred.' };
    });
  }

  static async rejectTransfer(transferId: string, receiverId: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.transferRequest.findUnique({ where: { id: transferId } });
      if (!request) throw { status: 404, message: 'Transfer request not found.' };
      
      if (request.receiverId !== receiverId) throw { status: 403, message: 'Unauthorized.' };
      if (request.status !== 'PENDING') throw { status: 400, message: 'Transfer is no longer pending.' };

      await tx.transferRequest.update({
        where: { id: transferId },
        data: { status: 'REJECTED' }
      });

      await tx.ticket.update({
        where: { id: request.ticketId },
        data: { status: 'ACTIVE' }
      });

      return { message: 'Transfer request rejected. Ticket locked released.' };
    });
  }

  static async getIncomingTransfers(userId: string) {
    return prisma.transferRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: { select: { email: true, name: true } },
        ticket: { 
          include: { 
            event: { select: { title: true, date: true } } 
          } 
        }
      }
    });
  }
}
