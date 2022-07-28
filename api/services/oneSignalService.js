const { httpRequest } = require("../utils/httpRequests");

const oneSignalAppId = process.env.ONE_SIGNAL_APP_ID;
const oneSignalToken = process.env.ONE_SIGNAL_TOKEN;
const urlOneSignal = process.env.ONE_SIGNAL_URL;

exports.getDevice = async (idSuscriptor) => {
  const config = {
    headers: {
      Authorization: `Basic ${oneSignalToken}`,
      "Content-Type": "application/json",
      Accept: "text/plain",
    },
  };

  const response = await httpRequest(
    "GET",
    `${urlOneSignal}/api/v1/players/${idSuscriptor}?app_id=${oneSignalAppId}`,
    null,
    config,
    10
  );

  if (!response?.data) return response;

  return response.data;
};
