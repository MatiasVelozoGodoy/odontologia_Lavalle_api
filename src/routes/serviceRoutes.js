const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", serviceController.getService); //solo service

router.put("/:id", authMiddleware, serviceController.updateService); //services/{id}

router.put("/deleted/:id", authMiddleware, serviceController.deleteService); //services/deleted/{id}

router.put("/actived/:id", authMiddleware, serviceController.activeService); //services/active/{id}

router.post("/", authMiddleware, serviceController.createService); //services/new

module.exports = router;
