/**
 * Database Helper
 * Checks connection state to dynamically delegate between MongoDB and In-Memory persistence.
 */
let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = null;
}

function isMongoConnected() {
  if (!mongoose) return false;
  return mongoose.connection && mongoose.connection.readyState === 1;
}

module.exports = {
  isMongoConnected
};
