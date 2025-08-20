import dotenv from "dotenv";
import { Session } from "inspector/promises";
import mongoose from "mongoose";

dotenv.config();

const uri = process.env.MONGO_URI as string;
if (!uri) {
  console.error("MONGO_URI não definido");
  process.exit(1);
}

export const connectToDb = async (): Promise<void> => {
  try {
    await mongoose.connect(uri); // Mongoose 6+ já usa as opções corretas por padrão
    console.log("Conectado com sucesso ao MongoDB (via mongoose).");
  } catch (error) {
    console.error("Não foi possível conectar ao MongoDB", error);
    process.exit(1);
  }
};

export const getMongoose = (): typeof mongoose => mongoose;

export async function runTransaction<T>(
  fn: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    // @ts-ignore - result inicializado dentro da transação
    return result;
  } finally {
    session.endSession();
  }
}
