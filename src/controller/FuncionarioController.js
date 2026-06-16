// controllers/FuncionarioController.js
const FuncionarioModel = require("../models/FuncionarioModel");

class FuncionarioController {
  // Método para renderizar a tabela
  static async renderLista(req, res) {
    try {
      // Busca dados puros do banco
      const funcionariosDb = await FuncionarioModel.listarAtivos();

      // Formata os dados para o seu Handlebars entender perfeitamente
      const funcionariosFormatados = funcionariosDb.map((f) => {
        // Pega as iniciais do nome (ex: "Caio Eduardo" -> "CA")
        const iniciais = f.nome.substring(0, 2).toUpperCase();

        // Formata o nome do cargo para bater com as cores do seu HTML
        const cargoFormatado = f.cargo === "quimico" ? "Químico" : "Auxiliar";

        return {
          id: f.id,
          nome: f.nome,
          email: f.email,
          cargo: cargoFormatado,
          iniciais: iniciais,
        };
      });

      res.render("lista-funcionario", {
        pageTitle: "Equipe do Laboratório",
        activeFuncionarioE: true,
        funcionarios: funcionariosFormatados,
      });
    } catch (error) {
      console.error("Erro ao listar funcionários:", error);
      res.status(500).send("Erro ao carregar a equipe.");
    }
  }

  // Método para desativar o acesso
  static async desativarAcesso(req, res) {
    try {
      const { id } = req.params;

      // Segurança: Impedir que o químico desative a si mesmo acidentalmente
      if (id === req.session.usuario.id) {
        return res
          .status(403)
          .send("Você não pode desativar o próprio usuário logado.");
      }

      // Chama o model para atualizar o banco
      await FuncionarioModel.desativar(id);

      // Redireciona de volta para a lista (que agora não terá mais esse funcionário)
      res.status(200);
    } catch (error) {
      console.error("Erro ao desativar funcionário:", error);
      res.status(500).send("Erro ao processar a desativação.");
    }
  }

  // Adicione este método dentro da classe FuncionarioController

  // Recebe os dados do formulário para salvar um novo Auxiliar
  static async salvar(req, res) {
    try {
      // Extrai os dados enviados pelo formulário
      const { nome, email, senha, cargo } = req.body;

      // Monta o objeto para inserir no banco
      const novoFuncionario = {
        nome,
        email,
        senha, // Lembrando: no futuro o ideal é criptografar (bcrypt)
        cargo, // Vai receber "auxiliar" do input hidden
        ativo: true, // Já nasce ativo no sistema
      };

      // Salva no banco de dados
      await FuncionarioModel.criar(novoFuncionario);

      // Deu certo! Redireciona para a lista de equipe para ver o novo auxiliar lá
      res.redirect("/funcionarios");
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error.message);

      // Se der erro (ex: e-mail repetido), recarrega a tela de cadastro enviando a mensagem de erro
      res.render("cadastro-funcionario", {
        pageTitle: "Cadastrar Funcionário",
        activeFuncionariosE: true,
        erro: error.message,
      });
    }
  }
}

module.exports = FuncionarioController;
