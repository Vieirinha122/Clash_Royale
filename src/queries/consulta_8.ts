// Duração média das batalhas

import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db";


dotenv.config();

async function avgBattleDuration() {
  await connectDB();

  if (!mongoose.connection.db) {
    throw new Error("Database connection is not established.");
  }
  const resultado = await mongoose.connection.db.collection("battles").aggregate([
    {
      $group: {
        _id: null,
        avgDuration: { $avg: "$durationSec" },
        totalBattles: { $sum: 1 }
      }
    }
  ]).toArray();

  const dur = resultado[0];
  console.log(`⏱️ Duração média das batalhas: ${dur.avgDuration.toFixed(2)} segundos (Total: ${dur.totalBattles} batalhas)`);

  await mongoose.disconnect();
}

avgBattleDuration();
