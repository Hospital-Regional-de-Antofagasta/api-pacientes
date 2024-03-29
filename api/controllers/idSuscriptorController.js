const IdsSuscriptorPacientes = require("../models/IdsSuscriptorPacientes");
const SolicitudesIdsSuscriptorPacientes = require("../models/SolicitudesIdsSuscriptorPacientes");
const { getMensajes } = require("../config");
const { handleError, sendCustomError } = require("../utils/errorHandler");
const {
  getNombreDispositivo,
} = require("../services/configuracionHrappService");
const { getDevice } = require("../services/oneSignalService");

exports.getIdsSuscriptor = async (req, res) => {
  try {
    const idsSuscriptorPaciente = await IdsSuscriptorPacientes.findOne({
      rutPaciente: req.rutPaciente,
    }).exec();

    const idsSuscriptorEliminar = [];
    for (let idSuscriptor of idsSuscriptorPaciente.idsSuscriptor) {
      const oneSignalResponse = await getDevice(idSuscriptor.idSuscriptor);

      if (!oneSignalResponse.id)
        return await sendCustomError(
          res,
          500,
          "serverError",
          oneSignalResponse
        );

      if (oneSignalResponse.invalid_identifier)
        idsSuscriptorEliminar.push(idSuscriptor);
    }

    for (let idSuscriptor of idsSuscriptorEliminar) {
      await removerIdSuscriptor(
        req.rutPaciente,
        idSuscriptor.idSuscriptor
      );

      idsSuscriptorPaciente.idsSuscriptor.splice(
        idsSuscriptorPaciente.idsSuscriptor.indexOf(idSuscriptor),
        1
      );
    }

    res.status(200).send(idsSuscriptorPaciente.idsSuscriptor);
  } catch (error) {
    await handleError(res, error);
  }
};

exports.postIdSuscriptor = async (req, res) => {
  try {
    const { idSuscriptor, nombreDispositivo } = req.body;
    const rutPaciente = req.rutPaciente;

    // Obtener nombre amigable del dispositivo
    let nombreDispositivoAmigable = await getNombreDispositivo(
      req.headers.authorization,
      nombreDispositivo
    );

    nombreDispositivoAmigable = nombreDispositivoAmigable?.nombre
      ? nombreDispositivoAmigable.nombre
      : nombreDispositivo;

    // Si paciente no tiene idsSuscriptor
    const pacienteTieneIdSuscriptor = await IdsSuscriptorPacientes.findOne({
      rutPaciente: rutPaciente,
    }).exec();

    if (!pacienteTieneIdSuscriptor) {
      await IdsSuscriptorPacientes.create({
        rutPaciente,
        idsSuscriptor: [
          { idSuscriptor, nombreDispositivo: nombreDispositivoAmigable },
        ],
      });

      await SolicitudesIdsSuscriptorPacientes.create({
        rutPaciente,
        idSuscriptor,
        accion: "INSERTAR",
        nombreDispositivo: nombreDispositivoAmigable,
      });

      return res.status(201).send({ respuesta: await getMensajes("success") });
    }

    // Si paciente ya tiene ese idSuscriptor
    const existeIdSuscriptor = await IdsSuscriptorPacientes.findOne({
      rutPaciente: rutPaciente,
      "idsSuscriptor.idSuscriptor": idSuscriptor,
    }).exec();

    if (existeIdSuscriptor)
      return res.status(201).send({ respuesta: await getMensajes("success") });

    // Si paciente ya tiene idsSuscriptor pero no ese idSuscriptor
    await IdsSuscriptorPacientes.findOneAndUpdate(
      { rutPaciente: rutPaciente },
      {
        $push: {
          idsSuscriptor: {
            idSuscriptor,
            nombreDispositivo: nombreDispositivoAmigable,
          },
        },
      },
      { runValidator: true }
    ).exec();

    await SolicitudesIdsSuscriptorPacientes.create({
      rutPaciente,
      idSuscriptor,
      accion: "INSERTAR",
      nombreDispositivo: nombreDispositivoAmigable,
    });

    return res.status(201).send({ respuesta: await getMensajes("success") });
  } catch (error) {
    await handleError(res, error);
  }
};

exports.deleteIdsSuscriptor = async (req, res) => {
  try {
    const { idSuscriptor } = req.params;
    const rutPaciente = req.rutPaciente;

    await removerIdSuscriptor(rutPaciente, idSuscriptor);

    res.status(200).send({ respuesta: await getMensajes("success") });
  } catch (error) {
    await handleError(res, error);
  }
};

const removerIdSuscriptor = async (rutPaciente, idSuscriptor) => {
  await IdsSuscriptorPacientes.updateOne(
    { rutPaciente: rutPaciente, "idsSuscriptor.idSuscriptor": idSuscriptor },
    { $pull: { idsSuscriptor: { idSuscriptor } } }
  ).exec();

  await SolicitudesIdsSuscriptorPacientes.create({
    rutPaciente,
    idSuscriptor,
    accion: "ELIMINAR",
    nombreDispositivo: null,
  });
};
