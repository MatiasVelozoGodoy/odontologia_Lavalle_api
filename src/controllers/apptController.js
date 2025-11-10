const { Timestamp } = require("firebase-admin/firestore");
const AppointmentModel = require("../models/apptModel");

// Crear turno
const create = async (req, res) => {
  try {
    const { clientId, date, reason, state } = req.body;
    if (!clientId || !date)
      return res
        .status(400)
        .json({ message: "Faltan campos obligatorios (userId o date)" });

    const appointmentDate = Timestamp.fromDate(new Date(date));

    const newAppointment = {
      clientId,
      date: appointmentDate,
      reason: reason || "consulta",
      state: state || "pendiente",
      createdAt: Timestamp.now(),
    };

    const result = await AppointmentModel.create(newAppointment);

    return res.status(201).json({
      message: "Turno agendado correctamente",
      id: result.id,
    });
  } catch (error) {
    console.error("Error al crear turno:", error);
    return res
      .status(500)
      .json({ message: "Error al crear turno", error: String(error) });
  }
};

// Obtener todos los turnos (admin)
const getAll = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getAll();
    const formatted = appointments.map((a) => ({
      ...a,
      date: a.date?.toDate
        ? a.date.toDate().toLocaleString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
            hour12: true,
          })
        : a.date,
    }));
    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error obteniendo turnos:", error);
    return res
      .status(500)
      .json({ message: "Error obteniendo turnos", error: String(error) });
  }
};

// Obtener turnos del usuario logueado
const getByUser = async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId)
      return res.status(401).json({ message: "Usuario no autenticado" });

    const appointments = await AppointmentModel.getByUser(clientId);
    const formatted = appointments.map((a) => ({
      ...a,
      date: a.date?.toDate
        ? a.date.toDate().toLocaleString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
            hour12: true,
          })
        : a.date,
    }));
    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error obteniendo turnos del usuario:", error);
    return res.status(500).json({
      message: "Error obteniendo turnos del usuario",
      error: String(error),
    });
  }
};

// Actualizar turno
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await AppointmentModel.update(id, data);
    if (!updated)
      return res.status(404).json({ message: "Turno no encontrado" });
    return res.json(updated);
  } catch (error) {
    console.error("Error actualizando turno:", error);
    return res
      .status(500)
      .json({ message: "Error actualizando turno", error: String(error) });
  }
};

// Cancelar turno
const cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await AppointmentModel.cancel(id);
    return res.json(updated);
  } catch (error) {
    console.error("Error cancelando turno:", error);
    return res
      .status(500)
      .json({ message: "Error cancelando turno", error: String(error) });
  }
};

// Eliminar turno
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await AppointmentModel.delete(id);
    return res.json({ message: "Turno eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando turno:", error);
    return res
      .status(500)
      .json({ message: "Error eliminando turno", error: String(error) });
  }
};

module.exports = {
  create,
  getAll,
  getByUser,
  update,
  cancel,
  delete: deleteAppointment,
};
