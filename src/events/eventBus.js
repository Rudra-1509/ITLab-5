/**
 * Central Event Bus using Node.js EventEmitter
 * Implements internal Event-Driven Architecture (EDA).
 */
const EventEmitter = require('events');

class ApplicationEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase limit to avoid warnings in busy systems
    this.setMaxListeners(50);
  }

  emit(event, payload) {
    console.log(`[EventBus] Emitted: ${event}`, payload ? JSON.stringify(payload) : '');
    return super.emit(event, payload);
  }
}

const eventBus = new ApplicationEventBus();

module.exports = eventBus;
