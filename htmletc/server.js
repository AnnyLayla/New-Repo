require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración de SQL Server
const dbConfig = {
  user: "sa",                // ⚠️ Usá tu usuario real de SQL Server
  password: "tu_contraseña", // ⚠️ Reemplazá por tu contraseña
  server: "localhost",
  database: "reservasDB",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

// Ruta para guardar formulario
app.post("/enviar", async (req, res) => {
  const { nombre, apellido, email, telefono, dias, reserva } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("nombre", sql.VarChar, nombre)
      .input("apellido", sql.VarChar, apellido)
      .input("email", sql.VarChar, email)
      .input("telefono", sql.VarChar, telefono)
      .input("dias_estadia", sql.VarChar, dias)
      .input("nombre_reserva", sql.VarChar, reserva)
      .query("INSERT INTO formulario (nombre, apellido, email, telefono, dias_estadia, nombre_reserva) VALUES (@nombre, @apellido, @email, @telefono, @dias_estadia, @nombre_reserva)");

    // Enviar email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: "minoayelen133@gmail.com",
      subject: "Nuevo formulario recibido",
      text: `
        Nombre: ${nombre}
        Apellido: ${apellido}
        Email: ${email}
        Teléfono: ${telefono}
        Días: ${dias}
        Reserva: ${reserva}
      `
    });

    res.send("✅ Formulario guardado y correo enviado");
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Error al guardar o enviar");
  }
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});
