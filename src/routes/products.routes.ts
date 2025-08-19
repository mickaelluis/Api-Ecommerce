import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { isAuthenticated, VerificationRoles } from "../middlewares/isAuthenticated";
import { StockController } from "../controllers/product.stock.controller";

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);
// Rotas ADMIN:
router.post('/', isAuthenticated, VerificationRoles, ProductController.createProduct);
router.put('/:id', isAuthenticated, VerificationRoles, ProductController.updateProduct);
router.delete('/:id', isAuthenticated, VerificationRoles, ProductController.deleteProduct);
// Rotas de estoque:
router.post('/:productId/stock/finalize', isAuthenticated, StockController.finalizePurchase);
router.post('/:productId/stock/restock', isAuthenticated, VerificationRoles, StockController.restock)
router.post('/:productId/stock/reserve', isAuthenticated, StockController.reserveStock);
router.post('/:productId/stock/release', isAuthenticated, StockController.releaseReservedStock); 

export default router;