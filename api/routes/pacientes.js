const express = require('express')
const pacientesController = require('../controllers/pacientesController')
const estaAutenticado = require('../middleware/auth')
const router = express.Router()

router.get('/informacion',estaAutenticado, pacientesController.getInformacionPaciente)


module.exports = router