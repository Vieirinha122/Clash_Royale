import express from "express";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

// Importação as rotas
import playerRoutes from "./routes/player.routes";
import cardRoutes from "./routes/card.routes";
import deckRoutes from "./routes/deck.routes";
import battleRoutes from "./routes/battle.routes";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/players", playerRoutes);
app.use("/cards", cardRoutes);
app.use("/decks", deckRoutes);
app.use("/battles", battleRoutes);

app.get("/", (_req, res) => {
  res.send("🎮 API do jogo no ar!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));
