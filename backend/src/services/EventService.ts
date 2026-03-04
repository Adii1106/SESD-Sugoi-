import prisma from '../utils/prismaClient';

export class EventService {
  static async createEvent(title: string, date: Date, totalCapacity: number, adminId: string) {
    return prisma.event.create({
      data: {
        title,
        date,
        totalCapacity,
        availableCapacity: totalCapacity,
        adminId
      }
    });
  }

  static async getAllEvents() {
    return prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        admin: { select: { name: true } }
      }
    });
  }

  static async getEventById(eventId: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
      include: {
        admin: { select: { name: true } },
        _count: { select: { tickets: true } }
      }
    });
  }
}
