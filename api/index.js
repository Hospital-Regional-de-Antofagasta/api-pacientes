const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const pacientes = require("./routes/pacientes");
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/v1/pacientes", pacientes);

module.exports = app;
