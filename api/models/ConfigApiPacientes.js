const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigApiPacientes = mongoose.model(
  "config_api_paciente",
  new Schema({
    mensajes: {
      forbiddenAccess: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      serverError: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      badRequest: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      solicitudCreada: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      datosContactoNoConfirmados: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      solicitudDuplicada: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      esValidacionDatosContactoNoConfirmados: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      conocimientoDeudaRegistrado: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
    },
    version: Number,
  })
);

module.exports = ConfigApiPacientes;
