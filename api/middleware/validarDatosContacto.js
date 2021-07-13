const Pacientes = require("../models/Pacientes");
const { mensajes } = require("../config");

exports.validarCorreo = (req, res, next) => {
  try {
    const { correoCuerpo, correoExtension } = req.body;
    if (!correoCuerpo || !correoExtension)
      return res.status(400).send({ respuesta: mensajes.badRequest });

    const correo = `${correoCuerpo}@${correoExtension}`;
    const regexCorreo = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]+$/);
    if (!regexCorreo.test(correo) || correo.length >320)
      return res.status(400).send({ respuesta: mensajes.badRequest });

    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarTelefono = (req, res, next) => {
  try {
    const { fono, telefonoMovil } = req.body;
    const regexTelefonoMovil = new RegExp(/^[987654321]\d{7}$/);
    const regexFonoLargo6 = new RegExp(/^[987654321]\d{5}$/);
    const regexFonoLargo9 = new RegExp(/^[987654321]\d{8}$/);
    if (
      typeof telefonoMovil !== "string" ||
      typeof fono !== "string" ||
      telefonoMovil.length > 8 ||
      fono.length > 9 ||
      (fono.length === 0 && telefonoMovil.length === 0) ||
      (fono.length === 0 && !regexTelefonoMovil.test(telefonoMovil)) ||
      (!regexFonoLargo6.test(fono) && telefonoMovil.length === 0) ||
      (!regexFonoLargo9.test(fono) && telefonoMovil.length === 0) ||
      (regexFonoLargo6.test(fono) &&
        telefonoMovil.length > 0 &&
        !regexTelefonoMovil.test(telefonoMovil)) ||
      (regexFonoLargo9.test(fono) &&
        telefonoMovil.length > 0 &&
        !regexTelefonoMovil.test(telefonoMovil)) ||
      (fono.length > 0 &&
        !regexFonoLargo6.test(fono) &&
        regexTelefonoMovil.test(telefonoMovil)) ||
      (fono.length > 6 &&
        !regexFonoLargo9.test(fono) &&
        regexTelefonoMovil.test(telefonoMovil))
    ) {
      return res.status(400).send({ respuesta: mensajes.badRequest });
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarUbicacion = (req, res, next) => {
  try {
    const { codigoComuna, codigoCiudad, codigoRegion } = req.body;
    const regexCodigo = new RegExp(/^[0-9]+$/);
    if (
      typeof codigoComuna !== "string" ||
      !regexCodigo.test(codigoComuna) ||
      codigoComuna.length < 2 ||
      codigoComuna.length > 3 ||
      typeof codigoCiudad !== "string" ||
      !regexCodigo.test(codigoCiudad) ||
      codigoCiudad.length < 2 ||
      codigoCiudad.length > 3 ||
      typeof codigoRegion !== "string" ||
      !regexCodigo.test(codigoRegion) ||
      codigoRegion.length > 3 ||
      codigoRegion.length < 2
    ) {
      return res.status(400).send({ respuesta: mensajes.badRequest });
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarNoObligatorios = (req, res, next) => {
  try {
    const {
      direccionCalle,
      direccionNumero,
      direccionDepartamento,
      direccionPoblacion,
    } = req.body;
    const regexTexto = new RegExp(/[\s\w\.\,\-áéíóúÁÉÍÓÚñÑ%$¡!¿?()]+$/);
    const regexNumero = new RegExp(/^[0-9]+$/);
    if (
      (direccionCalle.length > 0 &&
        (!regexTexto.test(direccionCalle) || direccionCalle.length > 255)) ||
      (direccionPoblacion > 0 &&
        (!regexTexto.test(direccionPoblacion) ||
          direccionPoblacion.length > 255)) ||
      (direccionDepartamento > 0 &&
        (!regexTexto.test(direccionDepartamento) ||
          direccionDepartamento.length > 255)) ||
      (direccionNumero > 0 &&
        (!regexNumero.test(direccionNumero) || direccionNumero.length > 255))
    ) {
      return res.status(400).send({ respuesta: mensajes.badRequest });
    }
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
