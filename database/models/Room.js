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
      required: true,
      trim: true
    },
    symbol: {
      type: String,
      default: null
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
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
      unique: true,
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
      trim: true
    },
    creatorId: {
      type: String,
      required: true,
      trim: true
    },
    players: {
      type: [playerSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'WAITING'
    },
    board: {
      type: [mongoose.Schema.Types.Mixed],
      default: () => Array(9).fill(null)
    },
    currentTurn: {
      type: String,
      default: 'X'
    },
    winnerId: {
      type: String,
      default: null
    },
    winnerSymbol: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret.id || ret.roomId || ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret.id || ret.roomId || ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

roomSchema.index({ status: 1, gameType: 1, createdAt: -1 });
roomSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Room', roomSchema);
