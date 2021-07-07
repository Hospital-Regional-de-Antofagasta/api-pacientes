const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const { mensajes } = require("../config");

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
      nombreCompleto:
        paciente.nombre +
        " " +
        paciente.apellidoPaterno +
        " " +
        paciente.apellidoMaterno,
      direccionCalle: paciente.direccionCalle,
      direccionNumero: paciente.direccionNumero,
      direccionDepartamento: paciente.direccionDepartamento,
      direccionPoblacion: paciente.direccionPoblacion,
      codigoComuna: paciente.codigoComuna,
      codigoCiudad: paciente.codigoCiudad,
      codigoRegion: paciente.codigoRegion,
      fono: paciente.fono,
      telefonoMovil: paciente.telefonoMovil,
      correoCuerpo: paciente.correoCuerpo,
      correoExtension: paciente.correoExtension,
      datosContactoActualizados: paciente.datosContactoActualizados,
    };
    res.status(200).send(pacienteInfo);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
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
    res.status(201).send({});
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.getSiDatosActualizadosPaciente = async (req, res) => {
  try {
    const paciente = await Pacientes.findOne({
      numeroPaciente: req.numeroPaciente,
    }).exec();
    res.status(200).send({ respuesta: paciente.datosContactoActualizados });
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.getSolicitudPendientePaciente = async (req, res) => {
  try {
    const solicitudPendiente = await PacientesActualizados.findOne({
      numeroPaciente: req.numeroPaciente,
    }).exec();
    if (solicitudPendiente) return res.status(200).send({ respuesta: true });
    res.status(200).send({ respuesta: false });
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};
