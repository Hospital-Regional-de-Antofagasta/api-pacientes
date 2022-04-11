const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const SolicitudIdSuscriptorPaciente = require("../models/SolicitudIdSuscriptorPaciente");
// const ConocimientoDeuda = require("../models/ConocimientoDeuda");
const { getMensajes } = require("../config");
const { manejarError } = require("../utils/errorController");

exports.getInformacionPaciente = async (req, res) => {
  try {
    let filter = { _id: req.idPaciente };
    if (req.query.filter === "rut") filter = { rut: req.rutPaciente };

    const paciente = await Pacientes.findOne(filter).exec();
    if (!paciente) return res.sendStatus(200);
    res.status(200).send(paciente);
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.postDatosPaciente = async (req, res) => {
  try {
    await PacientesActualizados.deleteMany({
      idPaciente: req.idPaciente,
    });

    const pacienteAActualizar = req.body;
    pacienteAActualizar.idPaciente = req.idPaciente;
    pacienteAActualizar.direccion = pacienteAActualizar.direccion.toUpperCase();
    pacienteAActualizar.detallesDireccion =
      pacienteAActualizar.detallesDireccion.toUpperCase();
    pacienteAActualizar.direccionPoblacion =
      pacienteAActualizar.direccionPoblacion.toUpperCase();
    pacienteAActualizar.rut = req.rutPaciente;
    await PacientesActualizados.create(pacienteAActualizar);
    await Pacientes.updateOne(
      {
        _id: req.idPaciente,
      },
      { datosContactoActualizados: true }
    ).exec();

    res.status(201).send({ respuesta: await getMensajes("solicitudCreada") });
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.getSiDatosContactoConfirmados = async (req, res) => {
  try {
    const { esValidacion } = req.query;
    const paciente = await Pacientes.findById(req.idPaciente).exec();
    if (!paciente.datosContactoActualizados) {
      if (esValidacion === "true")
        return res.status(200).send({
          datosContactoConfirmados: paciente.datosContactoActualizados,
          respuesta: await getMensajes(
            "esValidacionDatosContactoNoConfirmados"
          ),
        });
      return res.status(200).send({
        datosContactoConfirmados: paciente.datosContactoActualizados,
        respuesta: await getMensajes("datosContactoNoConfirmados"),
      });
    }
    res
      .status(200)
      .send({ datosContactoConfirmados: paciente.datosContactoActualizados });
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.getSolicitudPendientePaciente = async (req, res) => {
  try {
    const solicitudDuplicada = await PacientesActualizados.findOne({
      idPaciente: req.idPaciente,
    }).exec();
    if (solicitudDuplicada)
      return res.status(200).send({
        solicitudDuplicada: true,
        respuesta: await getMensajes("solicitudDuplicada"),
      });
    res.status(200).send({ solicitudDuplicada: false });
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.postSolicitudIdSuscriptorPaciente = async (req, res) => {

  try {
    const {idSuscriptorPaciente} = req.body;
    const rutPaciente = req.rutPaciente;
    
    let idSucriptorEncontradoSolicitud = [];
    let idsSucriptorPaciente = [];

    //#region Buscar si un mismo paciente tiene más de una solicitud con el mismo id suscriptor
    const pacientesIdSucriptorSolicitud = await SolicitudIdSuscriptorPaciente.find({ rutPaciente: req.rutPaciente }).exec();
    if(pacientesIdSucriptorSolicitud.length > 0 ){
      idSucriptorEncontradoSolicitud = await pacientesIdSucriptorSolicitud.find({ idSuscriptorPaciente: idSuscriptorPaciente }).exec();
    }
    //#endregion

    //#region Buscar que el paciente no tenga vinculado el id suscriptor en su arreglo idsSuscriptor
    const paciente = await Pacientes.findOne({ rutPaciente:  req.rutPaciente }).exec();
    if(paciente.idsSuscriptor.length > 0){
      idsSucriptorPaciente = paciente.idsSuscriptor.find(idSuscriptorPaciente).exec();
    }
    //#endregion
   
    /* Se valida que no exista la id suscriptor en la colección de actualización y en la colección de paciente */
    if(idSucriptorEncontradoSolicitud.length > 0 || idsSucriptorPaciente.length > 0){
      res.status(200).send({ respuesta: await getMensajes("solicitudDuplicadaIdSuscripcion") });
      return;
    } 

    await SolicitudIdSuscriptorPaciente.create({rutPaciente,idSuscriptorPaciente});

    res.status(201).send({ respuesta: await getMensajes("solicitudCreadaIdSuscripcion") });
     

  } catch (error) {
    await manejarError(error, req, res);
  }
};

// exports.postConocimientoDeuda = async (req, res) => {
//   try {
//     const conocimientoDeuda = {
//       idPaciente: req.idPaciente,
//       rutPaciente: req.rutPaciente,
//       fecha: new Date(),
//     };

//     await ConocimientoDeuda.create(conocimientoDeuda);

//     res
//       .status(200)
//       .send({ respuesta: await getMensajes("conocimientoDeudaRegistrado") });
//   } catch (error) {
//     await manejarError(error, req, res);
//   }
// };
