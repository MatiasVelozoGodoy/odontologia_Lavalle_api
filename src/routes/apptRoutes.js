const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const apptController = require("../controllers/apptController");

router.get("/me", authMiddleware, apptController.getByUser);
router.post("/", authMiddleware, apptController.createAppointment);
router.put("/:id", authMiddleware, apptController.updateAppointment); // actualizar genérico
router.put("/cancel/:id", authMiddleware, apptController.updateAppointment); //  para cancelar

module.exports = router;
