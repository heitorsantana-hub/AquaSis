// controllers/AmostraController.js
const ClienteModel = require("../models/ClienteModel");
const ParametroModel = require("../models/ParametroModel.js");
const AmostraModel = require("../models/AmostraModel");

class AmostraController {
  // Renderiza a tela de Nova Amostra (GET)
  static async renderNova(req, res) {
    try {
      const clientes = await ClienteModel.listarTodos();
      const parametros = await ParametroModel.listarTodos();
      const novoProtocolo = await AmostraModel.gerarProtocolo();

      // Datas padrão para o front-end
      const hoje = new Date();
      const dataAtual = hoje.toISOString().split("T")[0];
      const horaAtual = hoje.toTimeString().split(" ")[0].substring(0, 5);

      res.render("cadastro-amostra", {
        pageTitle: "Cadastrar Amostra",
        activeAmostras: true,
        clientes,
        analisesDisponiveis: parametros,
        novoProtocolo,
        dataAtual,
        horaAtual,
      });
    } catch (error) {
      console.error("Erro ao carregar tela de amostra:", error);
      res.redirect("/dashboard");
    }
  }

  // Salva os dados no banco (POST)
  static async salvar(req, res) {
    try {
      // Extrai tudo que veio do formulário
      const {
        protocolo,
        cliente_id,
        tipo_amostra,
        data_coleta,
        hora_coleta,
        data_recebimento,
        hora_recebimento,
        check_recipiente,
        check_volume,
        check_refrigeracao,
        check_acidificacao,
        observacoes,
        analises,
      } = req.body;

      // Monta o objeto pra tabela 'amostras'
      const dadosNovaAmostra = {
        protocolo,
        cliente_id,
        tipo_amostra,
        data_coleta,
        hora_coleta,
        data_recebimento,
        hora_recebimento,
        chk_recipiente_adequado: check_recipiente,
        chk_volume_adequado: check_volume,
        chk_refrigeracao: check_refrigeracao,
        chk_acidificacao: check_acidificacao,
        observacoes,
        funcionario_recepcao_id: req.session.usuario.id, // Pega quem logou!
      };

      // O array de análises vem do HTML como name="analises[]"
      // Se só um for marcado, o JS manda como String, então forçamos virar Array
      let arrayAnalises = analises;
      if (typeof analises === "string") arrayAnalises = [analises];

      // Chama o Model para salvar
      await AmostraModel.criar(dadosNovaAmostra, arrayAnalises);

      res.redirect("/dashboard"); // Sucesso! Volta pro dashboard
    } catch (error) {
      console.error("Erro ao salvar amostra:", error);
      res.status(500).send("Erro ao salvar amostra no banco de dados.");
    }
  }
}
module.exports = AmostraController;
