const IdsSuscriptorPacientes = require("../models/IdsSuscriptorPacientes");
const SolicitudesIdsSuscriptorPacientes = require("../models/SolicitudesIdsSuscriptorPacientes");
const { getMensajes } = require("../config");
const { handleError } = require("../utils/errorHandler");
const {
  getNombreDispositivo,
} = require("../services/configuracionHrappService");
const { getEstadoActualIdSuscriptor } = require("../services/oneSignalService");

exports.getIdsSuscriptor = async (req, res) => {
  try {
    const idsSuscriptorPaciente = await IdsSuscriptorPacientes.findOne({
      rutPaciente: req.rutPaciente,
    }).exec();

    const idsSuscriptorAEnviar = [];
    for (const idSuscriptor of idsSuscriptorPaciente.idsSuscriptor) {
      const estadoActualIdSuscriptor = await getEstadoActualIdSuscriptor(
        idSuscriptor.idSuscriptor
      );
      if (!estadoActualIdSuscriptor?.id) continue;
      if (estadoActualIdSuscriptor?.invalid_identifier) {
        await IdsSuscriptorPacientes.updateOne(
          {
            rutPaciente: idsSuscriptorPaciente.rutPaciente,
            "idsSuscriptor.idSuscriptor": idSuscriptor.idSuscriptor,
          },
          {
            $pull: {
              idsSuscriptor: { idSuscriptor: idSuscriptor.idSuscriptor },
            },
          }
        ).exec();

        crearSolicitudIdSuscriptor({
          rutPaciente: idsSuscriptorPaciente.rutPaciente,
          idSuscriptor: idSuscriptor.idSuscriptor,
          accion: "ELIMINAR",
          nombreDispositivo: null,
        });

        continue;
      }
      const fechaCreacion = new Date(0);
      if (estadoActualIdSuscriptor?.created_at)
        fechaCreacion.setUTCSeconds(estadoActualIdSuscriptor?.created_at);
      idsSuscriptorAEnviar.push({
        idSuscriptor: idSuscriptor.idSuscriptor,
        nombreDispositivo: idSuscriptor.nombreDispositivo,
        fechaCreacion: estadoActualIdSuscriptor?.created_at
          ? fechaCreacion
          : undefined,
      });
    }

    res.status(200).send(idsSuscriptorAEnviar);
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

      crearSolicitudIdSuscriptor({
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

    crearSolicitudIdSuscriptor({
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

    console.log("deleteIdsSuscriptor", idSuscriptor);

    const log = await IdsSuscriptorPacientes.updateOne(
      { rutPaciente: rutPaciente, "idsSuscriptor.idSuscriptor": idSuscriptor },
      { $pull: { idsSuscriptor: { idSuscriptor } } }
    ).exec();

    console.log("IdsSuscriptorPacientes.updateOne", idSuscriptor, log);

    await crearSolicitudIdSuscriptor({
      rutPaciente,
      idSuscriptor,
      accion: "ELIMINAR",
      nombreDispositivo: null,
    });

    console.log("crearSolicitudIdSuscriptor despues", idSuscriptor);

    res.status(200).send({ respuesta: await getMensajes("success") });
  } catch (error) {
    console.log("error", error);
    await handleError(res, error);
  }
};

const crearSolicitudIdSuscriptor = async ({
  rutPaciente,
  idSuscriptor,
  accion,
  nombreDispositivo,
}) => {

  console.log("crearSolicitudIdSuscriptor", idSuscriptor);

  const solicitudIdSuscriptor = await SolicitudesIdsSuscriptorPacientes.findOne(
    {
      rutPaciente,
      idSuscriptor,
      accion,
      nombreDispositivo,
    }
  ).exec();

  console.log("solicitudIdSuscriptor", idSuscriptor, solicitudIdSuscriptor);

  if (!solicitudIdSuscriptor) {
    const log = await SolicitudesIdsSuscriptorPacientes.create({
      rutPaciente,
      idSuscriptor,
      accion,
      nombreDispositivo,
    });

    console.log("SolicitudesIdsSuscriptorPacientes.create", idSuscriptor, log);
  }
};
