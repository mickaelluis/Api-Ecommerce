import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { isAuthenticated, VerificationRoles } from "../middlewares/isAuthenticated";

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);
// Rotas ADMIN:
router.post('/', isAuthenticated, VerificationRoles, ProductController.createProduct);
router.put('/:id', isAuthenticated, VerificationRoles, ProductController.updateProduct);
router.delete('/:id', isAuthenticated, VerificationRoles, ProductController.deleteProduct);
// Rotas de estoque:
router.post('/finalize', isAuthenticated, ProductController.finalizePurchase);
router.post('/restock', isAuthenticated, VerificationRoles, ProductController.restock)
router.post('/reserve', isAuthenticated, ProductController.reserveStock);

export default router;