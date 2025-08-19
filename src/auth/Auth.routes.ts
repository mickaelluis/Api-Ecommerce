import express from 'express';
var router = express.Router();
import authController  from '../controllers/auth.controller';

//rota para registrar um novo usuário  
router.post('/register', authController.register ), 
router.get('/login', authController.login);
export default router;