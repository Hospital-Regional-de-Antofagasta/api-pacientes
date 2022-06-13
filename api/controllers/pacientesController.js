const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const IdsSuscriptorPacientes = require("../models/IdsSuscriptorPacientes");
const { getMensajes } = require("../config");
const { manejarError } = require("../utils/errorController");

exports.getInformacionPaciente = async (req, res) => {
  try {
    let filter = { _id: req.idPaciente };
    if (req.query.filter === "rut") filter = { rut: req.rutPaciente };
    let select = "-rut";
    if (req.query.filter === "rut") select = "";

    const paciente = await Pacientes.findOne(filter).select(select).exec();
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

exports.postIdSuscriptor = async (req, res) => {
  try {
    const { idSuscriptor } = req.body;
    const rutPaciente = req.rutPaciente;

    /* Paciente existe en la colección de idsSuscriptores */
    const pacienteTieneIdSuscriptor = await IdsSuscriptorPacientes.findOne({
      rutPaciente: rutPaciente,
    }).exec();
    if (!pacienteTieneIdSuscriptor) {
      await IdsSuscriptorPacientes.create({ rutPaciente, idSuscriptor });
      return res.status(201).send({ respuesta: await getMensajes("success") });
    }

    /* Se busca si existe el id suscriptor */
    const existeIdSuscriptor = await IdsSuscriptorPacientes.find({
      rutPaciente: rutPaciente,
      idSuscriptor: idSuscriptor,
    }).exec();
    if (existeIdSuscriptor.length > 0)
      return res.status(201).send({ respuesta: await getMensajes("success") });

    /* Se agrega nuevo id suscriptor al arreglo del paciente */
    await IdsSuscriptorPacientes.findOneAndUpdate(
      { rutPaciente: rutPaciente },
      { $push: { idSuscriptor: idSuscriptor } }
    ).exec();
    return res.status(201).send({ respuesta: await getMensajes("success") });
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.getIdsSuscriptor = async (req, res) => {
  try {
    const idsSuscriptorPaciente = await IdsSuscriptorPacientes.findOne({
      rutPaciente: req.rutPaciente,
    }).exec();
    res.status(200).send(idsSuscriptorPaciente.idSuscriptor);
  } catch (error) {
    await manejarError(error, req, res);
  }
};
