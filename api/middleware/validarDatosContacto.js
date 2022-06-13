const Pacientes = require("../models/Pacientes");
const { getMensajes } = require("../config");
const { manejarError } = require("../utils/errorController");

exports.validarCorreo = async (req, res, next) => {
  try {
    const { correoCuerpo, correoExtension } = req.body;
    if (!correoCuerpo || !correoExtension)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });

    const correo = `${correoCuerpo}@${correoExtension}`;
    const regexCorreo = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]+$/);
    if (!regexCorreo.test(correo) || correo.length > 320)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });

    next();
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.validarTelefono = async (req, res, next) => {
  try {
    const { telefonoFijo, telefonoMovil } = req.body;
    const regexTelefonoMovil = new RegExp(/^[987654321]\d{7}$/);
    const regexFonoLargo6 = new RegExp(/^[987654321]\d{5}$/);
    const regexFonoLargo9 = new RegExp(/^[987654321]\d{8}$/);
    if (
      typeof telefonoMovil !== "string" ||
      typeof telefonoFijo !== "string" ||
      telefonoMovil.length > 8 ||
      telefonoFijo.length > 9 ||
      (telefonoFijo.length === 0 && telefonoMovil.length === 0) ||
      (telefonoFijo.length === 0 &&
        telefonoMovil.length > 0 &&
        !regexTelefonoMovil.test(telefonoMovil)) ||
      (telefonoFijo.length > 0 &&
        telefonoFijo.length <= 6 &&
        !regexFonoLargo6.test(telefonoFijo) &&
        telefonoMovil.length === 0) ||
      (telefonoFijo.length > 6 &&
        !regexFonoLargo9.test(telefonoFijo) &&
        telefonoMovil.length === 0) ||
      (regexFonoLargo6.test(telefonoFijo) &&
        telefonoMovil.length > 0 &&
        !regexTelefonoMovil.test(telefonoMovil)) ||
      (regexFonoLargo9.test(telefonoFijo) &&
        telefonoMovil.length > 0 &&
        !regexTelefonoMovil.test(telefonoMovil)) ||
      (telefonoFijo.length > 0 &&
        telefonoFijo.length <= 6 &&
        !regexFonoLargo6.test(telefonoFijo) &&
        regexTelefonoMovil.test(telefonoMovil)) ||
      (telefonoFijo.length > 6 &&
        !regexFonoLargo9.test(telefonoFijo) &&
        regexTelefonoMovil.test(telefonoMovil))
    ) {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }
    next();
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.validarUbicacion = async (req, res, next) => {
  try {
    const { codigoComuna, codigoCiudad, codigoRegion } = req.body;
    const regexCodigo = new RegExp(/^\d{2}[ ]*$/);
    if (
      typeof codigoComuna !== "string" ||
      !regexCodigo.test(codigoComuna) ||
      codigoComuna.length < 2 ||
      typeof codigoCiudad !== "string" ||
      !regexCodigo.test(codigoCiudad) ||
      codigoCiudad.length < 2 ||
      typeof codigoRegion !== "string" ||
      !regexCodigo.test(codigoRegion) ||
      codigoRegion.length < 2
    ) {
      return res
        .status(400)
        .send({ respuesta: await getMesnajes("badRequest") });
    }
    next();
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.validarNoObligatorios = async (req, res, next) => {
  try {
    const {
      direccion,
      direccionNumero,
      detallesDireccion,
      direccionPoblacion,
    } = req.body;
    const regexTexto = new RegExp(/[\s\w\.\,\-áéíóúÁÉÍÓÚñÑ%$¡!¿?()]+$/);
    const regexNumero = new RegExp(/^\d+$/);
    if (
      (direccion.length > 0 &&
        (!regexTexto.test(direccion) || direccion.length > 100)) ||
      (direccionPoblacion.length > 0 &&
        (!regexTexto.test(direccionPoblacion) ||
          direccionPoblacion.length > 30)) ||
      (detallesDireccion.length > 0 &&
        (!regexTexto.test(detallesDireccion) ||
          detallesDireccion.length > 20)) ||
      (direccionNumero.length > 0 &&
        (!regexNumero.test(direccionNumero) || direccionNumero.length > 8))
    ) {
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });
    }
    next();
  } catch (error) {
    await manejarError(error, req, res);
  }
};

exports.validarSiPacienteExiste = async (req, res, next) => {
  try {
    const paciente = await Pacientes.findOne({
      _id: req.idPaciente,
    }).exec();
    if (!paciente)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });

    next();
  } catch (error) {
    await manejarError(error, req, res);
  }
};
