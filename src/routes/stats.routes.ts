import express from "express";
import { calcularWinRateCarta, listarDecksVitoriosos, calcularDerrotasPorCombo, 
         decksVenceramContraMaisFortes, mediaTempoBatalhaComCartasRaras, avgTrophiesByLevel, 
         mostUsedCards,avgBattleDuration} 
         from "../controllers/stats_Controllers";

const router = express.Router();

router.get("/winrate-carta", calcularWinRateCarta);
router.get("/decks-vitoriosos", listarDecksVitoriosos);
router.get("/derrotas-por-combo", calcularDerrotasPorCombo);
router.get("/decks-vitoriosos-contra-mais-fortes", decksVenceramContraMaisFortes);
router.get("/media-tempo-batalha", mediaTempoBatalhaComCartasRaras);
router.get("/avg-trophies-by-level", avgTrophiesByLevel);
router.get("/most-used-cards", mostUsedCards);
router.get("/avg-battle-duration", avgBattleDuration);




export default router;
