import authService from '../services/auth.service';


// Defina o controller como um objeto
const register = async ( req: any, res: any ) => {
   try { 
            const result = await authService.register(req.body); // Chama o serviço de autenticação para registrar o usuário
            if ('data' in result) { // Verifica se o resultado contém dados
                return res.status(result.status).json(result.data);
            } else { // Se não houver dados, retorna uma mensagem de erro
                return res.status(result.status).json({ message: result.message });
            }
        } catch (error) { // Trata erros inesperados
             console.error('Error logging in user:', error); // Exibe o erro no console para depuração
             // Retorna um erro genérico em caso de falha
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
};

const login = async (req: any, res: any) => {
    try {
            const result = await authService.login(req.body); //recebe os dados do cliente e guarda na constante rasult
          if (result.Authorization){ // Verifica se o resultado contém o token de autorização
                // Se o token de autorização estiver presente, retorna o status e o token
                return res.status(result?.status).json(result?.Authorization)  
            }else { // Se não houver token, retorna uma mensagem de erro
                return res.status(result.status).json({ message: result.message });
        }             
    } catch (error) { // Trata erros inesperados
        console.error('Error logging in user:', error); // Exibe o erro no console para depuração
        // Retorna um erro genérico em caso de falha
        return res.status(500).json({ message: 'Erro interno do servidor. ' });
    }
}

const authController = {register, login} // Exporta o controller como um objeto com a função register
 
export default authController;   