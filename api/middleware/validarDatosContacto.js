const Pacientes = require("../models/Pacientes");
const { mensajes } = require("../config");

exports.validarCorreo = (req, res, next) => {
  try {
    const { correoCuerpo, correoExtension } = req.body;
    if (!correoCuerpo || !correoExtension)
      return res.status(400).send({ respuesta: mensajes.badRequest });

    const correo = `${correoCuerpo}@${correoExtension}`;
    const regex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]+$/g);
    if (!regex.test(correo))
      return res.status(400).send({ respuesta: mensajes.badRequest });

    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarTelefono = (req, res, next) => {
  try {
    const { fono, telefonoMovil } = req.body;
    if (!fono && !telefonoMovil)
      return res.status(400).send({ respuesta: mensajes.badRequest });

    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarSiPacienteExiste = async (req, res, next) => {
  try {
    const paciente = await Pacientes.findOne({
      numeroPaciente: req.numeroPaciente,
    }).exec();
    if (!paciente)
      return res.status(400).send({ respuesta: mensajes.badRequest });

    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};
