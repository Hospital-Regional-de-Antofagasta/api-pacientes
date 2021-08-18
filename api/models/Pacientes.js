const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Pacientes = mongoose.model(
  "paciente",
  new Schema(
    {
      numerosPaciente: [
        {
          _id: false,
          numero: {type: Number, require: true, select: false},
          codigoEstablecimiento: {type: String, require: true, select: false},
          hospital: {type: Object, select: false},
          nombreEstablecimiento: String,
        }
      ],
      rut: String,
      apellidoPaterno: String,
      apellidoMaterno: String,
      nombre: String,
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
      datosContactoActualizados: { type: Boolean, default: false },
      fechaFallecimiento: { type: Date, select: false},
      nombreSocial: String,
    },
    { timestamps: true }
  ).index({'numerosPaciente.numero':1,'numerosPaciente.codigoEstablecimiento':1},{unique: true})
);

module.exports = Pacientes;
