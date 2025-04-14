// Calcule a porcentagem de vitórias e derrotas utilizando a carta X 
// (parâmetro) ocorridas em um intervalo de timestamps (parâmetro).

import { connectDB } from "../config/db";
import mongoose from "mongoose";

async function calcularWinRateCarta(cartaNome: string) {
  await connectDB();

  if (!mongoose.connection.db) {
    throw new Error("Database connection is not established.");
  }

  const cardInfo = await mongoose.connection.db.collection("cards").findOne({ name: cartaNome });

  if (!cardInfo) {
    console.log(`❌ Carta "${cartaNome}" não encontrada.`);
    await mongoose.disconnect();
    return;
  }

  const cardId = cardInfo._id;

  const resultado = await mongoose.connection.db.collection("battles").aggregate([
    {
      $match: {
        $or: [
          { "player1.deckId": { $ne: null } },
          { "player2.deckId": { $ne: null } }
        ]
      }
    },
    {
      $lookup: {
        from: "decks",
        localField: "player1.deckId",
        foreignField: "_id",
        as: "player1Deck"
      }
    },
    {
      $lookup: {
        from: "decks",
        localField: "player2.deckId",
        foreignField: "_id",
        as: "player2Deck"
      }
    },
    {
      $unwind: "$player1Deck"
    },
    {
      $unwind: "$player2Deck"
    },
    {
      $project: {
        winnerId: 1,
        player1: 1,
        player2: 1,
        player1UsouCarta: { $in: [cardId, "$player1Deck.cards"] },
        player2UsouCarta: { $in: [cardId, "$player2Deck.cards"] }
      }
    },
    {
      $project: {
        resultado: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $eq: ["$winnerId", "$player1.id"] },
                    { $eq: ["$player1UsouCarta", true] }
                  ]
                },
                then: "win"
              },
              {
                case: {
                  $and: [
                    { $ne: ["$winnerId", "$player1.id"] },
                    { $eq: ["$player1UsouCarta", true] }
                  ]
                },
                then: "loss"
              },
              {
                case: {
                  $and: [
                    { $eq: ["$winnerId", "$player2.id"] },
                    { $eq: ["$player2UsouCarta", true] }
                  ]
                },
                then: "win"
              },
              {
                case: {
                  $and: [
                    { $ne: ["$winnerId", "$player2.id"] },
                    { $eq: ["$player2UsouCarta", true] }
                  ]
                },
                then: "loss"
              }
            ],
            default: "none"
          }
        }
      }
    },
    {
      $match: {
        resultado: { $in: ["win", "loss"] }
      }
    },
    {
      $group: {
        _id: "$resultado",
        total: { $sum: 1 }
      }
    }
  ]).toArray();

  const totalWins = resultado.find((r) => r._id === "win")?.total || 0;
  const totalLosses = resultado.find((r) => r._id === "loss")?.total || 0;
  const totalGames = totalWins + totalLosses;

  if (totalGames === 0) {
    console.log(`⚠️ Nenhuma batalha encontrada com a carta "${cartaNome}".`);
  } else {
    const winRate = (totalWins / totalGames) * 100;
    const lossRate = (totalLosses / totalGames) * 100;

    console.log(`📊 Carta: ${cartaNome}`);
    console.log(`- Vitórias: ${totalWins}`);
    console.log(`- Derrotas: ${totalLosses}`);
    console.log(`✅ Win Rate: ${winRate.toFixed(2)}%`);
    console.log(`❌ Loss Rate: ${lossRate.toFixed(2)}%`);
  }

  await mongoose.disconnect();
}

calcularWinRateCarta("Zap");

// ABAIXO SCRIPT DE CADA CONSULTA PARA RODAR NO SHELL DO MONGODB

// // Substitua pelo nome da carta que você quer analisar
// const cartaNome = "Zap";

// // 1. Buscar o _id da carta
// const carta = db.cards.findOne({ name: cartaNome });

// if (!carta) {
//   print(`❌ Carta "${cartaNome}" não encontrada.`);
// } else {
//   const cardId = carta._id;

//   // 2. Rodar o aggregation
//   const resultado = db.battles.aggregate([
//     {
//       $match: {
//         $or: [
//           { "player1.deckId": { $ne: null } },
//           { "player2.deckId": { $ne: null } }
//         ]
//       }
//     },
//     {
//       $lookup: {
//         from: "decks",
//         localField: "player1.deckId",
//         foreignField: "_id",
//         as: "player1Deck"
//       }
//     },
//     {
//       $lookup: {
//         from: "decks",
//         localField: "player2.deckId",
//         foreignField: "_id",
//         as: "player2Deck"
//       }
//     },
//     { $unwind: "$player1Deck" },
//     { $unwind: "$player2Deck" },
//     {
//       $project: {
//         winnerId: 1,
//         player1: 1,
//         player2: 1,
//         player1UsouCarta: { $in: [cardId, "$player1Deck.cards"] },
//         player2UsouCarta: { $in: [cardId, "$player2Deck.cards"] }
//       }
//     },
//     {
//       $project: {
//         resultado: {
//           $switch: {
//             branches: [
//               {
//                 case: {
//                   $and: [
//                     { $eq: ["$winnerId", "$player1.id"] },
//                     { $eq: ["$player1UsouCarta", true] }
//                   ]
//                 },
//                 then: "win"
//               },
//               {
//                 case: {
//                   $and: [
//                     { $ne: ["$winnerId", "$player1.id"] },
//                     { $eq: ["$player1UsouCarta", true] }
//                   ]
//                 },
//                 then: "loss"
//               },
//               {
//                 case: {
//                   $and: [
//                     { $eq: ["$winnerId", "$player2.id"] },
//                     { $eq: ["$player2UsouCarta", true] }
//                   ]
//                 },
//                 then: "win"
//               },
//               {
//                 case: {
//                   $and: [
//                     { $ne: ["$winnerId", "$player2.id"] },
//                     { $eq: ["$player2UsouCarta", true] }
//                   ]
//                 },
//                 then: "loss"
//               }
//             ],
//             default: "none"
//           }
//         }
//       }
//     },
//     {
//       $match: {
//         resultado: { $in: ["win", "loss"] }
//       }
//     },
//     {
//       $group: {
//         _id: "$resultado",
//         total: { $sum: 1 }
//       }
//     }
//   ]).toArray();

//   const totalWins = resultado.find(r => r._id === "win")?.total || 0;
//   const totalLosses = resultado.find(r => r._id === "loss")?.total || 0;
//   const total = totalWins + totalLosses;

//   if (total === 0) {
//     print(`⚠️ Nenhuma batalha encontrada com a carta "${cartaNome}".`);
//   } else {
//     const winRate = (totalWins / total) * 100;
//     const lossRate = (totalLosses / total) * 100;

//     print(`📊 Carta: ${cartaNome}`);
//     print(`- Vitórias: ${totalWins}`);
//     print(`- Derrotas: ${totalLosses}`);
//     print(`✅ Win Rate: ${winRate.toFixed(2)}%`);
//     print(`❌ Loss Rate: ${lossRate.toFixed(2)}%`);
//   }
// }
