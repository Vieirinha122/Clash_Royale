import { Router } from "express";
import { Deck } from "../models/Deck";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const deck = new Deck(req.body);
    const saved = await deck.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar deck", details: err });
  }
});

router.get("/", async (_req, res) => {
  const decks = await Deck.find().populate("playerId").populate("cards");
  res.json(decks);
});

export default router;
