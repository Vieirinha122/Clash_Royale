// Média de troféus dos jogadores por nível

import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db";

dotenv.config();

async function avgTrophiesByLevel() {
  await connectDB();

  if (!mongoose.connection.db) {
    throw new Error("Database connection is not initialized.");
  }
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

  console.log("🎯 Média de troféus por nível:");
  resultado.forEach(r => {
    console.log(`Nível ${r._id} → Média de troféus: ${r.avgTrophies.toFixed(2)} (Jogadores: ${r.totalPlayers})`);
  });

  await mongoose.disconnect();
}

avgTrophiesByLevel();
