import express from 'express';
import  PaymentController  from "../controllers/Payment.controller";

var router = express.Router();

router.post('/Mercadopago', PaymentController.postPagamento);

export default router;