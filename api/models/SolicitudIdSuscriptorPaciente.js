const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/* Modelo para solicitudes de actualización de paciente */
const SolicitudIdSuscriptorPaciente = mongoose.model(
  "solicitud_id_suscriptor_paciente",
  new Schema(
    {
      rutPaciente: { type: String, required: true, select: false },
      idSuscriptorPaciente: { type: String, required: true, unique: true },
    },
    { timestamps: true }
  )
);

module.exports = SolicitudIdSuscriptorPaciente;
