const express = require("express");
const idSuscriptorController = require("../controllers/idSuscriptorController");
const isAuthenticated = require("../middleware/auth");
const {
  validarIdSuscriptorInBody,
  validarIdSuscriptorInParams,
  validarNombreDispositivo,
} = require("../middleware/validaraIdSuscriptor");
const {
  validarSiPacienteExiste,
} = require("../middleware/validarDatosContacto");

const router = express.Router();

router.get(
  "",
  isAuthenticated,
  validarSiPacienteExiste,
  idSuscriptorController.getIdsSuscriptor
);

router.post(
  "",
  isAuthenticated,
  validarSiPacienteExiste,
  validarIdSuscriptorInBody,
  validarNombreDispositivo,
  idSuscriptorController.postIdSuscriptor
);

router.delete(
  "/:idSuscriptor",
  isAuthenticated,
  validarSiPacienteExiste,
  validarIdSuscriptorInParams,
  idSuscriptorController.deleteIdsSuscriptor
);

module.exports = router;
