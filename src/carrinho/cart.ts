import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { isAuthenticated, VerificationRoles } from "../middlewares/isAuthenticated";

const router = Router();

router.get('/', isAuthenticated, CartController.getCartByUserId)
router.post('/items', CartController.upsertItem)

export default router