const db = require("../firebase");

// crear turno pendiente
const createAppointment = async ({
  userId,
  userEmail,
  serviceTitle,
  date,
  time,
}) => {
  const docRef = await db.collection("appointments").add({
    userId,
    userEmail,
    serviceTitle,
    date,
    time,
    status: "pendiente",
    depositUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { isOK: true, id: docRef.id };
};

// obtener turno por ID
const getAppointmentById = async (id) => {
  const doc = await db.collection("appointments").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// actualizar turno (deposito y estado)
const updateAppointment = async (id, updateData) => {
  const ref = db.collection("appointments").doc(id);
  await ref.update({ ...updateData, updatedAt: new Date() });
  return { isOK: true };
};

// listar turnos por usuario
const getAppointmentsByUser = async (userId) => {
  const snapshot = await db
    .collection("appointments")
    .where("userId", "==", userId)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// listar turnos para admins
const getAllAppointments = async () => {
  const snapshot = await db.collection("appointments").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  getAppointmentsByUser,
  getAllAppointments,
};
