const express = require("express");
const fs = require("fs");
const enviarEmail = require("./email");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/webhook/pagseguro", (req, res) => {
  const pedido = req.body;
  console.log("Requisição recebida:", pedido);

  const pedidos = JSON.parse(fs.readFileSync("pedidos.json", "utf8"));
  pedidos.push(pedido);
  fs.writeFileSync("pedidos.json", JSON.stringify(pedidos, null, 2));

  let plano = "DESCONHECIDO";
  let mensagem = "Pagamento recebido.";

  if (pedido.valor === 4990) {
    plano = "BÁSICO";
    mensagem = "Acesso ao plano BÁSICO liberado automaticamente.";
  } else if (pedido.valor === 9990) {
    plano = "COMPLETO";
    mensagem = "Acesso ao plano COMPLETO liberado automaticamente.";
  }

  enviarEmail(
    `Venda: Plano ${plano}`,
    `Nova venda confirmada.

Cliente: ${pedido.email}
Plano: ${plano}
Valor: R$${(pedido.valor / 100).toFixed(2)}

Acesso liberado.`
  );

  res.json({ plano, acessoLiberado: true, mensagem });
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
