import express from 'express';
var router = express.Router();
import authController  from '../controllers/auth.controller';
import { isAuthenticated,VerificationRoles } from '../middlewares/isAuthenticated'

//rota para registrar um novo usuário  
router.post('/register', authController.register ) 
router.get('/login', authController.login)
router.get('/FsModaModesta', isAuthenticated, VerificationRoles,  (req, res) => {
res.json({ message: 'Acesso autorizado!' })});
export default router;