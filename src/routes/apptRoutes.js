const express = require("express");
const AppointmentController = require("../controllers/apptController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Cliente
router.post("/", authMiddleware, AppointmentController.create);
router.get("/my", authMiddleware, AppointmentController.getByUser);

// Admin
router.get("/", authMiddleware, AppointmentController.getAll);

// Opcional: update, cancel, delete
router.put("/:id", authMiddleware, AppointmentController.update);
router.put("/cancel/:id", authMiddleware, AppointmentController.cancel);
router.delete("/:id", authMiddleware, AppointmentController.delete);

module.exports = router;
