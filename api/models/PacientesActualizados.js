const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PacientesActualizados = mongoose.model(
  "pacientes_actualizado",
  new Schema(
    {
      numeroPaciente: {
        type: Number,
        require: true,
        unique: true,
        select: false,
      },
      direccionCalle: String,
      direccionNumero: String,
      direccionDepartamento: String,
      direccionPoblacion: String,
      codigoComuna: String,
      codigoCiudad: String,
      codigoRegion: String,
      fono: String,
      telefonoMovil: String,
      correoCuerpo: String,
      correoExtension: String,
    },
    { timestamps: true }
  )
);

module.exports = PacientesActualizados;
