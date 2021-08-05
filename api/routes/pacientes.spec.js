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
const { find } = require("../models/Pacientes");

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
      token = jwt.sign(
        {
          _id: "000000000000",
          numerosPaciente: [
            {
              numero: 2,
              codigoEstablecimiento: "E01",
              nombreEstablecimiento: "Hospital Regional de Antofagasta",
            },
            {
              numero: 9,
              codigoEstablecimiento: "E02",
              nombreEstablecimiento: "Hospital de Calama",
            },
          ],
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

      done();
    });
    it("Intenta obtener la información de un paciente con token (El paciente si existe)", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdc");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el paciente es el esperado.
      const pacienteObtenido = respuesta.body;
      expect(pacienteObtenido.rut).toStrictEqual("10771131-7");
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
      expect(pacienteObtenido.datosContactoActualizados).toBeFalsy();
      done();
    });
    it("Intenta obtener la información de un paciente con token (El paciente si existe y con nombre social)", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdd");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/informacion")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el paciente es el esperado.
      const pacienteObtenido = respuesta.body;
      expect(pacienteObtenido.rut).toStrictEqual("17724699-9");
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
      expect(pacienteObtenido.datosContactoActualizados).toBeTruthy();
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
      token = jwt.sign(
        {
          _id: "000000000000",
          numerosPaciente: [
            {
              numero: 2,
              codigoEstablecimiento: "E01",
              nombreEstablecimiento: "Hospital Regional de Antofagasta",
            },
            {
              numero: 9,
              codigoEstablecimiento: "E02",
              nombreEstablecimiento: "Hospital de Calama",
            },
          ],
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

      done();
    });
    it("Should update datos de un paciente", async (done) => {
      let paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
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
      };
      const respuesta = await request
        .post("/v1/pacientes/actualizar-datos")
        .set("Authorization", token)
        .send(pacienteActualizar);

      const solicitudesPacienteActualizado = await PacientesActualizados.find({
        numeroPaciente: { $in: paciente.numerosPaciente },
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
      expect(solicitudesPacienteActualizado[0].numeroPaciente.numero).toBeFalsy();
      expect(solicitudesPacienteActualizado[0].numeroPaciente.codigoEstablecimiento).toBeFalsy();
      expect(solicitudesPacienteActualizado[0].numeroPaciente.nombreEstablecimiento).toBe("Hospital Regional de Antofagasta");
      expect(solicitudesPacienteActualizado[0].direccion).toStrictEqual("CHHUU");
      expect(solicitudesPacienteActualizado[0].direccionNumero).toStrictEqual("444442");
      expect(solicitudesPacienteActualizado[0].detallesDireccion).toStrictEqual("40Y");
      expect(solicitudesPacienteActualizado[0].direccionPoblacion).toStrictEqual("GRANVÍ");
      expect(solicitudesPacienteActualizado[0].codigoComuna).toStrictEqual("01    ");
      expect(solicitudesPacienteActualizado[0].codigoCiudad).toStrictEqual("03 ");
      expect(solicitudesPacienteActualizado[0].codigoRegion).toStrictEqual("01 ");
      expect(solicitudesPacienteActualizado[0].telefonoFijo).toStrictEqual("123456789");
      expect(solicitudesPacienteActualizado[0].telefonoMovil).toStrictEqual("12345678");
      expect(solicitudesPacienteActualizado[0].correoCuerpo).toBe("niicoleperez");
      expect(solicitudesPacienteActualizado[0].correoExtension).toBe("gmail.com");

      expect(solicitudesPacienteActualizado[1].numeroPaciente.numero).toBeFalsy();
      expect(solicitudesPacienteActualizado[1].numeroPaciente.codigoEstablecimiento).toBeFalsy();
      expect(solicitudesPacienteActualizado[1].numeroPaciente.nombreEstablecimiento).toBe("Hospital de Calama");
      expect(solicitudesPacienteActualizado[1].direccion).toStrictEqual("CHHUU");
      expect(solicitudesPacienteActualizado[1].direccionNumero).toStrictEqual("444442");
      expect(solicitudesPacienteActualizado[1].detallesDireccion).toStrictEqual("40Y");
      expect(solicitudesPacienteActualizado[1].direccionPoblacion).toStrictEqual("GRANVÍ");
      expect(solicitudesPacienteActualizado[1].codigoComuna).toStrictEqual("01    ");
      expect(solicitudesPacienteActualizado[1].codigoCiudad).toStrictEqual("03 ");
      expect(solicitudesPacienteActualizado[1].codigoRegion).toStrictEqual("01 ");
      expect(solicitudesPacienteActualizado[1].telefonoFijo).toStrictEqual("123456789");
      expect(solicitudesPacienteActualizado[1].telefonoMovil).toStrictEqual("12345678");
      expect(solicitudesPacienteActualizado[1].correoCuerpo).toBe("niicoleperez");
      expect(solicitudesPacienteActualizado[1].correoExtension).toBe("gmail.com");

      paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      expect(paciente.datosContactoActualizados).toBeTruthy();

      done();
    });
    it("Should not update datos de contacto del paciente si el correo es vacio", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
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
        numeroPaciente: { $in: paciente.numerosPaciente },
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

      done();
    });
    it("Should not update datos de contacto del paciente si el correo es invalido", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
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
        numeroPaciente: { $in: paciente.numerosPaciente },
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

      done();
    });
    it("Should not update datos de contacto del paciente si ambos telefonos son vacios", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
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
        numeroPaciente: { $in: paciente.numerosPaciente },
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
      token = jwt.sign(
        {
          _id: "000000000000",
          numerosPaciente: [
            {
              numero: 2,
              codigoEstablecimiento: "E01",
              nombreEstablecimiento: "Hospital Regional de Antofagasta",
            },
            {
              numero: 9,
              codigoEstablecimiento: "E02",
              nombreEstablecimiento: "Hospital de Calama",
            },
          ],
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

      done();
    });
    it("Should verify paciente without confirmed datos contacto", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
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

      done();
    });
    it("Should verify paciente with confirmed datos contacto", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdd");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
        },
        secreto
      );
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
      token = jwt.sign(
        {
          _id: "000000000000",
          numerosPaciente: [
            {
              numero: 2,
              codigoEstablecimiento: "E01",
              nombreEstablecimiento: "Hospital Regional de Antofagasta",
            },
            {
              numero: 9,
              codigoEstablecimiento: "E02",
              nombreEstablecimiento: "Hospital de Calama",
            },
          ],
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

      done();
    });
    it("Should verify without existing solicitud de actualizar datos", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/pacientes/verificar-solicitud-duplicada")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ solicitudDuplicada: false });

      done();
    });
    it("Should verify with existing solicitud de actualizar datos", async (done) => {
      const paciente = await Pacientes.findById("6101834e912f6209f4851fdb");
      token = jwt.sign(
        {
          _id: paciente._id,
          numerosPaciente: paciente.numerosPaciente,
        },
        secreto
      );
      const pacienteActualizar = {
        idPaciente:paciente._id,
        numeroPaciente: paciente.numerosPaciente[0],
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
