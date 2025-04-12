import express from "express";
import { connectDB } from "./config/db";

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("API do Jogo Rodando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
