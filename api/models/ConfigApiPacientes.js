const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConfigApiPacientes = mongoose.model('config_api_paciente', new Schema ({
    mensajes: {
        forbiddenAccess: String,
        serverError: String,
    }
}))

module.exports = ConfigApiPacientes