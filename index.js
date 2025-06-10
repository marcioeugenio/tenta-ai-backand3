const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/webhook/pagseguro', async (req, res) => {
  console.log("✅ Webhook recebido!");
  console.log("📦 Corpo recebido:", req.body);

  const { email, valor } = req.body;

  if (!email || !valor) {
    console.log("⚠️ Corpo incompleto. Ignorando.");
    return res.sendStatus(200);
  }

  let pacote = 'Desconhecido';
  if (valor === 3990) pacote = 'Plano Básico';
  else if (valor === 4990) pacote = 'Upgrade Picante';
  else if (valor === 7990) pacote = 'Plano Picante';

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

    console.log("📧 E-mail enviado com sucesso!");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err.message);
    res.sendStatus(500);
  }
});

// ⚠️ PORTA CORRETA para funcionar no Render!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
