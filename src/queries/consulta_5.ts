// Liste o combo de cartas (eg: carta 1, carta 2, carta 3... carta n) de
// tamanho N (parâmetro) que produziram mais de Y% (parâmetro) de 
// vitórias ocorridas em um intervalo de timestamps (parâmetro).



import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Battle } from "../models/Battle";
import { Deck } from "../models/Deck";
import { Card } from "../models/Card";

async function mediaTempoBatalhaComCartasRaras(minRareCards = 2) {
  await connectDB();
  console.log(`📊 Iniciando consulta: Média de tempo de batalha para decks com ≥ ${minRareCards} cartas raras`);

  // Encontrar decks que possuem pelo menos minRareCards cartas raras
  const decksComCartasRaras = await Deck.aggregate([
    {
      $lookup: {
        from: "cards",
        localField: "cards",
        foreignField: "_id",
        as: "cardsInfo"
      }
    },
    {
      $addFields: {
        rareCardsCount: {
          $size: {
            $filter: {
              input: "$cardsInfo",
              as: "card",
              cond: { $eq: ["$$card.rarity", "rara"] }
            }
          }
        }
      }
    },
    {
      $match: {
        rareCardsCount: { $gte: minRareCards }
      }
    },
    {
      $project: {
        _id: 1, // Deck ID
        rareCardsCount: 1
      }
    }
  ]);

  // Coletar as batalhas desses decks
  const deckIds = decksComCartasRaras.map((deck: any) => deck._id);

  const resultado = await Battle.aggregate([
    {
      $match: {
        $or: [
          { "player1.deckId": { $in: deckIds } },
          { "player2.deckId": { $in: deckIds } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        totalBatalhas: { $sum: 1 },
        totalTempo: { $sum: "$durationSec" }
      }
    },
    {
      $project: {
        mediaTempo: { $divide: ["$totalTempo", "$totalBatalhas"] }
      }
    }
  ]);

  if (resultado.length === 0) {
    console.log("❌ Nenhum deck com as cartas raras suficientes foi encontrado.");
  } else {
    console.log(`⏱️ Média de tempo de batalha para decks com ≥ ${minRareCards} cartas raras: ${resultado[0].mediaTempo.toFixed(2)} segundos.`);
  }

  await mongoose.disconnect();
  console.log("🔌 Consulta finalizada e desconectada.");
}

mediaTempoBatalhaComCartasRaras(2); // Você pode ajustar o valor aqui

// ABAIXO SCRIPT DE CADA CONSULTA PARA RODAR NO SHELL DO MONGODB

// // Defina o número mínimo de cartas raras por deck

// const minRareCards = 2;
// // Passo 1: encontrar os _id dos decks com pelo menos N cartas raras
// const decksComCartasRaras = db.decks.aggregate([
//   {
//     $lookup: {
//       from: "cards",
//       localField: "cards",
//       foreignField: "_id",
//       as: "cardsInfo"
//     }
//   },
//   {
//     $addFields: {
//       rareCardsCount: {
//         $size: {
//           $filter: {
//             input: "$cardsInfo",
//             as: "card",
//             cond: { $eq: ["$$card.rarity", "rara"] }
//           }
//         }
//       }
//     }
//   },
//   {
//     $match: {
//       rareCardsCount: { $gte: minRareCards }
//     }
//   },
//   {
//     $project: {
//       _id: 1
//     }
//   }
// ]).toArray();

// const deckIds = decksComCartasRaras.map(deck => deck._id);

// // Passo 2: buscar batalhas com esses decks e calcular média de tempo
// const resultado = db.battles.aggregate([
//   {
//     $match: {
//       $or: [
//         { "player1.deckId": { $in: deckIds } },
//         { "player2.deckId": { $in: deckIds } }
//       ]
//     }
//   },
//   {
//     $group: {
//       _id: null,
//       totalBatalhas: { $sum: 1 },
//       totalTempo: { $sum: "$durationSec" }
//     }
//   },
//   {
//     $project: {
//       mediaTempo: { $divide: ["$totalTempo", "$totalBatalhas"] }
//     }
//   }
// ]).toArray();

// if (resultado.length === 0) {
//   print("❌ Nenhum deck com as cartas raras suficientes foi encontrado.");
// } else {
//   print(`⏱️ Média de tempo de batalha para decks com ≥ ${minRareCards} cartas raras: ${resultado[0].mediaTempo.toFixed(2)} segundos.`);
// }
