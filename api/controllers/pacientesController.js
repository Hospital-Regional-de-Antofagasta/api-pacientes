const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const { getMensajes } = require("../config");

exports.getInformacionPaciente = async (req, res) => {
  try {
    const paciente = await Pacientes.findOne({
      numeroPaciente: req.numeroPaciente,
    }).exec();
    if (paciente == null) {
      res.sendStatus(200);
      return;
    }
    const pacienteInfo = {
      numeroPaciente: paciente.numeroPaciente,
      rut: paciente.rut,
      nombre: paciente.nombre,
      nombreSocial: paciente.nombreSocial,
      apellidoPaterno: paciente.apellidoPaterno,
      apellidoMaterno: paciente.apellidoMaterno,
      direccion: paciente.direccion,
      direccionNumero: paciente.direccionNumero,
      detallesDireccion: paciente.detallesDireccion,
      direccionPoblacion: paciente.direccionPoblacion,
      codigoComuna: paciente.codigoComuna,
      codigoCiudad: paciente.codigoCiudad,
      codigoRegion: paciente.codigoRegion,
      telefonoFijo: paciente.telefonoFijo,
      telefonoMovil: paciente.telefonoMovil,
      correoCuerpo: paciente.correoCuerpo,
      correoExtension: paciente.correoExtension,
      datosContactoActualizados: paciente.datosContactoActualizados,
    };
    res.status(200).send(pacienteInfo);
  } catch (error) {
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.postDatosPaciente = async (req, res) => {
  try {
    const numeroPaciente = req.numeroPaciente;
    await PacientesActualizados.deleteOne({
      numeroPaciente,
    });
    const pacienteAActualizar = req.body;
    pacienteAActualizar.numeroPaciente = numeroPaciente;
    await PacientesActualizados.create(req.body);
    await Pacientes.updateOne(
      {
        numeroPaciente,
      },
      { datosContactoActualizados: true }
    ).exec();

    res.status(201).send({ respuesta: await getMensajes("solicitudCreada") });
  } catch (error) {
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.getSiDatosContactoConfirmados = async (req, res) => {
  try {
    const paciente = await Pacientes.findOne({
      numeroPaciente: req.numeroPaciente,
    }).exec();
    if (!paciente.datosContactoActualizados)
      return res.status(200).send({
        datosContactoConfirmados: paciente.datosContactoActualizados,
        respuesta: await getMensajes("datosContactoNoConfirmados"),
      });
    res.status(200).send({ datosContactoConfirmados: paciente.datosContactoActualizados });
  } catch (error) {
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.getSolicitudPendientePaciente = async (req, res) => {
  try {
    const solicitudDuplicada = await PacientesActualizados.findOne({
      numeroPaciente: req.numeroPaciente,
    }).exec();
    if (solicitudDuplicada)
      return res.status(200).send({
        solicitudDuplicada: true,
        respuesta: await getMensajes("solicitudDuplicada"),
      });
    res.status(200).send({ solicitudDuplicada: false });
  } catch (error) {
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};
