const { httpRequest } = require("./httpRequests");

const urlConfiguracionHrapp = process.env.API_URL;

exports.getNombreDispositivo = async (token, idDispositivo) => {
  const config = {
    headers: {
      Authorization: `${token}`,
    },
  };

  const respuesta = await httpRequest(
    "GET",
    `${urlConfiguracionHrapp}/v1/configuracion-hrapp/diccionario_dispositivos/${idDispositivo}`,
    null,
    config,
    10
  );

  if (!respuesta?.data) return respuesta;

  return respuesta.data;
};
