const db = require("../firebase");

const getService = async (state, category, userType) => {
  const allDocsSnapshot = await db.collection("service").get();

  let query = db.collection("service");

  if (state !== undefined) {
    query = query.where("state", "==", state);
  }

  if (category) {
    query = query.where("category", "==", category);
  }

  if (userType === "cliente") {
    query = query.where("state", "==", true);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    return [];
  }

  const services = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      category: data.category,
      image: data.image,
      state: data.state,
      features: data.features || [],
      benefits: data.benefits || [],
    };
  });

  return services;
};

const updateService = async (id, serviceData) => {
  try {
    const doc = db.collection("service").doc(id);

    if (
      serviceData.professional &&
      typeof serviceData.professional === "string"
    )
      serviceData.professional = db.doc(serviceData.professional);

    const snapshot = await doc.get();

    if (!snapshot.exists) {
      return { isOK: false, message: "No se encontro el servicio" };
    }

    await doc.update(serviceData);
    return { isOK: true };
  } catch (error) {
    console.error("Error en serviceModel.updateService:", error);
    return { isOK: false, message: "Error al actualizar el servicio", error };
  }
};

const deleteService = async (id) => {
  const snapshot = await db.collection("service").doc(id).get();
  if (!snapshot.exists)
    return { isOK: false, message: "No se encontró el servicio" };

  const newState = { state: false };

  await db.collection("service").doc(id).update(newState);
  return { isOK: true };
};

const activeService = async (id) => {
  const snapshot = await db.collection("service").doc(id).get();
  if (!snapshot.exists)
    return { isOK: false, message: "No se encontró el servicio" };

  const newState = { state: true };

  await db.collection("service").doc(id).update(newState);
  return { isOK: true };
};

const createService = async (data) => {
  const {
    title,
    description,
    category,
    image,
    benefits = [],
    features = [],
  } = data;

  await db.collection("service").add({
    title,
    description,
    category,
    image,
    benefits,
    features,
    state: true,
  });

  return { isOK: true };
};

module.exports = {
  getService,
  updateService,
  deleteService,
  activeService,
  createService,
};
