const express = require("express");
const pacientesController = require("../controllers/pacientesController");
const isAuthenticated = require("../middleware/auth");
const {
  validarCorreo,
  validarTelefono,
  validarSiPacienteExiste,
  validarUbicacion,
  validarNoObligatorios,
} = require("../middleware/validarDatosContacto");
const router = express.Router();

router.get(
  "/informacion",
  isAuthenticated,
  pacientesController.getInformacionPaciente
);

router.post(
  "/actualizar-datos",
  isAuthenticated,
  validarCorreo,
  validarTelefono,
  validarUbicacion,
  validarNoObligatorios,
  pacientesController.postDatosPaciente
);

router.get(
  "/verificar-si-datos-contacto-confirmados",
  isAuthenticated,
  validarSiPacienteExiste,
  pacientesController.getSiDatosContactoConfirmados
);

router.get(
  "/verificar-solicitud-duplicada",
  isAuthenticated,
  validarSiPacienteExiste,
  pacientesController.getSolicitudPendientePaciente
);

module.exports = router;
