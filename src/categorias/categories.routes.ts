import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { isAuthenticated, VerificationRoles } from "../middlewares/isAuthenticated";

const router = Router();

router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', isAuthenticated, VerificationRoles, CategoryController.createCategory);
router.put('/:id', isAuthenticated, VerificationRoles, CategoryController.updateCategory);
router.delete('/:id', isAuthenticated, VerificationRoles, CategoryController.deleteCategory);

export default router;