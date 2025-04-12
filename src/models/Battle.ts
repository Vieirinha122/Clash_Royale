import { Schema, model, Types } from "mongoose";

const battleSchema = new Schema({
  player1: {
    id: { type: Types.ObjectId, ref: "Player", required: true },
    deckId: { type: Types.ObjectId, ref: "Deck" },
    towersDestroyed: Number,
    trophiesAtTime: Number
  },
  player2: {
    id: { type: Types.ObjectId, ref: "Player", required: true },
    deckId: { type: Types.ObjectId, ref: "Deck" },
    towersDestroyed: Number,
    trophiesAtTime: Number
  },
  winnerId: { type: Types.ObjectId, ref: "Player" },
  startTime: { type: Date, default: Date.now },
  durationSec: Number
});

export const Battle = model("Battle", battleSchema);
