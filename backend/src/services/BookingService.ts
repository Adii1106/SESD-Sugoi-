import prisma from '../utils/prismaClient';

export class BookingService {
  static async bookTickets(userId: string, eventId: string, quantity: number) {
    // Atomic transactional processing ensuring capacity constraints
    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw { status: 404, message: 'Event not found' };
      if (event.availableCapacity < quantity) {
        throw { status: 400, message: `Only ${event.availableCapacity} tickets are still available.` };
      }

      // Safely decrement availability lock
      await tx.event.update({
        where: { id: eventId },
        data: { availableCapacity: { decrement: quantity } }
      });

      // Construct booking aggregate
      const booking = await tx.booking.create({
        data: { userId, eventId, quantity }
      });

      // Issue individual granular ticket entities to allow future partial transfers
      const ticketsData = Array.from({ length: quantity }).map(() => ({
        bookingId: booking.id,
        eventId: eventId,
        ownerId: userId,
        status: 'ACTIVE' as const
      }));

      await tx.ticket.createMany({ data: ticketsData });

      return booking;
    });
  }

  static async getUserTickets(userId: string) {
    return prisma.ticket.findMany({
      where: { ownerId: userId },
      include: {
        event: { select: { title: true, date: true } }
      }
    });
  }
}
