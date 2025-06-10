const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const pagamentos = {};

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

  let plano = 'desconhecido';
  if (valor === 3990) plano = 'basico';
  else if (valor === 7990) plano = 'picante';
  else if (valor === 4990) plano = 'upgrade';

  pagamentos[email.toLowerCase()] = plano;
  console.log(`💾 Pagamento registrado: ${email} => ${plano}`);
  res.sendStatus(200);
});

app.get('/verificar', (req, res) => {
  const email = req.query.email?.toLowerCase();
  const plano = pagamentos[email] || null;
  res.json({ plano });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
