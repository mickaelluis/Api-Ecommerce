import express from 'express';
var router = express.Router();
import clienteController  from '../controllers/Clientes.controller';
import { isAuthenticated,VerificationRoles } from '../middlewares/isAuthenticated'
router.get('/',isAuthenticated, VerificationRoles, clienteController.getClientes);
router.delete('/ApagarCliente', isAuthenticated, clienteController.deletarCliente);// Rota para deletar um cliente
router.post('/AdicionarCPF', isAuthenticated, clienteController.adiconandoCPF ); // Rota para adicionar CPF a um cliente
router.delete('/DeletarCPF', isAuthenticated, clienteController.deletarCPF );// Rota para deletar o CPF de um cliente
router.post('/AdicionarNumero', isAuthenticated, clienteController.adiconandoNumero );// Rota para adicionar o numero de telefone a um cliente
router.put('/AtulizarNumero', isAuthenticated, clienteController.atualizarNumero );// Rota para atualizar o numero de telefone de um cliente
router.delete('/DeletarNumero', isAuthenticated, clienteController.deletarNumero )// Rota para deletar o numero de telefone de um cliente   
//router.post('/iniciar-verificacao-telefone', isAuthenticated, clienteController.INVerificacaoTelefone ); // Rota para iniciar a verificação do numero de telefone de um cliente       
//router.post('/confirmar-verificacao-telefone', isAuthenticated, clienteController.CONVerificacaoTelefone );// Rota para confirmar a verificação do numero de telefone de um cliente
router.post('/adicionar-cep', isAuthenticated, clienteController.localizacao );// Rota para adicionar o cep de um cliente
router.put('/atualizar-cep', isAuthenticated, clienteController.atulizarLocalizacao);// Rota para atualizar o cep de um cliente
router.delete('/delete-cep', isAuthenticated, clienteController.deleteLocalizacao);// Rota para deletar o cep de um cliente     
router.get('/get-cep', isAuthenticated, clienteController.getLocalizacao);// Rota para pegar o cep de um cliente    
router.post('/Adicionar-favoritos', isAuthenticated, clienteController.favoritos );// Rota para adicionar um produto aos favoritos de um cliente
router.get('/favoritos', isAuthenticated, clienteController.GetFavoritos );// Rota para pegar os produtos favoritos de um cliente
router.delete('/Deletar-favoritos', isAuthenticated, clienteController.DeleteFavoritos);// Rota para deletar um produto dos favoritos de um cliente
export default router;