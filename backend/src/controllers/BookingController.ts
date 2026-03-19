import { Response, NextFunction } from 'express';
import { BookingService } from '../services/BookingService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class BookingController {
  static async book(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, quantity } = req.body;
      const userId = req.user?.userId;

      if (!userId) return res.status(401).json({ error: 'Unauthorized signature payload' });

      const booking = await BookingService.bookTickets(userId, eventId, quantity);
      res.status(201).json({ message: 'Booking confirmation successful', booking });
    } catch (err) {
      next(err);
    }
  }

  static async getMyTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
       const userId = req.user?.userId;
       if (!userId) return res.status(401).json({ error: 'Unauthorized signature payload' });
       
       const tickets = await BookingService.getUserTickets(userId);
       res.json(tickets);
    } catch (err) {
      next(err);
    }
  }
}
