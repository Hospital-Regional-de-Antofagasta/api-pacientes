const app = require('../index')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const supertest = require("supertest")
const pacientesSeeds = require('../testSeeds/pacientesSeeds.json')

const Pacientes = require('../models/Pacientes')

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
    // //Cambiar fechas de las citas 13, 14, 17 y 18 del seeder para que sean del día actual.
    // const fechaHoy = new Date()
    // const fechaHoy1 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),8,30,0,0)
    // const fechaHoy2 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),16,30,0,0)
    // await Promise.all([
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 13},{FechaCitacion: fechaHoy1}),
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 14},{FechaCitacion: fechaHoy2}),
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 17},{FechaCitacion: fechaHoy1}),
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 18},{FechaCitacion: fechaHoy2})
    // ])
    // //Cambiar fechas de las citas 19, 20, 21 y 24 del seeder para que sean posteriores al día actual.
    // const anio = fechaHoy.getFullYear()+1
    // const fechaPosterior1 =  new Date(anio,1,1,8,30,0,0)
    // const fechaPosterior2 =  new Date(anio,2,1,16,30,0,0)
    // await Promise.all([
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 19},{FechaCitacion: fechaPosterior1}),
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 20},{FechaCitacion: fechaPosterior1}),
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 21},{FechaCitacion: fechaPosterior2}),
    //     CitasPacientes.findOneAndUpdate({CorrelativoCita: 24},{FechaCitacion: fechaPosterior2})
    // ])
    done()
})


afterAll(async (done) => {
    //Borrar el contenido de la colección en la base de datos despues de la pruebas.
    await Pacientes.deleteMany()
    //Cerrar la conexión a la base de datos despues de la pruebas.
    await mongoose.connection.close()
    done()
})


describe('Endpoints', () => {
    describe('Información de Pacientes', () => {
        it('Intenta obtener la información de un paciente sin token', async done =>{ 
            const respuesta = await request.get('/pacientes/informacion')
            expect(respuesta.status).toBe(403)
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
})