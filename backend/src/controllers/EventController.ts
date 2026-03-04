import { Response, NextFunction } from 'express';
import { EventService } from '../services/EventService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class EventController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, date, totalCapacity } = req.body;
      const adminId = req.user?.userId;
      
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can create events within the system.' });
      }

      const event = await EventService.createEvent(title, new Date(date), totalCapacity, adminId!);
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await EventService.getAllEvents();
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
}
