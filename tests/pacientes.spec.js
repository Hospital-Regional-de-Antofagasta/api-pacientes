const app = require("../api/app");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const Pacientes = require("../api/models/Pacientes");
const pacientesSeeds = require("./testSeeds/pacientesSeeds.json");
const idsSuscriptorSeeds = require("./testSeeds/idsSuscriptorSeeds.json");

const PacientesActualizados = require("../api/models/PacientesActualizados");
const { getMensajes } = require("../api/config");
const ConfigApiPacientes = require("../api/models/ConfigApiPacientes");
const configSeed = require("./testSeeds/configSeed.json");
const IdsSuscriptorPacientes = require("../api/models/IdsSuscriptorPacientes");
const SolicitudesIdsSuscriptorPacientes = require("../api/models/SolicitudesIdsSuscriptorPacientes");

const request = supertest(app);
const secreto = process.env.JWT_SECRET;

const tokenPacienteNoExistente = jwt.sign(
  {
    _id: "000000000000",
    rut: "2-2",
  },
  secreto
);

const getToken = async (idPaciente) => {
  const paciente = await Pacientes.findById(idPaciente)
    .select("_id rut")
    .exec();

  return {
    token: jwt.sign(
      {
        _id: paciente._id,
        rut: paciente.rut,
      },
      secreto
    ),
    rutPaciente: paciente.rut,
  };
};

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI}/pacientes_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Pacientes.create(pacientesSeeds);
  await ConfigApiPacientes.create(configSeed);
  await IdsSuscriptorPacientes.create(idsSuscriptorSeeds);
});

afterEach(async () => {
  await Pacientes.deleteMany();
  await PacientesActualizados.deleteMany();
  await ConfigApiPacientes.deleteMany();
  await IdsSuscriptorPacientes.deleteMany();
  await SolicitudesIdsSuscriptorPacientes.deleteMany();
  /* Se limpia colección para iniciar siempre con colección vacia */
  await mongoose.connection.close();
});

describe("Endpoints", () => {
  describe("GET /v1/pacientes/informacion", () => {
    it("Intenta obtener la información de un paciente sin token", async () => {
      const respuesta = await request.get("/v1/pacientes/informacion");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Intenta obtener la información de un paciente con token (El paciente no existe)", async () => {
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", tokenPacienteNoExistente);
      expect(respuesta.status).toBe(200);
      //Probar que el objeto está vacío.
      const pacienteVacio = respuesta.body;
      expect(pacienteVacio).toStrictEqual({});
    });
    it("Intenta obtener la información de un paciente con token (El paciente si existe)", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdc");

      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el paciente es el esperado.
      const pacienteObtenido = respuesta.body;
      expect(pacienteObtenido.rut).toBeFalsy();
      expect(pacienteObtenido.nombre).toStrictEqual("JACQUELINE CLOTILDE");
      expect(pacienteObtenido.nombreSocial).toBeFalsy();
      expect(pacienteObtenido.apellidoPaterno).toStrictEqual("LAZO");
      expect(pacienteObtenido.apellidoMaterno).toStrictEqual("ZAMBRA");
      expect(pacienteObtenido.direccion).toStrictEqual("");
      expect(pacienteObtenido.direccionNumero).toStrictEqual("");
      expect(pacienteObtenido.detallesDireccion).toStrictEqual(" ");
      expect(pacienteObtenido.direccionPoblacion).toStrictEqual("");
      expect(pacienteObtenido.codigoComuna).toStrictEqual("01");
      expect(pacienteObtenido.codigoCiudad).toStrictEqual("03");
      expect(pacienteObtenido.codigoRegion).toStrictEqual("01");
      expect(pacienteObtenido.telefonoFijo).toStrictEqual("");
      expect(pacienteObtenido.telefonoMovil).toStrictEqual("");
      expect(pacienteObtenido.correoCuerpo).toStrictEqual("");
      expect(pacienteObtenido.correoExtension).toStrictEqual("");
      expect(pacienteObtenido.codigosEstablecimientos).toEqual(["HRA"]);
      expect(pacienteObtenido.datosContactoActualizados).toBeFalsy();
    });
    it("Intenta obtener la información de un paciente con token (El paciente si existe y con nombre social)", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdd");
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el paciente es el esperado.
      const pacienteObtenido = respuesta.body;
      expect(pacienteObtenido.rut).toBeFalsy();
      expect(pacienteObtenido.nombre).toStrictEqual("JOHANA GABRIEL");
      expect(pacienteObtenido.nombreSocial).toStrictEqual("name");
      expect(pacienteObtenido.apellidoPaterno).toStrictEqual("RIVERA");
      expect(pacienteObtenido.apellidoMaterno).toStrictEqual("ARANCIBIA");
      expect(pacienteObtenido.direccion).toStrictEqual("");
      expect(pacienteObtenido.direccionNumero).toStrictEqual("");
      expect(pacienteObtenido.detallesDireccion).toStrictEqual(" ");
      expect(pacienteObtenido.direccionPoblacion).toStrictEqual("");
      expect(pacienteObtenido.codigoComuna).toStrictEqual("01");
      expect(pacienteObtenido.codigoCiudad).toStrictEqual("03");
      expect(pacienteObtenido.codigoRegion).toStrictEqual("01");
      expect(pacienteObtenido.telefonoFijo).toStrictEqual("");
      expect(pacienteObtenido.telefonoMovil).toStrictEqual("");
      expect(pacienteObtenido.correoCuerpo).toStrictEqual("");
      expect(pacienteObtenido.correoExtension).toStrictEqual("");
      expect(pacienteObtenido.codigosEstablecimientos).toEqual(["HRA"]);
      expect(pacienteObtenido.datosContactoActualizados).toBeTruthy();
    });
    it("Intenta obtener la información de un paciente con token, por rut (El paciente si existe y con nombre social)", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdd");
      const respuesta = await request
        .get("/v1/pacientes/informacion?filter=rut")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el paciente es el esperado.
      const pacienteObtenido = respuesta.body;
      expect(pacienteObtenido.rut).toBe("17724699-9");
      expect(pacienteObtenido.nombre).toStrictEqual("JOHANA GABRIEL");
      expect(pacienteObtenido.nombreSocial).toStrictEqual("name");
      expect(pacienteObtenido.apellidoPaterno).toStrictEqual("RIVERA");
      expect(pacienteObtenido.apellidoMaterno).toStrictEqual("ARANCIBIA");
      expect(pacienteObtenido.direccion).toStrictEqual("");
      expect(pacienteObtenido.direccionNumero).toStrictEqual("");
      expect(pacienteObtenido.detallesDireccion).toStrictEqual(" ");
      expect(pacienteObtenido.direccionPoblacion).toStrictEqual("");
      expect(pacienteObtenido.codigoComuna).toStrictEqual("01");
      expect(pacienteObtenido.codigoCiudad).toStrictEqual("03");
      expect(pacienteObtenido.codigoRegion).toStrictEqual("01");
      expect(pacienteObtenido.telefonoFijo).toStrictEqual("");
      expect(pacienteObtenido.telefonoMovil).toStrictEqual("");
      expect(pacienteObtenido.correoCuerpo).toStrictEqual("");
      expect(pacienteObtenido.correoExtension).toStrictEqual("");
      expect(pacienteObtenido.codigosEstablecimientos).toEqual(["HRA"]);
      expect(pacienteObtenido.datosContactoActualizados).toBeTruthy();
    });
  });
  describe("POST /v1/pacientes/actualizar-datos", () => {
    it("Intenta actualizar los datos de un paciente sin token", async () => {
      const respuesta = await request.post("/v1/pacientes/actualizar-datos");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Intenta actualizar los datos de un paciente con token (El paciente no existe)", async () => {
      const pacienteActualizar = {
        direccion: "Calle Nueva 123",
        direccionNumero: "10",
        detallesDireccion: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        telefonoFijo: "",
        telefonoMovil: "94924483",
        correoCuerpo: "correo",
        correoExtension: "correo.com",
        codigoEstablecimiento: "HRA",
      };
      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", tokenPacienteNoExistente)
        .send(pacienteActualizar);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Should update datos de un paciente", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");
      const pacienteActualizar = {
        direccion: "chhuu",
        direccionNumero: "444442",
        detallesDireccion: "40y",
        direccionPoblacion: "granví",
        codigoComuna: "01    ",
        codigoCiudad: "03 ",
        codigoRegion: "01 ",
        telefonoFijo: "123456789",
        telefonoMovil: "12345678",
        correoCuerpo: "niicoleperez",
        correoExtension: "gmail.com",
        codigoEstablecimiento: "HRA",
      };
      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const solicitudesPacienteActualizado = await PacientesActualizados.find({
        rut: rutPaciente,
      });
      const mensaje = await getMensajes("solicitudCreada");

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      //Probar que el paciente está en la colección de actualizados.
      expect(solicitudesPacienteActualizado[0].rut).toBeFalsy();
      expect(solicitudesPacienteActualizado[0].direccion).toStrictEqual(
        "CHHUU"
      );
      expect(solicitudesPacienteActualizado[0].direccionNumero).toStrictEqual(
        "444442"
      );
      expect(solicitudesPacienteActualizado[0].detallesDireccion).toStrictEqual(
        "40Y"
      );
      expect(
        solicitudesPacienteActualizado[0].direccionPoblacion
      ).toStrictEqual("GRANVÍ");
      expect(solicitudesPacienteActualizado[0].codigoComuna).toStrictEqual(
        "01    "
      );
      expect(solicitudesPacienteActualizado[0].codigoCiudad).toStrictEqual(
        "03 "
      );
      expect(solicitudesPacienteActualizado[0].codigoRegion).toStrictEqual(
        "01 "
      );
      expect(solicitudesPacienteActualizado[0].telefonoFijo).toStrictEqual(
        "123456789"
      );
      expect(solicitudesPacienteActualizado[0].telefonoMovil).toStrictEqual(
        "12345678"
      );
      expect(solicitudesPacienteActualizado[0].correoCuerpo).toBe(
        "niicoleperez"
      );
      expect(solicitudesPacienteActualizado[0].correoExtension).toBe(
        "gmail.com"
      );
      expect(solicitudesPacienteActualizado[0].codigoEstablecimiento).toBe(
        "HRA"
      );
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      expect(paciente.datosContactoActualizados).toBeTruthy();
    });
    it("Should not update datos de contacto del paciente si el correo es vacio", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");
      const pacienteActualizar = {
        direccion: "Calle Nueva 123",
        direccionNumero: "10",
        detallesDireccion: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        telefonoFijo: "",
        telefonoMovil: "94924483",
        correoCuerpo: "",
        correoExtension: "",
      };

      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.find({
        rut: rutPaciente,
      });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      expect(pacienteActualizado).toStrictEqual([]);
    });
    it("Should not update datos de contacto del paciente si el correo es invalido", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const pacienteActualizar = {
        direccion: "Calle Nueva 123",
        direccionNumero: "10",
        detallesDireccion: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        telefonoFijo: "",
        telefonoMovil: "94924483",
        correoCuerpo: "cor=reo",
        correoExtension: "correo",
      };

      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.find({
        rut: rutPaciente,
      });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      expect(pacienteActualizado).toStrictEqual([]);
    });
    it("Should not update datos de contacto del paciente si ambos telefonos son vacios", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const pacienteActualizar = {
        direccion: "Calle Nueva 123",
        direccionNumero: "10",
        detallesDireccion: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        telefonoFijo: "",
        telefonoMovil: "",
        correoCuerpo: "correo",
        correoExtension: "correo.com",
      };

      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.find({
        rut: rutPaciente,
      });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      expect(pacienteActualizado).toStrictEqual([]);
    });
  });
  describe("GET /v1/pacientes/verificar-si-datos-contacto-confirmados", () => {
    it("Should not verify without token", async () => {
      const respuesta = await request
        .get("/v1/pacientes/verificar-si-datos-contacto-confirmados")
        .set("Authorization", "no-token");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Should not verify if paciente does not exists", async () => {
      const respuesta = await request
        .get("/v1/pacientes/verificar-si-datos-contacto-confirmados")
        .set("Authorization", tokenPacienteNoExistente);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Should verify paciente without datos contacto confirmados", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .get("/v1/pacientes/verificar-si-datos-contacto-confirmados")
        .set("Authorization", token);

      const mensaje = await getMensajes("datosContactoNoConfirmados");

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        datosContactoConfirmados: false,
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Should verify paciente without datos contacto confirmados si es validacion", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .get(
          "/v1/pacientes/verificar-si-datos-contacto-confirmados?esValidacion=true"
        )
        .set("Authorization", token);

      const mensaje = await getMensajes(
        "esValidacionDatosContactoNoConfirmados"
      );

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        datosContactoConfirmados: false,
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Should verify paciente with datos contacto confirmados", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdd");

      const respuesta = await request
        .get("/v1/pacientes/verificar-si-datos-contacto-confirmados")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ datosContactoConfirmados: true });
    });
    it("Should verify paciente with datos contacto confirmados si es validacion", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdd");

      const respuesta = await request
        .get(
          "/v1/pacientes/verificar-si-datos-contacto-confirmados?esValidacion=true"
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ datosContactoConfirmados: true });
    });
  });
  describe("GET /v1/pacientes/verificar-solicitud-duplicada", () => {
    it("Should not verify without token", async () => {
      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", "no-token");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Should not verify if paciente does not exists", async () => {
      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", tokenPacienteNoExistente);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("Should verify without existing solicitud de actualizar datos", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ solicitudDuplicada: false });
    });
    it("Should verify with existing solicitud de actualizar datos", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const pacienteActualizar = {
        idPaciente: "6101834e912f6209f4851fdb",
        rut: rutPaciente,
        direccion: "Calle Nueva 123",
        direccionNumero: "10",
        detallesDireccion: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        telefonoFijo: "",
        telefonoMovil: "094924483",
        correoCuerpo: "correo",
        correoExtension: "correo.com",
        codigoEstablecimiento: "HRA",
      };
      await PacientesActualizados.create(pacienteActualizar);
      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", token);

      const mensaje = await getMensajes("solicitudDuplicada");

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        solicitudDuplicada: true,
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
  });
  describe("POST /v1/pacientes/id-suscriptor", () => {
    it("Intenta agregar idSuscriptor sin token", async () => {
      const respuesta = await request.post("/v1/pacientes/id-suscriptor").send({
        idSuscriptorPaciente: "778891",
        nombreDispositivo: "iPhone9,3",
      });

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: null,
        "idsSuscriptor.idSuscriptor": "778891",
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: null,
          idSuscriptor: "778891",
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Intenta agregar idSuscriptor con token falso", async () => {
      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", "token")
        .send({
          idSuscriptorPaciente: "778891",
          nombreDispositivo: "iPhone9,3",
        });

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: null,
        "idsSuscriptor.idSuscriptor": "778891",
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: null,
          idSuscriptor: "778891",
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Intenta agregar idSuscriptor si paciente no existe", async () => {
      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", tokenPacienteNoExistente)
        .send({
          idSuscriptorPaciente: "778891",
          nombreDispositivo: "iPhone9,3",
        });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: "2-2",
        "idsSuscriptor.idSuscriptor": "778891",
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: "2-2",
          idSuscriptor: "778891",
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Intenta agregar idSuscriptor si no se reciben los valores (body vacio)", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send();

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": null,
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: null,
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Intenta agregar idSuscriptor si no se reciben los valores (objeto vacio)", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({});

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": null,
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: null,
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Debería retornar error si no se recibe el idSuscriptor.", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ nombreDispositivo: "iPhone9,3" });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": null,
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: null,
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Debería retornar error si no se recibe el modelo del dispositivo.", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ idSuscriptor: "778891" });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": "778891",
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: "778891",
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Debería retornar error si el idSuscriptor no es válido.", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ idSuscriptor: {}, nombreDispositivo: "SM-S901B" });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": null,
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: null,
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    it("Debería retornar error si el modelo del dispositivo no es válido.", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ idSuscriptor: "778891", nombreDispositivo: 1 });

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": "778891",
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: "778891",
        }).exec();

      expect(solicitudIdSuscriptor).toBeFalsy();
    });
    // estos tests solo funcionan localmente
    // it("Intenta agregar idSuscriptor ya existente al paciente", async () => {
    //   const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

    //   const respuesta = await request
    //     .post("/v1/pacientes/id-suscriptor")
    //     .set("Authorization", token)
    //     .send({ idSuscriptor: "778800", nombreDispositivo: "SM-G973F" });

    //   const mensaje = await getMensajes("success");

    //   expect(respuesta.status).toBe(201);

    //   expect(respuesta.body).toEqual({
    //     respuesta: {
    //       titulo: mensaje.titulo,
    //       mensaje: mensaje.mensaje,
    //       color: mensaje.color,
    //       icono: mensaje.icono,
    //     },
    //   });

    //   const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
    //     rutPaciente: rutPaciente,
    //     "idsSuscriptor.idSuscriptor": "778800",
    //     "idsSuscriptor.esExternalId": true,
    //   }).exec();

    //   const idSuscriptor = idSuscriptorAgregado.idsSuscriptor.filter(
    //     (e) => e.idSuscriptor === "778800"
    //   );

    //   expect(idSuscriptor.length).toBe(1);
    //   expect(idSuscriptorAgregado.idsSuscriptor[1].idSuscriptor).toBe("778800");
    //   expect(idSuscriptorAgregado.idsSuscriptor[1].nombreDispositivo).toBe(
    //     "Galaxy S10"
    //   );
    //   expect(idSuscriptorAgregado.idsSuscriptor[1].esExternalId).toBeTruthy();

    //   const solicitudIdSuscriptor =
    //     await SolicitudesIdsSuscriptorPacientes.findOne({
    //       rutPaciente: rutPaciente,
    //       idSuscriptor: "778800",
    //     }).exec();

    //   expect(solicitudIdSuscriptor).toBeFalsy();
    // });
    // it("Intenta agregar idSuscriptor al paciente que no tenía ninguno y crea una solicitud de insertar el idSuscriptor", async () => {
    //   const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdd");

    //   const respuesta = await request
    //     .post("/v1/pacientes/id-suscriptor")
    //     .set("Authorization", token)
    //     .send({ idSuscriptor: "778899", nombreDispositivo: "iPhone9,3" });

    //   const mensaje = await getMensajes("success");

    //   expect(respuesta.status).toBe(201);

    //   expect(respuesta.body).toEqual({
    //     respuesta: {
    //       titulo: mensaje.titulo,
    //       mensaje: mensaje.mensaje,
    //       color: mensaje.color,
    //       icono: mensaje.icono,
    //     },
    //   });

    //   const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
    //     rutPaciente: rutPaciente,
    //     "idsSuscriptor.idSuscriptor": "778899",
    //     "idsSuscriptor.esExternalId": true,
    //   }).exec();

    //   expect(idSuscriptorAgregado.rutPaciente).toBe(rutPaciente);
    //   expect(idSuscriptorAgregado.idsSuscriptor.length).toBe(1);
    //   expect(idSuscriptorAgregado.idsSuscriptor[0].idSuscriptor).toBe("778899");
    //   expect(idSuscriptorAgregado.idsSuscriptor[0].nombreDispositivo).toBe(
    //     "iPhone 7"
    //   );
    //   expect(idSuscriptorAgregado.idsSuscriptor[0].esExternalId).toBeTruthy();

    //   const solicitudIdSuscriptor =
    //     await SolicitudesIdsSuscriptorPacientes.findOne({
    //       rutPaciente: rutPaciente,
    //       idSuscriptor: "778899",
    //     }).exec();

    //   expect(solicitudIdSuscriptor).toBeTruthy();
    //   expect(solicitudIdSuscriptor.rutPaciente).toBe(rutPaciente);
    //   expect(solicitudIdSuscriptor.idSuscriptor).toBe("778899");
    //   expect(solicitudIdSuscriptor.accion).toBe("INSERTAR");
    //   expect(solicitudIdSuscriptor.codigoEstablecimiento).toBe("HRA");
    //   expect(solicitudIdSuscriptor.nombreDispositivo).toBe("iPhone 7");
    // });
    // it("Intenta agregar idSuscriptor al paciente y crea una solicitud de insertar el idSuscriptor", async () => {
    //   const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

    //   const respuesta = await request
    //     .post("/v1/pacientes/id-suscriptor")
    //     .set("Authorization", token)
    //     .send({ idSuscriptor: "161718", nombreDispositivo: "SM-G991N" });

    //   const mensaje = await getMensajes("success");

    //   expect(respuesta.status).toBe(201);

    //   expect(respuesta.body).toEqual({
    //     respuesta: {
    //       titulo: mensaje.titulo,
    //       mensaje: mensaje.mensaje,
    //       color: mensaje.color,
    //       icono: mensaje.icono,
    //     },
    //   });

    //   const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
    //     rutPaciente: rutPaciente,
    //     "idsSuscriptor.idSuscriptor": "161718",
    //     "idsSuscriptor.esExternalId": true,
    //   }).exec();

    //   expect(idSuscriptorAgregado.idsSuscriptor[4].idSuscriptor).toBe("161718");
    //   expect(idSuscriptorAgregado.idsSuscriptor[4].nombreDispositivo).toBe(
    //     "Galaxy S21 5G"
    //   );
    //   expect(idSuscriptorAgregado.idsSuscriptor[0].esExternalId).toBeTruthy();

    //   const solicitudIdSuscriptor =
    //     await SolicitudesIdsSuscriptorPacientes.findOne({
    //       rutPaciente: rutPaciente,
    //       idSuscriptor: "161718",
    //     }).exec();

    //   expect(solicitudIdSuscriptor).toBeTruthy();
    //   expect(solicitudIdSuscriptor.rutPaciente).toBe(rutPaciente);
    //   expect(solicitudIdSuscriptor.idSuscriptor).toBe("161718");
    //   expect(solicitudIdSuscriptor.accion).toBe("INSERTAR");
    //   expect(solicitudIdSuscriptor.codigoEstablecimiento).toBe("HRA");
    //   expect(solicitudIdSuscriptor.nombreDispositivo).toBe("Galaxy S21 5G");
    // });
    //estos tests solo funcionan localmente
  });
  describe("GET /v1/pacientes/id-suscriptor", () => {
    it("Debería retornar error si no se recibe token.", async () => {
      const respuesta = await request.get("/v1/pacientes/id-suscriptor");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el token es invalido.", async () => {
      const respuesta = await request
        .get("/v1/pacientes/id-suscriptor")
        .set("Authorization", "token");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el paciente no existe.", async () => {
      const respuesta = await request
        .get("/v1/pacientes/id-suscriptor")
        .set("Authorization", tokenPacienteNoExistente);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería obtener los ids suscriptor del paciente.", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .get("/v1/pacientes/id-suscriptor")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(4);
      expect(respuesta.body[0].idSuscriptor).toBe("778899");
      expect(respuesta.body[0].nombreDispositivo).toBe("iPhone 7");
      expect(respuesta.body[1].idSuscriptor).toBe("778800");
      expect(respuesta.body[1].nombreDispositivo).toBe("Galaxy S10");
      expect(respuesta.body[2].idSuscriptor).toBe("101112");
      expect(respuesta.body[2].nombreDispositivo).toBe("Galaxy S22");
      expect(respuesta.body[3].idSuscriptor).toBe("131415");
      expect(respuesta.body[3].nombreDispositivo).toBe("iphone 13");
    });
  });
  describe("DELETE /v1/pacientes/id-suscriptor/:idSuscriptor", () => {
    it("Debería retornar error si no se recibe token.", async () => {
      const respuesta = await request.delete(
        "/v1/pacientes/id-suscriptor/778899"
      );

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el token es invalido.", async () => {
      const respuesta = await request
        .delete("/v1/pacientes/id-suscriptor/778899")
        .set("Authorization", "token");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el paciente no existe.", async () => {
      const respuesta = await request
        .delete("/v1/pacientes/id-suscriptor/778899")
        .set("Authorization", tokenPacienteNoExistente);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el idSuscriptor no existe.", async () => {
      const { token } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .delete("/v1/pacientes/id-suscriptor/778891")
        .set("Authorization", token);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería eliminar el id suscriptor y crear una solicitud de eliminar el idSuscriptor cuando solo tiene uno.", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdc");

      const respuesta = await request
        .delete("/v1/pacientes/id-suscriptor/161718")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": "161718",
      }).exec();

      expect(idSuscriptorAgregado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: "161718",
        }).exec();

      expect(solicitudIdSuscriptor).toBeTruthy();
      expect(solicitudIdSuscriptor.rutPaciente).toBe(rutPaciente);
      expect(solicitudIdSuscriptor.idSuscriptor).toBe("161718");
      expect(solicitudIdSuscriptor.accion).toBe("ELIMINAR");
      expect(solicitudIdSuscriptor.codigoEstablecimiento).toBe("HRA");
      expect(solicitudIdSuscriptor.nombreDispositivo).toBeFalsy();
    });
    it("Debería eliminar el id suscriptor y crear una solicitud de eliminar el idSuscriptor cuando tiene varios.", async () => {
      const { token, rutPaciente } = await getToken("6101834e912f6209f4851fdb");

      const respuesta = await request
        .delete("/v1/pacientes/id-suscriptor/778899")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const idSuscriptorEliminado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: rutPaciente,
        "idsSuscriptor.idSuscriptor": "778899",
      }).exec();

      expect(idSuscriptorEliminado).toBeFalsy();

      const solicitudIdSuscriptor =
        await SolicitudesIdsSuscriptorPacientes.findOne({
          rutPaciente: rutPaciente,
          idSuscriptor: "778899",
        }).exec();

      expect(solicitudIdSuscriptor).toBeTruthy();
      expect(solicitudIdSuscriptor.rutPaciente).toBe(rutPaciente);
      expect(solicitudIdSuscriptor.idSuscriptor).toBe("778899");
      expect(solicitudIdSuscriptor.accion).toBe("ELIMINAR");
      expect(solicitudIdSuscriptor.codigoEstablecimiento).toBe("HRA");
      expect(solicitudIdSuscriptor.nombreDispositivo).toBeFalsy();
    });
  });
});
