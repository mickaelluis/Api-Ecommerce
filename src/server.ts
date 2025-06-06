// src/server.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
// Load env vars
dotenv.config({ path: './.env'});

// App init
const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes (a serem importadas)
app.get('/', (req: Request, res: Response) => {
  res.send('API OK');
});

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
  
