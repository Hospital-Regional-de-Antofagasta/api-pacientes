const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { loadConfig } = require('./config')
const pacientes = require('./routes/pacientes')
const app =express()
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true})

loadConfig()

app.use('/pacientes',pacientes)

module.exports = app