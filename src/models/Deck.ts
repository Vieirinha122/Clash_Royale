import { Schema, model, Types } from "mongoose";

const deckSchema = new Schema({
  playerId: { type: Types.ObjectId, ref: "Player", required: true },
  name: String,
  cards: [{ type: Types.ObjectId, ref: "Card" }]
});

export const Deck = model("Deck", deckSchema);
