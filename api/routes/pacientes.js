const express = require("express");
const pacientesController = require("../controllers/pacientesController");
const estaAutenticado = require("../middleware/auth");
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
  estaAutenticado,
  pacientesController.getInformacionPaciente
);

router.post(
  "/actualizar-datos",
  estaAutenticado,
  validarCorreo,
  validarTelefono,
  validarUbicacion,
  validarNoObligatorios,
  pacientesController.postDatosPaciente
);

router.get(
  "/verificar-si-datos-contacto-confirmados",
  estaAutenticado,
  validarSiPacienteExiste,
  pacientesController.getSiDatosContactoConfirmados
);

router.get(
  "/verificar-solicitud-duplicada",
  estaAutenticado,
  validarSiPacienteExiste,
  pacientesController.getSolicitudPendientePaciente
);

module.exports = router;
