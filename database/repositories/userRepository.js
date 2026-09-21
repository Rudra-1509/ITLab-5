const User = require('../models/User');

class UserRepository {
  async createUser(data) {
    const payload = {
      id: data.id || `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      credits: data.credits ?? 0,
      totalGames: data.totalGames ?? 0,
      wins: data.wins ?? 0,
      losses: data.losses ?? 0,
      draws: data.draws ?? 0
    };

    const user = await User.create(payload);
    return user.toObject();
  }

  async findByEmail(email) {
    if (!email) return null;
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).lean();
    return user ? this.serialize(user) : null;
  }

  async findByUsername(username) {
    if (!username) return null;
    const user = await User.findOne({ username: String(username).trim() }).lean();
    return user ? this.serialize(user) : null;
  }

  async findById(id) {
    if (!id) return null;
    const user = await User.findOne({ id }).lean();
    return user ? this.serialize(user) : null;
  }

  async updateUser(id, data) {
    const user = await User.findOneAndUpdate(
      { id },
      {
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    ).lean();

    return user ? this.serialize(user) : null;
  }

  async updateStats(id, stats) {
    const inc = {};

    if (stats.credits !== undefined) inc.credits = Number(stats.credits);
    if (stats.totalGames !== undefined) inc.totalGames = Number(stats.totalGames);
    if (stats.wins !== undefined) inc.wins = Number(stats.wins);
    if (stats.losses !== undefined) inc.losses = Number(stats.losses);
    if (stats.draws !== undefined) inc.draws = Number(stats.draws);

    const user = await User.findOneAndUpdate(
      { id },
      {
        $inc: inc,
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).lean();

    return user ? this.serialize(user) : null;
  }

  async incrementCredits(id, amount) {
    const user = await User.findOneAndUpdate(
      { id },
      { $inc: { credits: Number(amount || 0) } },
      { new: true }
    ).lean();

    return user ? this.serialize(user) : null;
  }

  async incrementWin(id) {
    const user = await User.findOneAndUpdate(
      { id },
      {
        $inc: { wins: 1, totalGames: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).lean();

    return user ? this.serialize(user) : null;
  }

  async incrementLoss(id) {
    const user = await User.findOneAndUpdate(
      { id },
      {
        $inc: { losses: 1, totalGames: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).lean();

    return user ? this.serialize(user) : null;
  }

  async incrementDraw(id) {
    const user = await User.findOneAndUpdate(
      { id },
      {
        $inc: { draws: 1, totalGames: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).lean();

    return user ? this.serialize(user) : null;
  }

  async incrementTotalGames(id) {
    const user = await User.findOneAndUpdate(
      { id },
      { $inc: { totalGames: 1 } },
      { new: true }
    ).lean();

    return user ? this.serialize(user) : null;
  }

  async getLeaderboard() {
    const users = await User.find({}).sort({ credits: -1, wins: -1, totalGames: -1 }).lean();
    return users.map(user => this.serialize(user));
  }

  serialize(user) {
    if (!user) return null;
    const serialized = { ...user };
    if (serialized.id === undefined && serialized._id) {
      serialized.id = serialized._id.toString();
    }
    delete serialized._id;
    delete serialized.__v;
    return serialized;
  }
}

module.exports = new UserRepository();
