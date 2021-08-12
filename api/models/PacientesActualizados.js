const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PacientesActualizados = mongoose.model(
  "pacientes_actualizado",
  new Schema(
    {
      idPaciente: String,
      numeroPaciente: {
          numero: {type: Number, require: true, select: false},
          codigoEstablecimiento: {type: String, require: true, select: false},
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
  ).index({'numeroPaciente.numero':1,'numeroPaciente.codigoEstablecimiento':1},{unique: true})
);

module.exports = PacientesActualizados;
