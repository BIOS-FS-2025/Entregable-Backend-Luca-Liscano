import { MongoClient } from "mongodb";

const mongoUrl = process.env.DATABASE_URL;
const client = new MongoClient(mongoUrl);

let db; // variable db

export async function connectDB() {
  if (db) return db; // si ya existe la conexion, retornala

  try {
    await client.connect(); // metodo para conectar al servidor de MongoDB
    console.log("Connected to MongoDB");
    db = client.db(); // selecciona la base de datos por defecto
    return db; // retorna la conexion
  } catch (error) {
    console.error("Error connecting to the database", error); // loguea el error
    process.exit(1); // termina la aplicacion
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized"); // si no hay conexion, lanza un error
  }
  return db; // retorna la conexion
}
