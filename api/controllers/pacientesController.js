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
    };
    res.status(200).send(pacienteInfo);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.postDatosPaciente = async (req, res) => {
  try {
    // await Pacientes.updateOne({
    //     numeroPaciente: req.numeroPaciente
    // },req.body)
    // .exec()
    await PacientesActualizados.deleteOne({
      numeroPaciente: req.numeroPaciente,
    });
    await PacientesActualizados.create(req.body);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send({ respuesta: mensajesRecetas.serverError });
  }
};
