const express = require("express");
const idSuscriptorController = require("../controllers/idSuscriptorController");
const isAuthenticated = require("../middleware/auth");
const {
  validarIdSuscriptor,
  validarNombreDispositivo,
} = require("../middleware/validaraIdSuscriptor");
const {
  validarSiPacienteExiste,
} = require("../middleware/validarDatosContacto");

const router = express.Router();

router.post(
  "",
  isAuthenticated,
  validarSiPacienteExiste,
  validarIdSuscriptor,
  validarNombreDispositivo,
  idSuscriptorController.postIdSuscriptor
);

router.get(
  "",
  isAuthenticated,
  validarSiPacienteExiste,
  idSuscriptorController.getIdsSuscriptor
);

module.exports = router;
