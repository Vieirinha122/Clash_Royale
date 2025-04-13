import mongoose from "mongoose";
import dotenv from "dotenv";

import { connectDB } from "./config/db";
import { Player } from "./models/Player";
import { Card } from "./models/Card";
import { Deck } from "./models/Deck";
import { Battle } from "./models/Battle";

dotenv.config();

async function seedDatabase() {
  await connectDB();
  console.log("🌱 Iniciando seed...");

  try {
    // 🔁 Limpar coleções anteriores
    await Player.deleteMany({});
    await Card.deleteMany({});
    await Deck.deleteMany({});
    await Battle.deleteMany({});

    // 👤 Jogadores
    const player1 = await Player.create({
      nickname: "GuerreiroSombrio",
      gameTime: 2200,
      trophies: 1800,
      level: 10,
    });

    const player2 = await Player.create({
      nickname: "FeiticeiraVermelha",
      gameTime: 1950,
      trophies: 1720,
      level: 9,
    });

    const player3 = await Player.create({
      nickname: "MagoGelo",
      gameTime: 2400,
      trophies: 1900,
      level: 11,
    });

    const player4 = await Player.create({
      nickname: "GiganteReal",
      gameTime: 2100,
      trophies: 1850,
      level: 10,
    });

    // 🃏 Cartas
    const cardsData = [
      { name: "Cavaleiro", rarity: "comum", type: "tropa", damage: 110, elixirCost: 3 },
      { name: "Arqueiras", rarity: "comum", type: "tropa", damage: 95, elixirCost: 3 },
      { name: "Golem de Gelo", rarity: "rara", type: "tropa", damage: 150, elixirCost: 2 },
      { name: "Bola de Fogo", rarity: "rara", type: "feitiço", damage: 250, elixirCost: 4 },
      { name: "Mini P.E.K.K.A", rarity: "rara", type: "tropa", damage: 340, elixirCost: 4 },
      { name: "Mosqueteira", rarity: "comum", type: "tropa", damage: 160, elixirCost: 4 },
      { name: "Torre Inferno", rarity: "épica", type: "estrutura", damage: 40, elixirCost: 5 },
      { name: "Zap", rarity: "comum", type: "feitiço", damage: 75, elixirCost: 2 },
    ];

    const cards = await Card.insertMany(cardsData);

    // 🧩 Decks
    const deck1 = await Deck.create({
      playerId: player1._id,
      name: "Deck Sombra",
      cards: cards.map((card) => card._id),
    });

    const deck2 = await Deck.create({
      playerId: player2._id,
      name: "Deck Vermelho",
      cards: [...cards].reverse().map((card) => card._id),
    });

    const deck3 = await Deck.create({
      playerId: player3._id,
      name: "Deck Gelo",
      cards: [...cards.slice(0, 4), ...cards.slice(4).reverse()].map((card) => card._id),
    });

    const deck4 = await Deck.create({
      playerId: player4._id,
      name: "Deck Real",
      cards: [...cards.slice(2), ...cards.slice(0, 2)].map((card) => card._id),
    });

    // ⚔️ Batalhas
    const battles = [
      {
        player1: {
          id: player1._id,
          deckId: deck1._id,
          towersDestroyed: 3,
          trophiesAtTime: 1800,
        },
        player2: {
          id: player2._id,
          deckId: deck2._id,
          towersDestroyed: 1,
          trophiesAtTime: 1720,
        },
        winnerId: player1._id,
        durationSec: 205,
        createdAt: new Date("2025-04-10T12:00:00Z"),
      },
      {
        player1: {
          id: player3._id,
          deckId: deck3._id,
          towersDestroyed: 2,
          trophiesAtTime: 1900,
        },
        player2: {
          id: player4._id,
          deckId: deck4._id,
          towersDestroyed: 3,
          trophiesAtTime: 1850,
        },
        winnerId: player4._id,
        durationSec: 110,
        createdAt: new Date("2025-04-09T15:00:00Z"),
      },
      {
        player1: {
          id: player2._id,
          deckId: deck2._id,
          towersDestroyed: 3,
          trophiesAtTime: 1730,
        },
        player2: {
          id: player1._id,
          deckId: deck1._id,
          towersDestroyed: 0,
          trophiesAtTime: 1810,
        },
        winnerId: player2._id,
        durationSec: 145,
        createdAt: new Date("2025-04-11T17:30:00Z"),
      },
      {
        player1: {
          id: player3._id,
          deckId: deck3._id,
          towersDestroyed: 3,
          trophiesAtTime: 1920,
        },
        player2: {
          id: player1._id,
          deckId: deck1._id,
          towersDestroyed: 2,
          trophiesAtTime: 1820,
        },
        winnerId: player3._id,
        durationSec: 119,
        createdAt: new Date("2025-04-12T09:45:00Z"),
      },
    ];

    await Battle.insertMany(battles);

    console.log("✅ Seed finalizada com sucesso!");
  } catch (err) {
    console.error("❌ Erro no seed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado do banco.");
  }
}

seedDatabase();
