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

const request = supertest(app);
const secreto = process.env.JWT_SECRET;
let token;

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
      token = jwt.sign(
        {
          _id: "000000000000",
          rut: "22222222-2",
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el objeto está vacío.
      const pacienteVacio = respuesta.body;
      expect(pacienteVacio).toStrictEqual({});
    });
    it("Intenta obtener la información de un paciente con token (El paciente si existe)", async () => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdc");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdd");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdd")
        .select("_id rut")
        .exec();
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
      token = jwt.sign(
        {
          _id: "000000000000",
          rut: "22222222-2",
        },
        secreto
      );
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
        .set("Authorization", token)
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
      let paciente = await Pacientes.findById(
        "6101834e912f6209f4851fdb"
      ).select("_id rut");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
        rut: paciente.rut,
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
      paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      expect(paciente.datosContactoActualizados).toBeTruthy();
    });
    it("Should not update datos de contacto del paciente si el correo es vacio", async () => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
        rut: paciente.rut,
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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
        rut: paciente.rut,
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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
        rut: paciente.rut,
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
      token = jwt.sign(
        {
          _id: "000000000000",
          rut: "22222222-2",
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/verificar-si-datos-contacto-confirmados")
        .set("Authorization", token);

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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdd");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/verificar-si-datos-contacto-confirmados")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ datosContactoConfirmados: true });
    });
    it("Should verify paciente with datos contacto confirmados si es validacion", async () => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdd");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
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
      token = jwt.sign(
        {
          _id: "000000000000",
          rut: "22222222-2",
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", token);

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
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ solicitudDuplicada: false });
    });
    it("Should verify with existing solicitud de actualizar datos", async () => {
      const paciente = await Pacientes.findById(
        "6101834e912f6209f4851fdb"
      ).select("_id rut");
      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );
      const pacienteActualizar = {
        idPaciente: paciente._id,
        rut: paciente.rut,
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
      const respuesta = await request.post("/v1/pacientes/id-suscriptor");

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
    it("Intenta agregar idSuscriptor con token falso", async () => {
      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", "token")
        .send({ idSuscriptorPaciente: "111100000000022222222333333333" });

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
    it("Intenta agregar idSuscriptor si paciente no existe", async () => {
      token = jwt.sign(
        {
          _id: "000000000000",
          rut: "2-2",
        },
        secreto
      );

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ idSuscriptorPaciente: "111100000000022222222333333333" });

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
    it("Intenta agregar idSuscriptor sin enviar un idSuscriptor (body vacio)", async () => {
      let paciente = await Pacientes.findById("6101834e912f6209f4851fdb")
        .select("_id rut")
        .exec();

      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );

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
    });
    it("Intenta agregar idSuscriptor sin enviar un idSuscriptor (objeto vacio)", async () => {
      let paciente = await Pacientes.findById("6101834e912f6209f4851fdb")
        .select("_id rut")
        .exec();

      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );

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
    });
    it("Intenta agregar idSuscriptor ya existente al paciente ", async () => {
      let paciente = await Pacientes.findById("6101834e912f6209f4851fdb")
        .select("_id rut")
        .exec();

      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ idSuscriptor: "778899" });

      const mensaje = await getMensajes("success");

      expect(respuesta.status).toBe(201);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: paciente.rut,
        idSuscriptor: "778899",
      }).exec();

      expect(
        idSuscriptorAgregado.idSuscriptor.filter((e) => e === "778899").length
      ).toBe(1);
      expect(idSuscriptorAgregado.idSuscriptor[0]).toBe("778899");
    });
    it("Intenta agregar idSuscriptor al paciente que no tenía ninguno", async () => {
      let paciente = await Pacientes.findById("6101834e912f6209f4851fdd")
        .select("_id rut")
        .exec();

      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ idSuscriptor: "908071" });

      const mensaje = await getMensajes("success");

      expect(respuesta.status).toBe(201);

      console.log(respuesta.body);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: paciente.rut,
        idSuscriptor: "908071",
      }).exec();

      expect(idSuscriptorAgregado.rutPaciente).toBe(paciente.rut);
      expect(idSuscriptorAgregado.idSuscriptor.length).toBe(1);
      expect(idSuscriptorAgregado.idSuscriptor[0]).toBe("908071");
    });
    it("Intenta agregar idSuscriptor al paciente", async () => {
      let paciente = await Pacientes.findById("6101834e912f6209f4851fdb")
        .select("_id rut")
        .exec();

      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );

      const respuesta = await request
        .post("/v1/pacientes/id-suscriptor")
        .set("Authorization", token)
        .send({ idSuscriptor: "908070" });

      const mensaje = await getMensajes("success");

      expect(respuesta.status).toBe(201);

      console.log(respuesta.body);

      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      const idSuscriptorAgregado = await IdsSuscriptorPacientes.findOne({
        rutPaciente: paciente.rut,
        idSuscriptor: "908070",
      }).exec();

      expect(idSuscriptorAgregado.idSuscriptor[4]).toBe("908070");
    });
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
      token = jwt.sign(
        {
          _id: "000000000000",
          rut: "2-2",
        },
        secreto
      );

      const respuesta = await request
        .get("/v1/pacientes/id-suscriptor")
        .set("Authorization", token);

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(400);

      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería obtener los ids suscriptor del paciente.", async () => {
      let paciente = await Pacientes.findById("6101834e912f6209f4851fdb")
        .select("_id rut")
        .exec();

      token = jwt.sign(
        {
          _id: paciente._id,
          rut: paciente.rut,
        },
        secreto
      );

      const respuesta = await request
        .get("/v1/pacientes/id-suscriptor")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(4);
      expect(respuesta.body[0]).toBe("778899");
      expect(respuesta.body[1]).toBe("778800");
      expect(respuesta.body[2]).toBe("101112");
      expect(respuesta.body[3]).toBe("131415");
    });
  });
});
