import { Schema, model } from "mongoose";

const cardSchema = new Schema({
  name: { type: String, required: true },
  rarity: { type: String, enum: ["comum", "rara", "épica", "lendária"], required: true },
  type: { type: String, required: true },
  damage: Number,
  elixirCost: { type: Number, required: true }
});

export const Card = model("Card", cardSchema);
