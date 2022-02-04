const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConocimientoDeuda = mongoose.model(
  "conocimiento_deuda",
  new Schema({
    idPaciente: { type: Schema.Types.ObjectId, ref: "paciente", required: true },
    rutPaciente: { type: String, required: true },
    fecha: { type: Date, required: true },
  },
  { timestamps: true })
);

module.exports = ConocimientoDeuda;
