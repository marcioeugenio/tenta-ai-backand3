const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

  const url = `https://ws.pagseguro.uol.com.br/v2/transactions/notifications/${notificationCode}?email=${PAGSEGURO_EMAIL}&token=${PAGSEGURO_TOKEN}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;
    console.log("📬 Dados da transação recebidos:");
    console.log(data);

    const status = parseInt(data.status);
    const valorBruto = parseFloat(data.grossAmount.replace(',', '.'));

    if (status !== 3) {
      console.log("⚠️ Transação ainda não aprovada. Status:", status);
      return res.status(200).send("Transação ainda não aprovada");
    }

    let pacote = '';
    if (valorBruto === 39.90) {
      pacote = 'PLANO BÁSICO (R$39,90)';
    } else if (valorBruto === 79.90) {
      pacote = 'PLANO PICANTE (R$79,90)';
    } else if (valorBruto === 49.90) {
      pacote = 'UPGRADE (R$49,90)';
    } else {
      console.log(`⚠️ Valor não corresponde a nenhum pacote conhecido: R$${valorBruto}`);
      return res.status(200).send("Valor desconhecido");
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
      to: 'ideiasempresariais@hotmail.com',
      subject: `📢 Nova Venda: ${pacote}`,
      text: `Uma nova venda foi confirmada: ${pacote}`,
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
