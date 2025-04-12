import {Router} from 'express';
import { Player } from '../models/Player';

const router = Router();

router.post("/", async (req, res) => {
    try {
      const player = new Player(req.body);
      const saved = await player.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ error: "Erro ao criar jogador", details: err });
    }
  });
  
  router.get("/", async (_req, res) => {
    const players = await Player.find();
    res.json(players);
  });
  
  export default router;