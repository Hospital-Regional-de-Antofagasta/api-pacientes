const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const { getMensajes } = require("../config");
const { handleError } = require("../utils/errorHandler");

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
    await handleError(res, error);
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
    await handleError(res, error);
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
    await handleError(res, error);
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
    await handleError(res, error);
  }
};
