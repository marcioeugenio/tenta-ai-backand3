const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/webhook/pagseguro', (req, res) => {
  console.log('✅ Webhook recebido!');
  console.log('📦 Corpo da requisição:', req.body);

  const email = req.body.email;
  const valorPago = req.body.valor;

  if (!email || !valorPago) {
    console.log('❌ Campos "email" ou "valor" ausentes.');
    return res.status(400).send('Campos ausentes');
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

  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
