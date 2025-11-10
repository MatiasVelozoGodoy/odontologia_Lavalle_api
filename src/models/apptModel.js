const {
  FirebaseFacade: firestoreFacade,
} = require("../config/firestoreFacade");

class AppointmentModel {
  constructor() {
    this.collection = "appointments";
  }

  async getAll() {
    const docs = await firestoreFacade.getDocuments(this.collection);
    return docs.map((d) => ({ id: d.id, ...d.data }));
  }

  async getById(id) {
    const doc = await firestoreFacade.getDocumentById(this.collection, id);
    return doc ? { id, ...doc } : null;
  }

  async getByUser(userId) {
    const docs = await firestoreFacade.getDocuments(this.collection, [
      { field: "userId", operator: "==", value: userId },
    ]);
    return docs.map((d) => ({ id: d.id, ...d.data }));
  }

  async create(data) {
    return await firestoreFacade.createDocument(this.collection, data);
  }

  async update(id, data) {
    return await firestoreFacade.updateDocument(this.collection, id, data);
  }

  async cancel(id) {
    return await firestoreFacade.updateDocument(this.collection, id, {
      state: "cancelado",
    });
  }

  async delete(id) {
    return await firestoreFacade.deleteDocument(this.collection, id);
  }
}

module.exports = new AppointmentModel();
