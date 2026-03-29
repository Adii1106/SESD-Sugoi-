import { Response, NextFunction } from 'express';
import { TransferService } from '../services/TransferService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class TransferController {
  static async initiate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ticketId, receiverEmail } = req.body;
      const senderId = req.user?.userId;

      if (!senderId) return res.status(401).json({ error: 'Unauthorized session origin' });

      const request = await TransferService.initiateTransfer(ticketId, senderId, receiverEmail);
      res.status(201).json({ message: 'Ticket soft-locked. Transfer initiated securely.', request });
    } catch (err) {
      next(err);
    }
  }

  static async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { transferId } = req.params;
      const receiverId = req.user?.userId;

      if (!receiverId) return res.status(401).json({ error: 'Unauthorized signature payload' });

      const result = await TransferService.acceptTransfer(transferId, receiverId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async reject(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const { transferId } = req.params;
        const receiverId = req.user?.userId;
  
        if (!receiverId) return res.status(401).json({ error: 'Unauthorized signature payload' });
  
        const result = await TransferService.rejectTransfer(transferId, receiverId);
        res.json(result);
      } catch (err) {
        next(err);
      }
    }

  static async getIncoming(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const receiverId = req.user?.userId;
      if (!receiverId) return res.status(401).json({ error: 'Unauthorized session' });

      const incoming = await TransferService.getIncomingTransfers(receiverId);
      res.json(incoming);
    } catch (err) {
      next(err);
    }
  }
}
