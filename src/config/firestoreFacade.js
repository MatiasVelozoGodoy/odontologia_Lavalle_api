// firestoreFacade.js
const db = require("../firebase");
const { Timestamp } = require("firebase-admin/firestore");

// ================================
// Patrón Strategy para fechas
// ================================
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
    if (input instanceof Timestamp) return input;
    if (typeof input === "string" && input.includes("/")) {
      const [day, month, year] = input.split("/");
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
    }
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
  }
}

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

// Estrategia por defecto
const dateContext = new DateContext(new DDMMSYYYYStrategy());

// ================================
// Firestore Facade
// ================================
class FirebaseFacade {
  // Obtener documentos con filtros opcionales
  async getDocuments(collectionName, filters = []) {
    try {
      let query = db.collection(collectionName);
      filters.forEach((f) => {
        query = query.where(f.field, f.operator, f.value);
      });
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error obteniendo documentos de ${collectionName}:`, error);
      throw error;
    }
  }

  // Obtener documento por ID
  async getDocumentById(collectionName, id) {
    try {
      const ref = db.collection(collectionName).doc(id);
      const snap = await ref.get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      console.error(
        `Error obteniendo documento ${id} de ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Crear documento
  async createDocument(collectionName, data) {
    try {
      const processedData = this._processDateFields(data);
      const ref = await db.collection(collectionName).add(processedData);
      return { id: ref.id };
    } catch (error) {
      console.error(`Error creando documento en ${collectionName}:`, error);
      throw error;
    }
  }

  // Actualizar documento
  async updateDocument(collectionName, id, data) {
    try {
      const ref = db.collection(collectionName).doc(id);
      const snap = await ref.get();
      if (!snap.exists)
        return { success: false, message: "Documento no encontrado" };
      const processedData = this._processDateFields(data);
      await ref.update(processedData);
      return { success: true };
    } catch (error) {
      console.error(
        `Error actualizando documento ${id} en ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Eliminación lógica
  async deleteDocument(collectionName, id) {
    try {
      const ref = db.collection(collectionName).doc(id);
      const snap = await ref.get();
      if (!snap.exists)
        return { success: false, message: "Documento no encontrado" };
      await ref.update({ state: false });
      return { success: true };
    } catch (error) {
      console.error(
        `Error eliminando documento ${id} de ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Buscar documento por campo
  async findDocumentByField(collectionName, field, value) {
    try {
      const snapshot = await db
        .collection(collectionName)
        .where(field, "==", value)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error buscando documento en ${collectionName}:`, error);
      throw error;
    }
  }

  // ================================
  // Procesar campos de fecha
  // ================================
  _processDateFields(data) {
    const processed = { ...data };
    const dateFields = [
      "birthDate",
      "expirationDate",
      "createdAt",
      "updatedAt",
    ];
    dateFields.forEach((field) => {
      if (processed[field])
        processed[field] = dateContext.parse(processed[field]);
    });
    return processed;
  }

  // Formatear fechas en salida
  formatDatesInDocument(doc, dateFields = ["birthDate"]) {
    const formatted = { ...doc };
    dateFields.forEach((field) => {
      if (formatted[field])
        formatted[field] = dateContext.format(formatted[field]);
    });
    return formatted;
  }
}

module.exports = { FirebaseFacade: new FirebaseFacade(), dateContext };
