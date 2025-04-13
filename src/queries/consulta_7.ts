//Cartas mais usadas em todos os decks

import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db";

dotenv.config();

async function mostUsedCards() {
  await connectDB();

  if (!mongoose.connection.db) {
    throw new Error("Database connection is not established.");
  }
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

  console.log("🃏 Cartas mais usadas em decks:");
  resultado.forEach(c => {
    console.log(`- ${c.name}: usada em ${c.count} decks`);
  });

  await mongoose.disconnect();
}

mostUsedCards();
