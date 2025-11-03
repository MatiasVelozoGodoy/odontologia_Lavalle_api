const {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  getAppointmentsByUser,
  getAllAppointments,
} = require("../models/apptModel");
const { sendInvoiceEmail } = require("../../emailService");

const isTimeValid = (date, time) => {
  const d = new Date(`${date}T${time}`);
  const day = d.getDay();

  const hour = d.getHours();

  if ((day === 2 || day === 4) && hour < 12) return false;
  return true;
};

const createAppointmentCtrl = async (req, res) => {
  try {
    const { userId, userEmail, date, time } = req.body;
    if (!isTimeValid(date, time)) {
      return res.status(400).json({
        message: "Turnos no disponibles los martes o jueves a la mañana.",
      });
    }

    const result = await createAppointment({
      userId,
      userEmail,
      serviceTitle: "Consulta",
      date,
      time,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al crear turno", error: error.message });
  }
};

const confirmAppointmentCtrl = async (req, res) => {
  try {
    const { appointmentId, depositUrl } = req.body;
    if (!depositUrl)
      return res
        .status(400)
        .json({ message: "Debe subir el comprobante de depósito." });

    const appt = await getAppointmentById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Turno no encontrado" });

    await updateAppointment(appointmentId, { depositUrl, status: "confirmed" });

    await sendInvoiceEmail({
      to: appt.userEmail,
      subject: "Turno confirmado - Odontología Lavalle",
      text: `Tu turno para ${appt.serviceTitle} fue confirmado para el ${appt.date} a las ${appt.time}.`,
    });

    res.json({ isOK: true, message: "Turno confirmado y email enviado" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al confirmar turno", error: error.message });
  }
};

const getUserAppointmentsCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await getAppointmentsByUser(userId);
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener turnos", error: error.message });
  }
};

const getAllAppointmentsCtrl = async (req, res) => {
  try {
    const appointments = await getAllAppointments();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener turnos", error: error.message });
  }
};

module.exports = {
  createAppointmentCtrl,
  confirmAppointmentCtrl,
  getUserAppointmentsCtrl,
  getAllAppointmentsCtrl,
};
