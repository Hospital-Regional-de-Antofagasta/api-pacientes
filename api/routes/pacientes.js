const express = require('express')
const pacientesController = require('../controllers/pacientesController')
const estaAutenticado = require('../middleware/auth')
const router = express.Router()

router.get('/informacion',estaAutenticado, pacientesController.getInformacionPaciente)

router.put('/actualizar_datos',estaAutenticado, pacientesController.putDatosPaciente)


module.exports = router