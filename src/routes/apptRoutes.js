const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const apptController = require("../controllers/apptController");

// crear turno (pendiente hasta comprobante)
router.post("/", authMiddleware, apptController.createAppointmentCtrl);

// confirmar turno subiendo comprobante
router.put("/confirm", authMiddleware, apptController.confirmAppointmentCtrl);

// listar mis turnos
router.get("/mine", authMiddleware, apptController.getUserAppointmentsCtrl);

// listar todos los turnos (solo admin)
router.get("/", authMiddleware, apptController.getAllAppointmentsCtrl);

module.exports = router;
