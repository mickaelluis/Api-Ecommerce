import bcrypt from 'bcrypt'
import { promises } from 'dns';
import mongoose from 'mongoose'
import { Document } from 'mongoose';

//Define como sera salvo os dados do usuario no MongoDB '
let userSchema = new mongoose.Schema({
    name: { type: String, required: true} ,
    email: { type: String, required: true, unique:true },
    password: { type: String, required: true,   },
    role: { type: String, default: 'Clients' }, // 'admin' or 'user'
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },}) 


// Interface para o usuário, que estende o documento do Mongoose
// Isso define a estrutura do documento do usuário no MongoDB e adiciona métodos para comparar senhas 
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    comparePassword(password: string): Promise<boolean>;
}

// pré-salvamento para fazer o hash da senha antes de salvar no banco de dados
userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew ) { // Verifica se a senha foi modificada ou é nova
        try {
            const salt = await bcrypt.genSalt(10); // Gera um salt para o hash 'salt e um valor aleatório adicionado à senha antes de fazer o hash'
            this.password = await bcrypt.hash(this.password, salt); // Faz o hash da senha   
            next()
        } catch (error) {
        next( error as Error ); // Passa o erro para o próximo middleware
    } 
     }else {
        next() // Se a senha não foi modificada, apenas chama o próximo middleware
}
 }),

userSchema.methods.comparePassword = async function ( password: any ): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
};
     
export default mongoose.model('User', userSchema) // Exporta o modelo User para ser usado em outras partes do aplicativo

