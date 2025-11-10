const db = require("../firebase");
const { Timestamp } = require("firebase-admin/firestore");

// Convierte Timestamp a DD/MM/YYYY
function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return null;
  const date = timestamp.toDate();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Convierte DD/MM/YYYY o cualquier string de fecha a Timestamp
function parseDate(input) {
  if (!input) return null;

  // Si ya es un Timestamp, retornarlo
  if (input instanceof Timestamp) return input;

  // Si es formato DD/MM/YYYY
  if (typeof input === "string" && input.includes("/")) {
    const [day, month, year] = input.split("/");
    const date = new Date(Number(year), Number(month) - 1, Number(day)); // hora local
    if (!isNaN(date.getTime())) {
      return Timestamp.fromDate(date);
    }
  }

  // Intento genérico
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
}

class FirebaseFacade {
  // Obtener documentos de una colección con filtros opcionales
  async getDocuments(collectionName, filters = []) {
    try {
      let query = db.collection(collectionName);

      // Aplicar filtros dinámicamente
      filters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error obteniendo documentos de ${collectionName}:`, error);
      throw error;
    }
  }

  // Obtener un documento por ID
  async getDocumentById(collectionName, id) {
    try {
      const ref = db.collection(collectionName).doc(id);
      const snap = await ref.get();

      if (!snap.exists) return null;

      return {
        id: snap.id,
        ...snap.data(),
      };
    } catch (error) {
      console.error(
        `Error obteniendo documento ${id} de ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Crear un nuevo documento
  async createDocument(collectionName, data) {
    try {
      // Convertir fechas antes de guardar
      const processedData = this._processDateFields(data);
      const ref = await db.collection(collectionName).add(processedData);
      return { id: ref.id };
    } catch (error) {
      console.error(`Error creando documento en ${collectionName}:`, error);
      throw error;
    }
  }

  // Actualizar un documento existente
  async updateDocument(collectionName, id, data) {
    try {
      const ref = db.collection(collectionName).doc(id);
      const snap = await ref.get();

      if (!snap.exists)
        return { success: false, message: "Documento no encontrado" };

      // Convertir fechas antes de actualizar
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

  // Eliminar un documento (eliminación lógica)
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

  // Buscar un documento por un campo específico
  async findDocumentByField(collectionName, field, value) {
    try {
      const snapshot = await db
        .collection(collectionName)
        .where(field, "==", value)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error(`Error buscando documento en ${collectionName}:`, error);
      throw error;
    }
  }

  // Procesar campos de fecha en el objeto
  _processDateFields(data) {
    const processed = { ...data };

    // Campos conocidos que son fechas
    const dateFields = [
      "birthDate",
      "expirationDate",
      "createdAt",
      "updatedAt",
    ];

    dateFields.forEach((field) => {
      if (processed[field]) {
        processed[field] = parseDate(processed[field]);
      }
    });

    return processed;
  }

  // Formatear fechas en el objeto de salida
  formatDatesInDocument(doc, dateFields = ["birthDate"]) {
    const formatted = { ...doc };

    dateFields.forEach((field) => {
      if (formatted[field]) {
        formatted[field] = formatDate(formatted[field]);
      }
    });

    return formatted;
  }
}

module.exports = new FirebaseFacade();
