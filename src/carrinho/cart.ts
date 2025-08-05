import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { isAuthenticated, VerificationRoles } from "../middlewares/isAuthenticated";

const router = Router();

router.get('/', isAuthenticated, CartController.getCartByUserId);
router.post('/item', isAuthenticated, CartController.upsertItem);
router.delete('/item', isAuthenticated, CartController.removeItem);

export default router;