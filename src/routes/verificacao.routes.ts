import express from 'express';
var router = express.Router()
import verificacaoController from '../controllers/verif.controller';
import { isAuthenticated,VerificationRoles } from '../middlewares/isAuthenticated'

router.post('/iniciar-verificacao-telefone', isAuthenticated, verificacaoController.INVerificacaoTelefoneTWILIO ); // Rota para iniciar a verificação do numero de telefone de um cliente       
router.post('/confirmar-verificacao-telefone', isAuthenticated, verificacaoController.CONVerificacaoTelefoneTWILIO );// Rota para confirmar a verificação do numero de telefone de um cliente

export default router;