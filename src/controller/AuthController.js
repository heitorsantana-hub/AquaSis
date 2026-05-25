// controllers/AuthController.js
const FuncionarioModel = require("../models/FuncionarioModel");

class AuthController {
  //Método para exibir tela de lading page
  static renderHome(req, res) {
    res.render("home", { layout: "home" });
  }

  // Método para exibir a tela de login (GET)
  static renderLogin(req, res) {
    // Se já estiver logado, joga pro dashboard
    if (req.session.usuario) {
      return res.redirect("/dashboard");
    }
    res.render("login", { layout: false, erroLogin: null });
  }

  // Método para processar o formulário de login (POST)
  static async processLogin(req, res) {
    const { email, senha } = req.body;

    try {
      // Pede ao Model para buscar o usuário no banco
      const usuario = await FuncionarioModel.buscarPorEmail(email);

      // Valida se o usuário existe, se a senha bate e se ele está ativo
      if (!usuario || usuario.senha !== senha || !usuario.ativo) {
        return res.render("login", {
          layout: false,
          erroLogin: "Credenciais inválidas ou usuário inativo.",
        });
      }

      // Se deu tudo certo, salva os dados na sessão!
      req.session.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        // Uma lógica simples para facilitar o Handlebars
        isAdmin: usuario.cargo === "quimico",
        iniciais: usuario.nome.substring(0, 2).toUpperCase(),
      };

      // Redireciona para o sistema
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      res.render("login", {
        layout: false,
        erroLogin: "Erro interno no servidor.",
      });
    }
  }

  // Método de Logout
  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.log(err);
      res.redirect("/login");
    });
  }
}

module.exports = AuthController;
