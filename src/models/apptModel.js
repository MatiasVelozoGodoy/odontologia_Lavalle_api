const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

class AppointmentModel {
  constructor() {
    this.collection = db.collection("appointments");
  }

  // 🔹 Obtener todos los turnos de un usuario específico
  async getByUser(clientId) {
    const snapshot = await this.collection
      .where("clientId", "==", clientId)
      .get();
    if (snapshot.empty) return [];

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return appointments;
  }

  // 🔹 Obtener todos los turnos
  async getAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // 🔹 Obtener turno por ID
  async getById(id) {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  // 🔹 Crear nuevo turno
  async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date(),
    });
    const created = await docRef.get();
    return { id: docRef.id, ...created.data() };
  }

  // 🔹 Actualizar turno
  async update(id, data) {
    await this.collection.doc(id).update(data);
    const updated = await this.getById(id);
    return updated;
  }

  // 🔹 Eliminar turno
  async delete(id) {
    await this.collection.doc(id).delete();
    return { id };
  }
}

module.exports = new AppointmentModel();
