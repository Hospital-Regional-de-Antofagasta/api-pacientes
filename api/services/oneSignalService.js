const { httpRequest } = require("../utils/httpRequests");

const oneSignalAppId = process.env.ONE_SIGNAL_APP_ID;
const oneSignalToken = process.env.ONE_SIGNAL_TOKEN;
const urlOneSignal = process.env.ONE_SIGNAL_URL;

exports.getEstadoActualIdSuscriptor = async (idsSuscriptor) => {
  const config = {
    headers: {
      Authorization: `Bearer token="${oneSignalToken}"`,
    },
  };

  const response = await httpRequest(
    "GET",
    `${urlOneSignal}/api/v1/players/${idsSuscriptor}?app_id=${oneSignalAppId}`,
    config,
    10
  );

  if (!response?.data) return response;

  return response.data;
};
