const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PacientesActualizados = mongoose.model(
  "pacientes_actualizado",
  new Schema(
    {
      idPaciente: String,
      numeroPaciente: {
          numero: {type: Number, require: true, unique: true, select: false},
          codigoEstablecimiento: {type: String, require: true, unique: true, select: false},
          nombreEstablecimiento: String,
      },
      direccion: String,
      direccionNumero: String,
      detallesDireccion: String,
      direccionPoblacion: String,
      codigoComuna: String,
      codigoCiudad: String,
      codigoRegion: String,
      telefonoFijo: String,
      telefonoMovil: String,
      correoCuerpo: String,
      correoExtension: String,
    },
    { timestamps: true }
  )
);

module.exports = PacientesActualizados;
