const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      default: '',
      trim: true
    },
    symbol: {
      type: String,
      default: null,
      trim: true
    }
  },
  { _id: false }
);

const moveSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true
    },
    symbol: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const gameHistorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    roomId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    gameId: {
      type: String,
      required: true,
      trim: true
    },
    gameType: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    players: {
      type: [playerSchema],
      default: []
    },
    winnerId: {
      type: String,
      default: null
    },
    result: {
      type: String,
      enum: ['WIN', 'DRAW'],
      required: true
    },
    moves: {
      type: [moveSchema],
      default: []
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false,
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

gameHistorySchema.index({ 'players.userId': 1 });
gameHistorySchema.index({ completedAt: -1 });
gameHistorySchema.index({ gameType: 1, completedAt: -1 });

module.exports = mongoose.model('GameHistory', gameHistorySchema);
