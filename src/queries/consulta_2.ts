// Liste os decks completos que produziram mais de X% (parâmetro) de 
// vitórias ocorridas em um intervalo de timestamps (parâmetro).

import { connectDB } from "../config/db";
import mongoose from "mongoose";

async function listarDecksVitoriosos() {
  await connectDB();

  const porcentagemMinima = 20; // ⬅️ Altere aqui a porcentagem mínima desejada

  if (!mongoose.connection.db) {
    throw new Error("Database connection is not established.");
  }

  const resultado = await mongoose.connection.db.collection("battles").aggregate([
    {
      $project: {
        winnerId: 1,
        player1: 1,
        player2: 1
      }
    },
    {
      $project: {
        winningDeck: {
          $cond: [
            { $eq: ["$winnerId", "$player1.id"] },
            "$player1.deckId",
            {
              $cond: [
                { $eq: ["$winnerId", "$player2.id"] },
                "$player2.deckId",
                null
              ]
            }
          ]
        }
      }
    },
    {
      $match: { winningDeck: { $ne: null } }
    },
    {
      $group: {
        _id: "$winningDeck",
        wins: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "decks",
        localField: "_id",
        foreignField: "_id",
        as: "deckInfo"
      }
    },
    {
      $unwind: "$deckInfo"
    },
    {
      $project: {
        _id: 0,
        deckId: "$_id",
        cards: "$deckInfo.cards",
        wins: 1
      }
    },
    {
      $facet: {
        total: [
          { $group: { _id: null, totalWins: { $sum: "$wins" } } }
        ],
        decks: [
          { $addFields: {} }
        ]
      }
    },
    {
      $unwind: "$total"
    },
    {
      $unwind: "$decks"
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$decks", { totalWins: "$total.totalWins" }]
        }
      }
    },
    {
      $addFields: {
        winRate: {
          $multiply: [{ $divide: ["$wins", "$totalWins"] }, 100]
        }
      }
    },
    {
      $match: {
        winRate: { $gte: porcentagemMinima }
      }
    },
    {
      $sort: { winRate: -1 }
    }
  ]).toArray();

  console.log("📊 Decks com mais de", porcentagemMinima + "% de vitórias:");
  resultado.forEach(deck => {
    console.log(`- Deck ${deck.deckId}: ${deck.winRate.toFixed(2)}% de vitórias`);
    console.log(`  Cartas: ${deck.cards.map((card: { toString: () => any; }) => card.toString()).join(", ")}`);
  });

  await mongoose.disconnect();
}

listarDecksVitoriosos();
