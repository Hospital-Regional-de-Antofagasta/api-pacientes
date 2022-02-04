const ConfigApiPacientes = require("./models/ConfigApiPacientes");

const mensajesPorDefecto = {
  forbiddenAccess: {
    titulo: "Alerta",
    mensaje: "Su sesión ha expirado.",
    color: "",
    icono: "",
  },
  serverError: {
    titulo: "Alerta",
    mensaje: "Ocurrió un error inesperado.",
    color: "",
    icono: "",
  },
  badRequest: {
    titulo: "Alerta",
    mensaje: "La solicitud no está bien formada.",
    color: "",
    icono: "",
  },
  solicitudCreada: {
    titulo: "!Todo ha salido bien¡",
    mensaje:
      "Su solicitud ha sido creada con éxito, en breve su información será actualizada.",
    color: "",
    icono: "",
  },
  datosContactoNoConfirmados: {
    titulo: "Confirmación Pendiente",
    mensaje:
      "Es importante que confirme que su información de contacto está correcta.",
    color: "",
    icono: "",
  },
  solicitudDuplicada: {
    titulo: "Solicitud Pendiente",
    mensaje: "Ya tiene una solicitud en curso.",
    color: "",
    icono: "",
  },
  conocimientoDeudaRegistrado: {
    titulo: "Conocimiento Deuda Registrado",
    mensaje: "Conocimiento de deuda Registrado correctamente.",
    color: "",
    icono: "",
  },
};

exports.getMensajes = async (tipo) => {
  try {
    const { mensajes } = await ConfigApiPacientes.findOne({
      version: 1,
    }).exec();
    if (mensajes) {
      return mensajes[tipo];
    }
    return mensajesPorDefecto[tipo];
  } catch (error) {
    return mensajesPorDefecto[tipo];
  }
};
