const ConfigApiPacientes = require("./models/ConfigApiPacientes");

let mensajes = {
  forbiddenAccess: "No tiene la autorización para realizar esta acción.",
  serverError: "Se produjo un error.",
  badRequest: "La petición no está bien formada.",
};

const loadConfig = async () => {
  try {
    const config = await ConfigApiPacientes.findOne({ version: 1 }).exec();
    mensajes = config.mensajes;
  } catch (error) {}
};

module.exports = {
  loadConfig,
  mensajes,
};
