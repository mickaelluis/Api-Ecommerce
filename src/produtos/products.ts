import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { isAuthenticated, VerificationRoles } from "../middlewares/isAuthenticated";

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', isAuthenticated, VerificationRoles, ProductController.createProduct);
router.put('/:id', isAuthenticated, VerificationRoles, ProductController.updateProduct);
router.delete('/:id', isAuthenticated, VerificationRoles, ProductController.deleteProduct);

export default router;