const app = require("../app");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const pacientesSeeds = require("../testSeeds/pacientesSeeds.json");
const { getMensajes } = require("../config");
const ConfigApiPacientes = require("../models/ConfigApiPacientes");
const configSeed = require("../testSeeds/configSeed.json");

const request = supertest(app);
const secreto = process.env.JWT_SECRET;
let token;

beforeEach(async (done) => {
  //Cerrar la conexión que se crea en el index.
  await mongoose.disconnect();
  //Conectar a la base de datos de prueba.
  await mongoose.connect(`${process.env.MONGO_URI_TEST}pacientes_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  //Cargar los seeds a la base de datos.
  await Pacientes.create(pacientesSeeds);
  await ConfigApiPacientes.create(configSeed);

  done();
});

afterEach(async (done) => {
  //Borrar el contenido de la colección en la base de datos despues de la pruebas.
  await Pacientes.deleteMany();
  await PacientesActualizados.deleteMany();
  await ConfigApiPacientes.deleteMany();
  //Cerrar la conexión a la base de datos despues de la pruebas.
  await mongoose.connection.close();

  done();
});

describe("Endpoints", () => {
  describe("GET /v1/pacientes/informacion", () => {
    it("Intenta obtener la información de un paciente sin token", async (done) => {
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

      done();
    });
    it("Intenta obtener la información de un paciente con token (El paciente no existe)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el objeto está vacío.
      const pacienteVacio = respuesta.body;
      expect(pacienteVacio).toStrictEqual({});

      done();
    });
    it("Intenta obtener la información de un paciente con token (El paciente si existe)", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el paciente es el esperado.
      const paciente = respuesta.body;
      expect(paciente.rut).toStrictEqual("10771131-7");
      expect(paciente.nombre).toStrictEqual("JACQUELINE CLOTILDE");
      expect(paciente.nombreSocial).toBeFalsy()
      expect(paciente.apellidoPaterno).toStrictEqual("LAZO");
      expect(paciente.apellidoMaterno).toStrictEqual("ZAMBRA");
      expect(paciente.direccion).toStrictEqual("");
      expect(paciente.direccionNumero).toStrictEqual("");
      expect(paciente.detallesDireccion).toStrictEqual(" ");
      expect(paciente.direccionPoblacion).toStrictEqual("");
      expect(paciente.codigoComuna).toStrictEqual("01");
      expect(paciente.codigoCiudad).toStrictEqual("03");
      expect(paciente.codigoRegion).toStrictEqual("01");
      expect(paciente.telefonoFijo).toStrictEqual("");
      expect(paciente.telefonoMovil).toStrictEqual("");
      expect(paciente.correoCuerpo).toStrictEqual("");
      expect(paciente.correoExtension).toStrictEqual("");
      expect(paciente.datosContactoActualizados).toBeFalsy();
      done();
    });
    it("Intenta obtener la información de un paciente con token (El paciente si existe y con nombre social)", async (done) => {
      token = jwt.sign({ numeroPaciente: 3 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el paciente es el esperado.
      const paciente = respuesta.body;
      expect(paciente.rut).toStrictEqual("17724699-9");
      expect(paciente.nombre).toStrictEqual("JOHANA GABRIEL");
      expect(paciente.nombreSocial).toStrictEqual("name");
      expect(paciente.apellidoPaterno).toStrictEqual("RIVERA");
      expect(paciente.apellidoMaterno).toStrictEqual("ARANCIBIA");
      expect(paciente.direccion).toStrictEqual("");
      expect(paciente.direccionNumero).toStrictEqual("");
      expect(paciente.detallesDireccion).toStrictEqual(" ");
      expect(paciente.direccionPoblacion).toStrictEqual("");
      expect(paciente.codigoComuna).toStrictEqual("01");
      expect(paciente.codigoCiudad).toStrictEqual("03");
      expect(paciente.codigoRegion).toStrictEqual("01");
      expect(paciente.telefonoFijo).toStrictEqual("");
      expect(paciente.telefonoMovil).toStrictEqual("");
      expect(paciente.correoCuerpo).toStrictEqual("");
      expect(paciente.correoExtension).toStrictEqual("");
      expect(paciente.datosContactoActualizados).toBeTruthy();
      done();
    });
  });
  describe("POST /v1/pacientes/actualizar-datos", () => {
    it("Intenta actualizar los datos de un paciente sin token", async (done) => {
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

      done();
    });
    it("Intenta actualizar los datos de un paciente con token (El paciente no existe)", async (done) => {
      token = jwt.sign({ numeroPaciente: 5 }, secreto);
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
      };
      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

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

      done();
    });
    it("Should update datos de un paciente", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
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
      };
      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
      });

      const paciente = await Pacientes.findOne({
        numeroPaciente: 4,
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
      expect(pacienteActualizado.numeroPaciente).toBeFalsy();
      expect(pacienteActualizado.direccion).toStrictEqual("CHHUU");
      expect(pacienteActualizado.direccionNumero).toStrictEqual("444442");
      expect(pacienteActualizado.detallesDireccion).toStrictEqual("40Y");
      expect(pacienteActualizado.direccionPoblacion).toStrictEqual("GRANVÍ");
      expect(pacienteActualizado.codigoComuna).toStrictEqual("01    ");
      expect(pacienteActualizado.codigoCiudad).toStrictEqual("03 ");
      expect(pacienteActualizado.codigoRegion).toStrictEqual("01 ");
      expect(pacienteActualizado.telefonoFijo).toStrictEqual("123456789");
      expect(pacienteActualizado.telefonoMovil).toStrictEqual("12345678");
      expect(pacienteActualizado.correoCuerpo).toBe("niicoleperez");
      expect(pacienteActualizado.correoExtension).toBe("gmail.com");

      expect(paciente.datosContactoActualizados).toBeTruthy();

      done();
    });
    it("Should not update datos de contacto del paciente si el correo es vacio", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
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

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
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

      expect(pacienteActualizado).toBeFalsy();

      done();
    });
    it("Should not update datos de contacto del paciente si el correo es invalido", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
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

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
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

      expect(pacienteActualizado).toBeFalsy();

      done();
    });
    it("Should not update datos de contacto del paciente si ambos telefonos son vacios", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
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

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
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

      expect(pacienteActualizado).toBeFalsy();

      done();
    });
  });
  describe("GET /v1/pacientes/verificar-si-datos-contacto-confirmados", () => {
    it("Should not verify without token", async (done) => {
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

      done();
    });
    it("Should not verify if paciente does not exists", async (done) => {
      token = jwt.sign({ numeroPaciente: 5 }, secreto);
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

      done();
    });
    it("Should verify paciente without confirmed datos contacto", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
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

      done();
    });
    it("Should verify paciente with confirmed datos contacto", async (done) => {
      token = jwt.sign({ numeroPaciente: 3 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/verificar-si-datos-contacto-confirmados")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ datosContactoConfirmados: true });

      done();
    });
  });
  describe("GET /v1/pacientes/verificar-solicitud-duplicada", () => {
    it("Should not verify without token", async (done) => {
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

      done();
    });
    it("Should not verify if paciente does not exists", async (done) => {
      token = jwt.sign({ numeroPaciente: 5 }, secreto);
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

      done();
    });
    it("Should verify without existing solicitud de actualizar datos", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ solicitudDuplicada: false });

      done();
    });
    it("Should verify with existing solicitud de actualizar datos", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const pacienteActualizar = {
        numeroPaciente: 4,
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

      done();
    });
  });
});
