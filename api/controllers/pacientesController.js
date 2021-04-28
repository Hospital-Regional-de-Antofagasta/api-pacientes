const Pacientes = require('../models/Pacientes')
const PacientesActualizados = require('../models/PacientesActualizados')
const {mensajes} = require ('../config')

exports.getInformacionPaciente = async (req, res) =>{
    try {
        const paciente = await Pacientes.findOne({
            PAC_PAC_Numero: req.pacPacNumero
        })    
        .exec()
        if(paciente == null){
            res.sendStatus(200)
            return
        }
        const pacienteInfo = {
            Nombre: paciente.PAC_PAC_Nombre+' '+paciente.PAC_PAC_ApellPater+' '+paciente.PAC_PAC_ApellMater ,
            Rut:paciente.PAC_PAC_Rut,
            PAC_PAC_CalleHabit: paciente.PAC_PAC_CalleHabit,
            PAC_PAC_NumerHabit: paciente.PAC_PAC_NumerHabit,
            PAC_PAC_DeparHabit: paciente.PAC_PAC_DeparHabit,
            PAC_PAC_PoblaHabit: paciente.PAC_PAC_PoblaHabit,
            PAC_PAC_ComunHabit: paciente.PAC_PAC_ComunHabit,
            PAC_PAC_CiudaHabit: paciente.PAC_PAC_CiudaHabit,
            PAC_PAC_RegioHabit: paciente.PAC_PAC_RegioHabit,
            PAC_PAC_Fono: paciente.PAC_PAC_Fono,
            PAC_PAC_TelefonoMovil: paciente.PAC_PAC_TelefonoMovil,
            PAC_PAC_CorreoCuerpo: paciente.PAC_PAC_CorreoCuerpo,
            PAC_PAC_CorreoExtension: paciente.PAC_PAC_CorreoExtension,           
        }
        res.status(200).send(pacienteInfo)
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.putDatosPaciente = async (req, res) =>{
    try {
        // await Pacientes.updateOne({
        //     PAC_PAC_Numero: req.pacPacNumero
        // },req.body)    
        // .exec()
        await PacientesActualizados.deleteOne({
            numeroPaciente: req.pacPacNumero
        })
        await PacientesActualizados.create(req.body)
        res.sendStatus(204)
    } catch (error) {
        res.status(500).send({ respuesta: mensajesRecetas.serverError})
    }
}




