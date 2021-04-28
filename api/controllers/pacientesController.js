const Pacientes = require('../models/Pacientes')
const PacientesActualizados = require('../models/PacientesActualizados')
const {mensajes} = require ('../config')

exports.getInformacionPaciente = async (req, res) =>{
    try {        
        const paciente = await Pacientes.findOne({
            numeroPaciente: req.numeroPaciente
        })    
        .exec()
        if(paciente == null){
            res.sendStatus(200)
            return
        }
        const pacienteInfo = {
            numeroPaciente: paciente.numeroPaciente,
            rut:paciente.rut,
            nombreCompleto: paciente.nombre+' '+paciente.apellidoPaterno+' '+paciente.apellidoMaterno,
            textoCalle: paciente.textoCalle,
            textoNumero: paciente.textoNumero,
            textoDepartamento: paciente.textoDepartamento,
            textoPoblacion: paciente.textoPoblacion,
            codigoComuna: paciente.codigoComuna,
            codigoCiudad: paciente.codigoCiudad,
            codigoRegion: paciente.codigoRegion,
            fono: paciente.fono,
            telefonoMovil: paciente.telefonoMovil,
            correoCuerpo: paciente.correoCuerpo,
            correoExtension: paciente.correoExtension,           
        }
        res.status(200).send(pacienteInfo)
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.putDatosPaciente = async (req, res) =>{
    try {
        // await Pacientes.updateOne({
        //     numeroPaciente: req.numeroPaciente
        // },req.body)    
        // .exec()
        await PacientesActualizados.deleteOne({
            numeroPaciente: req.numeroPaciente
        })
        await PacientesActualizados.create(req.body)
        res.sendStatus(204)
    } catch (error) {
        res.status(500).send({ respuesta: mensajesRecetas.serverError})
    }
}




