const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IdsSuscriptorPacientes = mongoose.model(
  "ids_suscriptor_pacientes",
  new Schema({
    rutPaciente: { type: String, required: true },
    idSuscriptor: [String]
  })
);

module.exports = IdsSuscriptorPacientes;
