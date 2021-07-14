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
  "/actualizar_datos",
  estaAutenticado,
  validarCorreo,
  validarTelefono,
  validarUbicacion,
  validarNoObligatorios,
  pacientesController.postDatosPaciente
);

router.get(
  "/verificar_si_datos_contacto_confirmados",
  estaAutenticado,
  validarSiPacienteExiste,
  pacientesController.getSiDatosContactoConfirmados
);

router.get(
  "/verificar_solicitud_duplicada",
  estaAutenticado,
  validarSiPacienteExiste,
  pacientesController.getSolicitudPendientePaciente
);

module.exports = router;
