const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/webhook/pagseguro', async (req, res) => {
  console.log("✅ Webhook recebido!");
  console.log("📦 Corpo recebido:", req.body);

  // Extração direta (o PagSeguro deve enviar assim, ou adaptamos após ver o log completo)
  const valor = parseFloat(req.body.valor || req.body.amount || 0);
  const status = req.body.status || '';

  if (status !== 'PAID' && status !== '3') {
    console.log("⚠️ Transação ainda não aprovada ou status desconhecido:", status);
    return res.status(200).send("Aguardando aprovação");
  }

  let pacote = '';
  if (valor === 39.90) {
    pacote = 'PLANO BÁSICO (R$39,90)';
  } else if (valor === 79.90) {
    pacote = 'PLANO PICANTE (R$79,90)';
  } else if (valor === 49.90) {
    pacote = 'UPGRADE (R$49,90)';
  } else {
    console.log(`⚠️ Valor não corresponde a nenhum pacote conhecido: R$${valor}`);
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
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
