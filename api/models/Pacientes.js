const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Paciente = mongoose.model(
  "paciente",
  new Schema({
    // numeroPaciente: Number,
    rut: { type: String, required: true, unique: true, select: false },
    nombreSocial: String,
    nombre: { type: String },
    apellidoPaterno: { type: String },
    apellidoMaterno: { type: String },
    detallesDireccion: String,
    direccionNumero: String,
    direccion: String,
    direccionPoblacion: String,
    codigoComuna: String,
    codigoCiudad: String,
    codigoRegion: String,
    telefonoFijo: String,
    telefonoMovil: String,
    correoCuerpo: String,
    correoExtension: String,
    codigosEstablecimientos: [String],
    datosContactoActualizados: { type: Boolean, default: false },
  },
  { timestamps: true })
);

module.exports = Paciente;
