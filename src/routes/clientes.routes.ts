import express from 'express';
var router = express.Router();
import clienteController  from '../controllers/Clientes.controller';
import { isAuthenticated,VerificationRoles } from '../middlewares/isAuthenticated'
router.delete('/ApagarCliente', isAuthenticated, clienteController.deletarCliente);
router.post('/AdicionarCPF', isAuthenticated, clienteController.adiconandoCPF ); // Rota para adicionar CPF a um cliente
router.delete('/DeletarCPF', isAuthenticated, clienteController.deletarCPF );
router.post('/AdicionarNumero', isAuthenticated, clienteController.adiconandoNumero );
router.put('/AtulizarNumero', isAuthenticated, clienteController.atualizarNumero );
router.delete('/DeletarNumero', isAuthenticated, clienteController.deletarNumero )
//router.post('/iniciar-verificacao-telefone', isAuthenticated, clienteController.INVerificacaoTelefone );
//router.post('/confirmar-verificacao-telefone', isAuthenticated, clienteController.CONVerificacaoTelefone );
router.post('/adicionar-cep', isAuthenticated, clienteController.localizacao );
router.put('/atualizar-cep', isAuthenticated, clienteController.atulizarLocalizacao);
router.delete('/delete-cep', isAuthenticated, clienteController.deleteLocalizacao);
router.get('/get-cep', isAuthenticated, clienteController.getLocalizacao);
router.post('/Adicionar-favoritos', isAuthenticated, clienteController.favoritos );
router.get('/favoritos', isAuthenticated, clienteController.GetFavoritos );
router.delete('/Deletar-favoritos', isAuthenticated, clienteController.DeleteFavoritos);
export default router;