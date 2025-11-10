// dateStrategy.js
const { Timestamp } = require("firebase-admin/firestore");

class DateStrategy {
  format(timestamp) {
    throw new Error("Implementar format");
  }
  parse(input) {
    throw new Error("Implementar parse");
  }
}

class DDMMSYYYYStrategy extends DateStrategy {
  format(timestamp) {
    if (!timestamp || !timestamp.toDate) return null;
    const date = timestamp.toDate();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  parse(input) {
    if (!input) return null;
    const [day, month, year] = input.split("/");
    const date = new Date(`${year}-${month}-${day}`);
    return isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
  }
}

class ISODateStrategy extends DateStrategy {
  format(timestamp) {
    if (!timestamp || !timestamp.toDate) return null;
    return timestamp.toDate().toISOString().split("T")[0];
  }

  parse(input) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
  }
}

// Contexto para usar la estrategia
class DateContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  format(timestamp) {
    return this.strategy.format(timestamp);
  }

  parse(input) {
    return this.strategy.parse(input);
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }
}

module.exports = { DDMMSYYYYStrategy, ISODateStrategy, DateContext };
