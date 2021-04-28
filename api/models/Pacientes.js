const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Pacientes = mongoose.model('paciente', new Schema ({
    numeroPaciente: {
        type: Number,
        require: true,
        unique: true,
    },
    rut: String,
    apellidoPaterno: String,
    apellidoMaterno: String,
    nombre: String,
    textoCalle: String,
    textoNumero: String,
    textoDepartamento: String,
    textoPoblacion: String,
    codigoComuna: String,
    codigoCiudad: String,
    codigoRegion: String,
    fono: String,
    telefonoMovil: String,
    correoCuerpo: String,
    correoExtension: String,
}, { timestamps: true }))

module.exports = Pacientes