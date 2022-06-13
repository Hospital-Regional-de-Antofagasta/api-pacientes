const Pacientes = require("../models/Pacientes");
const { getMensajes } = require("../config");

exports.validarIdSuscriptor = async (req, res, next) => {
  try {
    const { idSuscriptor } = req.body;
    if (!idSuscriptor) {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }
    next();
  } catch (error) {
    await manejarError(error, req, res);
  }
};
