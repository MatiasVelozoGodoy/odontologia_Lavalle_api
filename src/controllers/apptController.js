const AppointmentModel = require("../models/apptModel");

// 🔹 Obtener los turnos del usuario autenticado
const getByUser = async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId)
      return res.status(401).json({ message: "Usuario no autenticado" });

    console.log("Client ID:", clientId);

    const appointments = await AppointmentModel.getByUser(clientId);

    // 🔹 Enviamos la fecha en formato ISO estándar
    const formatted = appointments.map((a) => ({
      ...a,
      date: a.date?.toDate
        ? a.date.toDate().toISOString()
        : a.date instanceof Date
        ? a.date.toISOString()
        : a.date || null,
    }));

    console.log("Appointments asociados:", formatted);
    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error obteniendo turnos del usuario:", error);
    return res.status(500).json({
      message: "Error obteniendo turnos del usuario",
      error: String(error),
    });
  }
};

// 🔹 Crear un turno nuevo
const createAppointment = async (req, res) => {
  try {
    const data = req.body;
    const newAppt = await AppointmentModel.create(data);
    return res.status(201).json(newAppt);
  } catch (error) {
    console.error("Error creando turno:", error);
    return res.status(500).json({ message: "Error creando turno" });
  }
};

// 🔹 Actualizar turno
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await AppointmentModel.update(id, data);
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error actualizando turno:", error);
    return res.status(500).json({ message: "Error actualizando turno" });
  }
};

// 🔹 Eliminar turno
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AppointmentModel.delete(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error eliminando turno:", error);
    return res.status(500).json({ message: "Error eliminando turno" });
  }
};

module.exports = {
  getByUser,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
