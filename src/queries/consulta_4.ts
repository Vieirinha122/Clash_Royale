// Calcule a quantidade de vitórias envolvendo a carta X (parâmetro) nos
// casos em que o vencedor possui Z% (parâmetro) menos troféus do que
// o perdedor, a partida durou menos de 2 minutos, e o perdedor 
// derrubou ao menos duas torres do adversário.


import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Battle } from "../models/Battle";

async function decksQueVenceramContraMaisFortes(minDiff = 50) {
  await connectDB();
  console.log(`📊 Iniciando consulta: Decks que venceram com diferença de troféus ≥ ${minDiff}`);

  const resultado = await Battle.aggregate([
    {
      $project: {
        winnerId: 1,
        durationSec: 1,
        player1: 1,
        player2: 1,
        winnerDeck: {
          $cond: [
            { $eq: ["$winnerId", "$player1.id"] },
            "$player1.deckId",
            "$player2.deckId"
          ]
        },
        winnerTrophies: {
          $cond: [
            { $eq: ["$winnerId", "$player1.id"] },
            "$player1.trophiesAtTime",
            "$player2.trophiesAtTime"
          ]
        },
        loserTrophies: {
          $cond: [
            { $eq: ["$winnerId", "$player1.id"] },
            "$player2.trophiesAtTime",
            "$player1.trophiesAtTime"
          ]
        }
      }
    },
    {
      $addFields: {
        diffTrophies: {
          $subtract: ["$loserTrophies", "$winnerTrophies"]
        }
      }
    },
    {
      $match: {
        diffTrophies: { $gte: minDiff }
      }
    },
    {
      $group: {
        _id: "$winnerDeck",
        vitorias: { $sum: 1 }
      }
    },
    {
      $sort: { vitorias: -1 }
    }
  ]);

  if (resultado.length === 0) {
    console.log("❌ Nenhum deck venceu oponentes com essa diferença de troféus.");
  } else {
    console.log("🏆 Decks que venceram adversários mais fortes:");
    resultado.forEach((deck: any) => {
      console.log(`- Deck ${deck._id} venceu ${deck.vitorias} vez(es) contra oponentes com +${minDiff} troféus.`);
    });
  }

  await mongoose.disconnect();
  console.log("🔌 Consulta finalizada e desconectada.");
}

decksQueVenceramContraMaisFortes(50); // Você pode ajustar o valor aqui
