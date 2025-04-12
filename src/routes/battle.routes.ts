import { Router } from "express";
import { Battle } from "../models/Battle";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const battle = new Battle(req.body);
    const saved = await battle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Erro ao registrar batalha", details: err });
  }
});

router.get("/", async (_req, res) => {
  const battles = await Battle.find()
    .populate("player1.id")
    .populate("player2.id")
    .populate("player1.deckId")
    .populate("player2.deckId")
    .populate("winnerId");
  res.json(battles);
});

export default router;
