const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SolicitudesIdsSuscriptorPacientes = mongoose.model(
  "solicitudes_ids_suscriptores_pacientees",
  new Schema(
    {
      rutPaciente: { type: String, required: true },
      idSuscriptor: { type: String, required: true },
      accion: { type: String, required: true, enum: ["INSERTAR", "ELIMINAR"] },
    },
    { timestamps: true }
  )
);

module.exports = SolicitudesIdsSuscriptorPacientes;
