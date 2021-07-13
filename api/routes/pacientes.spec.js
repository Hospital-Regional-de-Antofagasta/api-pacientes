const app = require("../index");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const pacientesSeeds = require("../testSeeds/pacientesSeeds.json");

const Pacientes = require("../models/Pacientes");
const PacientesActualizados = require("../models/PacientesActualizados");
const { mensajes } = require("../config");

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

  done();
});

afterEach(async (done) => {
  //Borrar el contenido de la colección en la base de datos despues de la pruebas.
  await Pacientes.deleteMany();
  await PacientesActualizados.deleteMany();
  //Cerrar la conexión a la base de datos despues de la pruebas.
  await mongoose.connection.close();

  done();
});

describe("Endpoints", () => {
  describe("Información de Pacientes", () => {
    it("Intenta obtener la información de un paciente sin token", async (done) => {
      const respuesta = await request.get("/v1/pacientes/informacion");
      expect(respuesta.status).toBe(401);
      //Probar que se recibe un mensaje
      expect(respuesta.body.respuesta).toBeTruthy();

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
      expect(paciente.nombreCompleto).toStrictEqual(
        "JACQUELINE CLOTILDE LAZO ZAMBRA"
      );
      expect(paciente.direccionCalle).toStrictEqual("");
      expect(paciente.direccionNumero).toStrictEqual("");
      expect(paciente.direccionDepartamento).toStrictEqual(" ");
      expect(paciente.direccionPoblacion).toStrictEqual("");
      expect(paciente.codigoComuna).toStrictEqual("01");
      expect(paciente.codigoCiudad).toStrictEqual("03");
      expect(paciente.codigoRegion).toStrictEqual("01");
      expect(paciente.fono).toStrictEqual("");
      expect(paciente.telefonoMovil).toStrictEqual("");
      expect(paciente.correoCuerpo).toStrictEqual("");
      expect(paciente.correoExtension).toStrictEqual("");
      done();
    });
  });
  describe("Actualizar datos de Pacientes", () => {
    it("Intenta actualizar los datos de un paciente sin token", async (done) => {
      const respuesta = await request.post("/v1/pacientes/actualizar_datos");
      expect(respuesta.status).toBe(401);
      //Probar que se recibe un mensaje
      expect(respuesta.body.respuesta).toBeTruthy();

      done();
    });
    it("Intenta actualizar los datos de un paciente con token (El paciente no existe)", async (done) => {
      token = jwt.sign({ numeroPaciente: 5 }, secreto);
      const pacienteActualizar = {
        direccionCalle: "Calle Nueva 123",
        direccionNumero: "10",
        direccionDepartamento: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        fono: "",
        telefonoMovil: "94924483",
        correoCuerpo: "correo",
        correoExtension: "correo.com",
      };
      const respuesta = await request
        .post("/v1/pacientes/actualizar_datos")
        .set("Authorization", token)
        .send(pacienteActualizar);
      expect(respuesta.status).toBe(201);

      done();
    });
    it("Should update datos de un paciente", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const pacienteActualizar = {
        direccionCalle: "chhuu",
        direccionNumero: "444442",
        direccionDepartamento: "40y",
        direccionPoblacion: "granví",
        codigoComuna: "01    ",
        codigoCiudad: "03 ",
        codigoRegion: "01 ",
        fono: "123456789",
        telefonoMovil: "12345678",
        correoCuerpo: "niicoleperez",
        correoExtension: "gmail.com",
      };
      const respuesta = await request
        .post("/v1/pacientes/actualizar_datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
      });

      const paciente = await Pacientes.findOne({
        numeroPaciente: 4,
      });

      expect(respuesta.status).toBe(201);
      //Probar que el paciente está en la colección de actualizados.
      expect(pacienteActualizado.numeroPaciente).toBeFalsy();
      expect(pacienteActualizado.direccionCalle).toStrictEqual("chhuu");
      expect(pacienteActualizado.direccionNumero).toStrictEqual("444442");
      expect(pacienteActualizado.direccionDepartamento).toStrictEqual("40y");
      expect(pacienteActualizado.direccionPoblacion).toStrictEqual("granví");
      expect(pacienteActualizado.codigoComuna).toStrictEqual("01    ");
      expect(pacienteActualizado.codigoCiudad).toStrictEqual("03 ");
      expect(pacienteActualizado.codigoRegion).toStrictEqual("01 ");
      expect(pacienteActualizado.fono).toStrictEqual("123456789");
      expect(pacienteActualizado.telefonoMovil).toStrictEqual("12345678");
      expect(pacienteActualizado.correoCuerpo).toBe("niicoleperez");
      expect(pacienteActualizado.correoExtension).toBe("gmail.com");

      expect(paciente.datosContactoActualizados).toBeTruthy();

      done();
    });
    it("Should not update datos de contacto del paciente si el correo es vacio", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const pacienteActualizar = {
        direccionCalle: "Calle Nueva 123",
        direccionNumero: "10",
        direccionDepartamento: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        fono: "",
        telefonoMovil: "94924483",
        correoCuerpo: "",
        correoExtension: "",
      };

      const respuesta = await request
        .post("/v1/pacientes/actualizar_datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
      });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({ respuesta: mensajes.badRequest });

      expect(pacienteActualizado).toBeFalsy();

      done();
    });
    it("Should not update datos de contacto del paciente si el correo es invalido", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const pacienteActualizar = {
        direccionCalle: "Calle Nueva 123",
        direccionNumero: "10",
        direccionDepartamento: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        fono: "",
        telefonoMovil: "94924483",
        correoCuerpo: "cor=reo",
        correoExtension: "correo",
      };

      const respuesta = await request
        .post("/v1/pacientes/actualizar_datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
      });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({ respuesta: mensajes.badRequest });

      expect(pacienteActualizado).toBeFalsy();

      done();
    });
    it("Should not update datos de contacto del paciente si ambos telefonos son vacios", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const pacienteActualizar = {
        direccionCalle: "Calle Nueva 123",
        direccionNumero: "10",
        direccionDepartamento: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        fono: "",
        telefonoMovil: "",
        correoCuerpo: "correo",
        correoExtension: "correo.com",
      };

      const respuesta = await request
        .post("/v1/pacientes/actualizar_datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const pacienteActualizado = await PacientesActualizados.findOne({
        numeroPaciente: 4,
      });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({ respuesta: mensajes.badRequest });

      expect(pacienteActualizado).toBeFalsy();

      done();
    });
  });
  describe("Verify if datos paciente are updated", () => {
    it("Should not verify without token", async (done) => {
      const respuesta = await request
        .get("/v1/pacientes/verificar_si_datos_actualizados_paciente")
        .set("Authorization", "no-token");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBe(mensajes.forbiddenAccess);

      done();
    });
    it("Should not verify if paciente does not exists", async (done) => {
      token = jwt.sign({ numeroPaciente: 5 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/verificar_si_datos_actualizados_paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toBe(mensajes.badRequest);

      done();
    });
    it("Should verify paciente without updated datos contacto", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/verificar_si_datos_actualizados_paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.respuesta).toBeFalsy();

      done();
    });
    it("Should verify paciente with updated datos contacto", async (done) => {
      token = jwt.sign({ numeroPaciente: 3 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/verificar_si_datos_actualizados_paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.respuesta).toBeTruthy();

      done();
    });
  });
  describe("verify if there is a solicitud pendiente de actualizar datos paciente", () => {
    it("Should not verify without token", async (done) => {
      const respuesta = await request
        .get("/v1/pacientes/verificar_solicitud_pendiente_paciente")
        .set("Authorization", "no-token");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBe(mensajes.forbiddenAccess);

      done();
    });
    it("Should not verify if paciente does not exists", async (done) => {
      token = jwt.sign({ numeroPaciente: 5 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/verificar_solicitud_pendiente_paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toBe(mensajes.badRequest);

      done();
    });
    it("Should verify without existing solicitud de actualizar datos", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const respuesta = await request
        .get("/v1/pacientes/verificar_si_datos_actualizados_paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.solicitudPendiente).toBeFalsy();

      done();
    });
    it("Should verify with existing solicitud de actualizar datos", async (done) => {
      token = jwt.sign({ numeroPaciente: 4 }, secreto);
      const pacienteActualizar = {
        numeroPaciente: 4,
        direccionCalle: "Calle Nueva 123",
        direccionNumero: "10",
        direccionDepartamento: "",
        direccionPoblacion: "VILLA CASPAÑA",
        codigoComuna: "01",
        codigoCiudad: "01",
        codigoRegion: "02",
        fono: "",
        telefonoMovil: "094924483",
        correoCuerpo: "correo",
        correoExtension: "correo.com",
      };
      await PacientesActualizados.create(pacienteActualizar);
      const respuesta = await request
        .get("/v1/pacientes/verificar_si_datos_actualizados_paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.solicitudPendiente).toBeFalsy();

      done();
    });
  });
});
