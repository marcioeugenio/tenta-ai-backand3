const nodemailer = require("nodemailer");

const remetente = process.env.GMAIL_USER;
const senha = process.env.GMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: remetente,
    pass: senha,
  },
});

function enviarEmail(assunto, mensagem) {
  const mailOptions = {
    from: remetente,
    to: remetente,
    subject: assunto,
    text: mensagem,
  };

  transporter.sendMail(mailOptions, (erro, info) => {
    if (erro) {
      console.error("Erro ao enviar e-mail:", erro);
    } else {
      console.log("E-mail enviado:", info.response);
    }
  });
}

module.exports = enviarEmail;
