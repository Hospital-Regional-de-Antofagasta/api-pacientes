const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const { getMensajes } = require("../config");

exports.getInformacionPaciente = async (req, res) => {
  try {
    const paciente = await Pacientes.findById(req.idPaciente).exec();
    if (paciente == null) {
      res.sendStatus(200);
      return;
    }
    const pacienteInfo = {
      numerosPaciente: paciente.numerosPaciente,
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
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
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

    //Se crea una actualización para cada hospital.
    for (let numero of req.numerosPaciente){
      pacienteAActualizar.numeroPaciente = numero;
      await PacientesActualizados.create(pacienteAActualizar);
    };

    await Pacientes.updateOne(
      {
        _id: req.idPaciente,
      },
      { datosContactoActualizados: true }
    ).exec();

    res.status(201).send({ respuesta: await getMensajes("solicitudCreada") });
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.getSiDatosContactoConfirmados = async (req, res) => {
  try {
    const paciente = await Pacientes.findById(req.idPaciente).exec();
    if (!paciente.datosContactoActualizados)
      return res.status(200).send({
        datosContactoConfirmados: paciente.datosContactoActualizados,
        respuesta: await getMensajes("datosContactoNoConfirmados"),
      });
    res
      .status(200)
      .send({ datosContactoConfirmados: paciente.datosContactoActualizados });
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
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
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};
