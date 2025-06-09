const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware para ler JSON e x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dados fixos da conta PagSeguro
const PAGSEGURO_EMAIL = "ideiasempresariais@hotmail.com";
const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN;

app.post('/webhook/pagseguro', async (req, res) => {
  console.log("✅ Webhook recebido!");
  console.log("📦 Corpo recebido:", req.body);

  const notificationCode = req.body.notificationCode;

  if (!notificationCode) {
    console.log("❌ notificationCode ausente.");
    return res.status(400).send("notificationCode ausente");
  }

  const url = `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/${notificationCode}?email=${PAGSEGURO_EMAIL}&token=${PAGSEGURO_TOKEN}`;

  try {
    const response = await axios.get(url, { headers: { Accept: 'application/json' } });
    const data = response.data;

    console.log("📬 Dados da transação recebidos:");
    console.log(data);

    const status = parseInt(data.status);
    const valorPago = parseInt(data.grossAmount.replace('.', ''));
    const email = data.sender.email;

    if (status !== 3) {
      console.log("⚠️ Transação ainda não aprovada. Status:", status);
      return res.status(200).send("Transação ainda não aprovada");
    }

    const pacoteBasic = parseInt(process.env.PACKAGE_BASIC || '1000');
    const pacoteFull = parseInt(process.env.PACKAGE_FULL || '2000');
    let codigo = '';

    if (valorPago >= pacoteFull) {
      codigo = 'FULL-XYZ-123';
    } else if (valorPago >= pacoteBasic) {
      codigo = 'BASIC-ABC-789';
    } else {
      console.log('⚠️ Valor abaixo do mínimo. Nenhum pacote liberado.');
      return res.status(200).send('Valor abaixo do mínimo.');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Seu código de acesso ao Tenta AI',
      text: `Olá! Seu código de acesso é: ${codigo}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Erro ao enviar e-mail:', error);
      } else {
        console.log('✅ E-mail enviado com sucesso:', info.response);
      }
    });

    res.status(200).send("OK");

  } catch (error) {
    console.log("❌ Erro ao consultar transação no PagSeguro:", error.response ? error.response.data : error.message);
    res.status(500).send("Erro ao consultar PagSeguro");
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
