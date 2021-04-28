const app = require('../index')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const supertest = require("supertest")
const pacientesSeeds = require('../testSeeds/pacientesSeeds.json')

const Pacientes = require('../models/Pacientes')
const PacientesActualizados = require('../models/PacientesActualizados')

const request = supertest(app)
const secreto = process.env.JWT_SECRET
let token


beforeAll(async done =>{
    //Cerrar la conexión que se crea en el index.
    await mongoose.disconnect();
    //Conectar a la base de datos de prueba.
    await mongoose.connect(`${process.env.MONGO_URI_TEST}pacientes_test`, { useNewUrlParser: true, useUnifiedTopology: true })
     //Cargar los seeds a la base de datos.
     for (const pacienteSeed of pacientesSeeds) {
        await Promise.all([
            Pacientes.create(pacienteSeed),
        ])
    }
    done()
})


afterAll(async (done) => {
    //Borrar el contenido de la colección en la base de datos despues de la pruebas.
    await Pacientes.deleteMany()
    await PacientesActualizados.deleteMany()
    //Cerrar la conexión a la base de datos despues de la pruebas.
    await mongoose.connection.close()
    done()
})


describe('Endpoints', () => {
    describe('Información de Pacientes', () => {
        it('Intenta obtener la información de un paciente sin token', async done =>{ 
            const respuesta = await request.get('/pacientes/informacion')
            expect(respuesta.status).toBe(401)
            //Probar que se recibe un mensaje
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener la información de un paciente con token (El paciente no existe)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get('/pacientes/informacion')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el objeto está vacío.
            const pacienteVacio = respuesta.body
            expect(pacienteVacio).toStrictEqual({})
            done()
        })
        it('Intenta obtener la información de un paciente con token (El paciente si existe)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 1}, secreto)
            const respuesta = await request.get('/pacientes/informacion')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el paciente es el esperado.
            const paciente = respuesta.body
            expect(paciente.Rut).toStrictEqual('10771131-7')
            expect(paciente.Nombre).toStrictEqual('JACQUELINE CLOTILDE LAZO ZAMBRA')
            expect(paciente.PAC_PAC_CalleHabit).toStrictEqual('')
            expect(paciente.PAC_PAC_NumerHabit).toStrictEqual('')
            expect(paciente.PAC_PAC_DeparHabit).toStrictEqual(' ')
            expect(paciente.PAC_PAC_PoblaHabit).toStrictEqual('')
            expect(paciente.PAC_PAC_ComunHabit).toStrictEqual('01')
            expect(paciente.PAC_PAC_CiudaHabit).toStrictEqual('03')
            expect(paciente.PAC_PAC_RegioHabit).toStrictEqual('01')
            expect(paciente.PAC_PAC_Fono).toStrictEqual('')
            expect(paciente.PAC_PAC_TelefonoMovil).toStrictEqual('')
            expect(paciente.PAC_PAC_CorreoCuerpo).toStrictEqual('')
            expect(paciente.PAC_PAC_CorreoExtension).toStrictEqual('')
            done()
        })
    })
    describe('Actualizar datos de Pacientes', () => {
        it('Intenta actualizar los datos de un paciente sin token', async done =>{ 
            const respuesta = await request.put('/pacientes/actualizar_datos')
            expect(respuesta.status).toBe(401)
            //Probar que se recibe un mensaje
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta actualizar los datos de un paciente con token (El paciente no existe)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.put('/pacientes/actualizar_datos')
                .set('Authorization',token)
            expect(respuesta.status).toBe(204)
            done()
        })
        it('Intenta actualizar los datos de un paciente con token (El paciente si existe)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 4}, secreto)
            const pacienteActualizar = {
                numeroPaciente: 4,
                textoCalle: 'Calle Nueva 123',
                textoNumero: '10',
                textoDepartamento: '',
                textoPoblacion: 'VILLA CASPAÑA',
                codigoComuna: '01',
                codigoCiudad: '01',
                codigoRegion: '02',
                fono: ' ',
                telefonoMovil: '094924483',
                correoCuerpo: '',
                correoExtension: '' 
            }
            const respuesta = await request.put('/pacientes/actualizar_datos')
                .set('Authorization',token)
                .send(pacienteActualizar)
            expect(respuesta.status).toBe(204)

            const paciente = await PacientesActualizados.findOne({
                numeroPaciente: 4
            })
            //Probar que el paciente está en la colección de actualizados.
            expect(paciente.numeroPaciente).toStrictEqual(4)
            expect(paciente.textoCalle).toStrictEqual('Calle Nueva 123')
            expect(paciente.textoNumero).toStrictEqual('10')
            expect(paciente.textoDepartamento).toStrictEqual('')
            expect(paciente.textoPoblacion).toStrictEqual('VILLA CASPAÑA')
            expect(paciente.codigoComuna).toStrictEqual('01')
            expect(paciente.codigoCiudad).toStrictEqual('01')
            expect(paciente.codigoRegion).toStrictEqual('02')
            expect(paciente.fono).toStrictEqual(' ')
            expect(paciente.telefonoMovil).toStrictEqual('094924483')
            expect(paciente.correoCuerpo).toBeFalsy()
            expect(paciente.correoExtension).toBeFalsy()
            done()
        })
    })
})