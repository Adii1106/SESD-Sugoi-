import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { EventController } from '../controllers/EventController';
import { BookingController } from '../controllers/BookingController';
import { TransferController } from '../controllers/TransferController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Identity & Roles
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Events Schema
router.post('/events', authenticateJWT, EventController.create);
router.get('/events', authenticateJWT, EventController.getAll);

// Booking Transactions
router.post('/bookings', authenticateJWT, BookingController.book);
router.get('/bookings/my-tickets', authenticateJWT, BookingController.getMyTickets);

// Ticket Transfer Engine
router.get('/transfers/incoming', authenticateJWT, TransferController.getIncoming);
router.get('/transfers/outgoing', authenticateJWT, TransferController.getOutgoing);
router.post('/transfers', authenticateJWT, TransferController.initiate);
router.post('/transfers/:transferId/accept', authenticateJWT, TransferController.accept);
router.post('/transfers/:transferId/reject', authenticateJWT, TransferController.reject);

export default router;
