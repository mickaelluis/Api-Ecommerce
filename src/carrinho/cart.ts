import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { isAuthenticated, VerificationRoles } from "../middlewares/isAuthenticated";

const router = Router();

router.get('/', isAuthenticated, CartController.getCartByUserId);
router.put('/item', isAuthenticated, CartController.upsertItem);
router.delete('/item', isAuthenticated, CartController.removeItem);
router.post('/item/increment', isAuthenticated, CartController.incrementItem);
router.put('/item/decrement', isAuthenticated, CartController.decrementItem);

export default router;