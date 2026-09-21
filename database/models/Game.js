const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    gameType: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    rules: {
      type: [String],
      default: []
    },
    winningConditions: {
      type: [String],
      default: []
    },
    maxPlayers: {
      type: Number,
      default: 2
    },
    scoringPolicy: {
      participation: { type: Number, default: 5 },
      win: { type: Number, default: 20 },
      draw: { type: Number, default: 10 },
      loss: { type: Number, default: 2 }
    },
    createdBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

gameSchema.index({ gameType: 1 }, { unique: true });

module.exports = mongoose.model('Game', gameSchema);
