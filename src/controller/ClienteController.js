// controllers/ClienteController.js
const ClienteModel = require("../models/ClienteModel");

class ClienteController {
  // Recebe os dados do formulário (POST)
  static async salvar(req, res) {
    try {
      // Extrai os dados do name="" dos inputs do seu HTML
      const { nome, documento, telefone, email } = req.body;

      const novoCliente = {
        nome,
        documento,
        telefone,
        email,
      };

      // Manda pro banco de dados
      await ClienteModel.criar(novoCliente);

      // Se der certo, redireciona para a tela de criar amostra (para agilizar o fluxo)
      res.redirect("/amostras/nova");
    } catch (error) {
      console.error("Erro ao salvar cliente:", error.message);

      // Renderiza a página novamente mostrando o erro (ex: CPF duplicado)
      res.render("cadastro-cliente", {
        pageTitle: "Cadastrar Cliente",
        activeClientes: true,
        erro: error.message, // Você pode adicionar {{erro}} no seu .hbs depois para mostrar essa mensagem
      });
    }
  }
}

module.exports = ClienteController;
