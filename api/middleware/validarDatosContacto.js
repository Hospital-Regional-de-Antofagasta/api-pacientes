const { mensajes } = require("../config");

exports.validarCorreo = (req, res, next) => {
  const { correoCuerpo, correoExtension } = req.body;
  if (!correoCuerpo || !correoExtension)
    return res.status(400).send({ respuesta: mensajes.badRequest });

  const correo = `${correoCuerpo}@${correoExtension}`;
  const regex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]+$/g);
  if (!regex.test(correo))
    return res.status(400).send({ respuesta: mensajes.badRequest });

  next();
};

exports.validarTelefono = (req, res, next) => {
  const { fono, telefonoMovil } = req.body;
  if(!fono && !telefonoMovil)
    return res.status(400).send({ respuesta: mensajes.badRequest });

  next();
};
