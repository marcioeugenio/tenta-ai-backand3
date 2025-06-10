const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/webhook/pagseguro', async (req, res) => {
  const { email, valor } = req.body;

  if (!email || !valor) return res.status(400).send("Dados incompletos");

  let pacote = 'Desconhecido';
  if (valor === 3990) pacote = 'Plano Básico';
  else if (valor === 7990) pacote = 'Plano Picante';
  else if (valor === 4990) pacote = 'Upgrade Picante';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Tenta AI" <${process.env.GMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `Nova venda: ${pacote}`,
      text: `Venda confirmada!\nPlano: ${pacote}\nValor: R$ ${(valor / 100).toFixed(2)}\nCliente: ${email}`,
    });

    console.log("✅ Venda processada com sucesso!");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
