import express from 'express';
var router = express.Router();
import authController  from './auth.controller';
    

//rota para registrar um novo usuário  
router.post('/register', authController.register ) 
export default router;