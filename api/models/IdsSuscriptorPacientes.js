const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IdsSuscriptorPacientes = mongoose.model(
  "ids_suscriptor_pacientes",
  new Schema(
    {
      rutPaciente: { type: String, required: true },
      idsSuscriptor: {
        type: [
          {
            idSuscriptor: { type: String, required: true },
            nombreDispositivo: { type: String, required: true },
            esExternalId: { type: Boolean }
          },
        ],
        required: true,
      },
    },
    { timestamps: true }
  )
);

module.exports = IdsSuscriptorPacientes;
