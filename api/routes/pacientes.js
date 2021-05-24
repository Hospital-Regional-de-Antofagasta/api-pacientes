const express = require("express");
const pacientesController = require("../controllers/pacientesController");
const estaAutenticado = require("../middleware/auth");
const {
  validarCorreo,
  validarTelefono,
} = require("../middleware/validarDatosContacto");
const router = express.Router();

router.get(
  "/informacion",
  estaAutenticado,
  pacientesController.getInformacionPaciente
);

router.post(
  "/actualizar_datos",
  estaAutenticado,
  validarCorreo,
  validarTelefono,
  pacientesController.postDatosPaciente
);

module.exports = router;
