// Calcule a quantidade de derrotas utilizando o combo de cartas
//  (X1,X2, ...) (parâmetro) ocorridas em um intervalo de timestamps 
// (parâmetro).


import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Card } from "../models/Card";
import { Deck } from "../models/Deck";
import { Battle } from "../models/Battle";

async function calcularDerrotasPorCombo() {
  await connectDB();
  console.log("📊 Iniciando consulta de derrotas por combo de cartas...");

  const comboCardNames = ["Cavaleiro", "Zap"];

  // 🔍 Buscar os _ids das cartas pelo nome
  const comboCards = await Card.find({ name: { $in: comboCardNames } });
  const comboCardIds = comboCards.map(card => card._id);

  if (comboCardIds.length !== comboCardNames.length) {
    console.error("❌ Algumas cartas do combo não foram encontradas.");
    return;
  }

  const resultado = await Battle.aggregate([
    {
      $project: {
        player1: 1,
        player2: 1,
        loserId: {
          $cond: [
            { $eq: ["$winnerId", "$player1.id"] },
            "$player2.id",
            "$player1.id"
          ]
        },
        loserDeck: {
          $cond: [
            { $eq: ["$winnerId", "$player1.id"] },
            "$player2.deckId",
            "$player1.deckId"
          ]
        }
      }
    },
    {
      $lookup: {
        from: "decks",
        localField: "loserDeck",
        foreignField: "_id",
        as: "loserDeckInfo"
      }
    },
    { $unwind: "$loserDeckInfo" },
    {
      $project: {
        loserDeckId: "$loserDeck",
        loserId: 1,
        cards: "$loserDeckInfo.cards"
      }
    },
    {
      $match: {
        cards: { $all: comboCardIds }
      }
    },
    {
      $group: {
        _id: "$loserDeckId",
        derrotas: { $sum: 1 }
      }
    },
    {
      $sort: { derrotas: -1 }
    }
  ]);

  console.log(`📉 Decks que perderam usando o combo: ${comboCardNames.join(" + ")}`);
  resultado.forEach((deck: any) => {
    console.log(`- Deck ${deck._id} teve ${deck.derrotas} derrota(s) com esse combo.`);
  });

  await mongoose.disconnect();
  console.log("🔌 Consulta finalizada e desconectada.");
}

calcularDerrotasPorCombo();
