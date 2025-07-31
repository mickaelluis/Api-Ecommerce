// src/server.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
// Load env vars
dotenv.config({ path: './.env'});

// App init
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
import routerAuth from './auth/Auth.routes';
import productRoutes from './produtos/products'
import categoryRoutes from './categorias/categories'
import clientesRoutes from './clientes/clientes.routes'

/* Middleware
declare global {
  namespace Express {
    interface Request {
      user?: any; // usado no middleware auth para incluir payload JWT
    }
  }
}*/

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// app.use(session({
  
// }))

// Routes (a serem importadas)
app.use('/users', routerAuth);
app.use('/', routerAuth);
app.use('/produtos', productRoutes);
app.use('/clientes', clientesRoutes)
app.use('/categorias', categoryRoutes)

// Mongo Connection
mongoose.connect(process.env.MONGO_URI || '', {
})
  .then(() => {
    console.log('MongoDB conectado.');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB:', err);
    process.exit(1);
  }); 
  
