const IdsSuscriptorPacientes = require("../models/IdsSuscriptorPacientes");
const { getMensajes } = require("../config");
const { handleError } = require("../utils/errorHandler");

exports.validarIdSuscriptorInBody = async (req, res, next) => {
  try {
    const { idSuscriptor } = req.body;

    if (!idSuscriptor) {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }

    if (typeof idSuscriptor !== "string") {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }

    next();
  } catch (error) {
    await handleError(res, error);
  }
};

exports.validarIdSuscriptorInParams = async (req, res, next) => {
  try {
    const { idSuscriptor } = req.params;
    const rutPaciente = req.rutPaciente;

    if (!idSuscriptor) {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }

    if (typeof idSuscriptor !== "string") {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }

    const idsSuscriptorPaciente = await IdsSuscriptorPacientes.findOne({
      rutPaciente: rutPaciente,
      "idsSuscriptor.idSuscriptor": idSuscriptor,
    }).exec();

    if (!idsSuscriptorPaciente) {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }

    next();
  } catch (error) {
    await handleError(res, error);
  }
};

exports.validarNombreDispositivo = async (req, res, next) => {
  try {
    const { nombreDispositivo } = req.body;

    if (!nombreDispositivo) {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }

    if (typeof nombreDispositivo !== "string") {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }

    next();
  } catch (error) {
    await handleError(res, error);
  }
};
