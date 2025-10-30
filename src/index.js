import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { debugMorgan } from "./utils/debugger.js";
import routes from "./routes/routes.js";
import {connectDB } from "./db.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morgan.token("body", (req) => JSON.stringify(req.body));

if (process.env.NODE_ENV === "development") {
  app.use(morgan(debugMorgan));
}

app.use("/api", routes);  // prefijo /api a todas las rutas

async function initialize() {
  await connectDB(); // espera a que se conecte a la base de datos
  app.listen(PORT, () => {
    console.log(`Server is running on port http://${HOST}:${PORT}`);
  });
}

initialize();
