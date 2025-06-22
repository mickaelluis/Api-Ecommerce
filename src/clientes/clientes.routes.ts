import express from 'express';
var router = express.Router();
import clienteController  from '../controllers/Clientes.controller';
import { isAuthenticated,VerificationRoles } from '../middlewares/isAuthenticated'

router.post('/AdicionarCPF', isAuthenticated, clienteController.adiconandoCPF ); // Rota para adicionar CPF a um cliente
router.post('/AdicionarNumero', isAuthenticated, clienteController.adiconandoNumero );
router.post('/iniciar-verificacao-telefone', isAuthenticated, clienteController.INVerificacaoTelefone );
router.post('/confirmar-verificacao-telefone', isAuthenticated, clienteController.CONVerificacaoTelefone );
router.post('/confirmar-verificacao-cep', isAuthenticated, clienteController.localizacao );
export default router;