import { Router } from "express";
import { Card } from "../models/Card";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const card = new Card(req.body);
    const saved = await card.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar carta", details: err });
  }
});

router.get("/", async (_req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

export default router;