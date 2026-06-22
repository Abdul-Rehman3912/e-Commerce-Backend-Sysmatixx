import express from "express";
import { createCheckoutSession, handleWebhook, getPaymentStatus } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.get('/status/:orderId', getPaymentStatus);

export default router;