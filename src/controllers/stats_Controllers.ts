import { Request, Response } from "express";
import { connectDB } from "../config/db";
import mongoose from "mongoose";
import { Battle } from "../models/Battle";
import { Deck } from "../models/Deck";

export async function calcularWinRateCarta(req: Request, res: Response) {
  const cartaNome = req.query.carta as string;

  if (!cartaNome) {
    return res.status(400).json({ error: "O parâmetro 'carta' é obrigatório." });
  }

  await connectDB();

  if (!mongoose.connection.db) {
    return res.status(500).json({ error: "Database connection is not established." });
  }
  const cardInfo = await mongoose.connection.db.collection("cards").findOne({ name: cartaNome });

  if (!cardInfo) {
    return res.status(404).json({ error: `Carta "${cartaNome}" não encontrada.` });
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
    { $unwind: "$player1Deck" },
    { $unwind: "$player2Deck" },
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
    { $match: { resultado: { $in: ["win", "loss"] } } },
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
    return res.json({
      carta: cartaNome,
      message: "Nenhuma batalha encontrada com essa carta.",
      winRate: 0,
      lossRate: 0
    });
  }

  return res.json({
    carta: cartaNome,
    vitorias: totalWins,
    derrotas: totalLosses,
    winRate: ((totalWins / totalGames) * 100).toFixed(2),
    lossRate: ((totalLosses / totalGames) * 100).toFixed(2)
  });
}

export async function listarDecksVitoriosos(req: Request, res: Response) {
  const porcentagemMinima = parseFloat(req.query.porcentagem as string) || 20;

  await connectDB();

  if (!mongoose.connection.db) {
    return res.status(500).json({ error: "Database connection is not established." });
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
    { $unwind: "$total" },
    { $unwind: "$decks" },
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

  res.json({
    decks: resultado.map(deck => ({
      deckId: deck.deckId,
      winRate: deck.winRate.toFixed(2),
      cartas: deck.cards
    }))
  });
    await mongoose.disconnect();
}

  export async function calcularDerrotasPorCombo(req: Request, res: Response) {
    const combo = (req.query.combo as string)?.split(",").map((s) => s.trim());
  
    if (!combo || combo.length < 2) {
      return res.status(400).json({ error: "O parâmetro 'combo' deve conter pelo menos dois nomes de cartas separados por vírgula." });
    }
  
    await connectDB();
  
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Database connection is not established." });
    }
  
    const cardsCollection = mongoose.connection.db.collection("cards");
    const decksCollection = mongoose.connection.db.collection("decks");
    const battlesCollection = mongoose.connection.db.collection("battles");
  
    const cardDocs = await cardsCollection.find({ name: { $in: combo } }).toArray();
    const comboCardIds = cardDocs.map(card => card._id);
  
    if (comboCardIds.length !== combo.length) {
      return res.status(404).json({ error: "Uma ou mais cartas do combo não foram encontradas." });
    }
  
    const resultado = await battlesCollection.aggregate([
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
    ]).toArray();
  
    res.json({
      combo,
      decksDerrotados: resultado
    });
}

export async function decksVenceramContraMaisFortes(req: Request, res: Response) {
    const minDiff = parseFloat(req.query.minDiff as string);
  
    if (isNaN(minDiff)) {
      return res.status(400).json({ error: "Informe um valor de diferença mínima de troféus." });
    }
  
    await connectDB();
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
  
    res.json({
      minDiff,
      decks: resultado
    });
  }

  export async function mediaTempoBatalhaComCartasRaras(req: Request, res: Response) {
    const minRareCards = parseInt(req.query.minRareCards as string);
  
    if (isNaN(minRareCards)) {
      return res.status(400).json({ error: "Parâmetro inválido para cartas raras." });
    }
  
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
  
    res.json({
      mediaTempo: resultado.length ? resultado[0].mediaTempo.toFixed(2) : "Nenhum resultado encontrado"
    });
  }

  export async function avgTrophiesByLevel(req: Request, res: Response) {
    await connectDB();
  
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Conexão com o banco de dados não inicializada." });
    }
  
    try {
      const resultado = await mongoose.connection.db.collection("players").aggregate([
        {
          $group: {
            _id: "$level",
            avgTrophies: { $avg: "$trophies" },
            totalPlayers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
  
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Erro ao calcular média de troféus." });
    } finally {
      await mongoose.disconnect();
    }
  }

  export async function mostUsedCards(req: Request, res: Response) {
    await connectDB();
  
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Conexão com o banco de dados não inicializada." });
    }
  
    try {
      const resultado = await mongoose.connection.db.collection("decks").aggregate([
        { $unwind: "$cards" },
        {
          $group: {
            _id: "$cards",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "cards",
            localField: "_id",
            foreignField: "_id",
            as: "cardInfo"
          }
        },
        { $unwind: "$cardInfo" },
        {
          $project: {
            _id: 0,
            name: "$cardInfo.name",
            count: 1
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();
  
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar cartas mais usadas." });
    } finally {
      await mongoose.disconnect();
    }
  }

  export async function avgBattleDuration(req: Request, res: Response) {
    await connectDB();
  
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Conexão com o banco de dados não inicializada." });
    }
  
    try {
      const resultado = await mongoose.connection.db.collection("battles").aggregate([
        {
          $group: {
            _id: null,
            avgDuration: { $avg: "$durationSec" },
            totalBattles: { $sum: 1 }
          }
        }
      ]).toArray();
  
      if (resultado.length === 0) {
        return res.json({ avgDuration: 0, totalBattles: 0 });
      }
  
      res.json({
        avgDuration: resultado[0].avgDuration,
        totalBattles: resultado[0].totalBattles
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao calcular duração média das batalhas." });
    } finally {
      await mongoose.disconnect();
    }
  }