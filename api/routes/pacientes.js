const express = require("express");
const pacientesController = require("../controllers/pacientesController");
const estaAutenticado = require("../middleware/auth");
const router = express.Router();

router.get(
  "/informacion",
  estaAutenticado,
  pacientesController.getInformacionPaciente
);

router.post(
  "/actualizar_datos",
  estaAutenticado,
  pacientesController.postDatosPaciente
);

module.exports = router;
