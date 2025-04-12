import {Schema, model} from 'mongoose';

const playerSchema = new Schema({
    nickname: { type: String, required: true },
    gameTime: { type: Number, default: 0 },
    trophies: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
}); 

export const Player = model('Player', playerSchema);