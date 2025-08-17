// src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectToDb } from "./database/database";
// Load env vars
dotenv.config({ path: "./.env" });

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
app.use(morgan("dev"));

// Mongo Connection
const startServer = async () => {
  try {
    await connectToDb();

    // importe rotas APÓS a conexão com o DB
    const routerAuth = (await import("./auth/Auth.routes")).default;
    const productRoutes = (await import("./produtos/Produtos")).default;
    const clientesRoutes = (await import("./routes/clientes.routes")).default;

    app.use("/users", routerAuth);
    app.use("/", routerAuth);
    app.use("/produtos", productRoutes);
    app.use("/clientes", clientesRoutes);

    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (err) {
    console.error("Erro ao iniciar aplicação:", err);
    process.exit(1);
  }
};

startServer();

// exemplo curto de graceful shutdown
process.on("SIGINT", async () => {
  console.log("Fechando servidor...");
  await (await import("mongoose")).disconnect();
  process.exit(0);
});
