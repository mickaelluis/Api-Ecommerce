import express from 'express';
var router = express.Router();
import clienteController  from '../controllers/Clientes.controller';
import { isAuthenticated,VerificationRoles } from '../middlewares/isAuthenticated'

router.post('/criar', isAuthenticated, VerificationRoles, clienteController.criarCliente );

export default router;