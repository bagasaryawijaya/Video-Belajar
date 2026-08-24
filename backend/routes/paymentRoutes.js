import { Router } from 'express';
import { preparePayment, completePayment } from '../controllers/paymentController.js';
const router = Router();
router.post('/prepare', preparePayment);
router.post('/complete', completePayment);
export default router;
