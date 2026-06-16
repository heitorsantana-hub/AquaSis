// controllers/AmostraController.js
const ClienteModel = require("../models/ClienteModel");
const AmostraModel = require("../models/AmostraModel");
const TipoAmostraModel = require("../models/TipoAmostraModel");
const DeterminacaoModel = require("../models/DeterminacaoModel.js");
const supabase = require("../../config/supabase.js");

class AmostraController {
  // Renderiza a tela de Nova Amostra (GET)
  static async renderNova(req, res) {
    try {
      const clientes = await ClienteModel.listarTodos();
      const novoProtocolo = await AmostraModel.gerarProtocolo();
      const tipo = await TipoAmostraModel.listarTodos();

      // IMPORTANTE: Certifique-se de que no seu DeterminacaoModel o método se chama listarTodos()
      const determinacao = await DeterminacaoModel.listarTodos();

      // Datas padrão para o front-end
      const hoje = new Date();
      const dataAtual = PatternData(hoje);
      const horaAtual = hoje.toTimeString().split(" ")[0].substring(0, 5);

      res.render("cadastro-amostra", {
        pageTitle: "Cadastrar Amostra",
        activeAmostras: true,
        clientes,
        tiposAmostra: tipo,
        todasDeterminacoes: determinacao,
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

      const dadosNovaAmostra = {
        protocolo,
        cliente_id: cliente_id,
        tipo_amostra: tipo_amostra,
        data_coleta,
        hora_coleta,
        data_recebimento,
        hora_recebimento,
        chk_recipiente_adequado: check_recipiente,
        chk_volume_adequado: check_volume,
        chk_refrigeracao: check_refrigeracao,
        chk_acidificacao: check_acidificacao,
        observacoes,
        funcionario_recepcao_id: req.session.usuario.id,
      };

      // Força o envio das análises virar um Array, mesmo se apenas uma checkbox for marcada
      let arrayAnalises = analises;
      if (typeof analises === "string") arrayAnalises = [analises];
      if (!analises) arrayAnalises = []; // Evita quebra se nenhuma análise for enviada

      // Chama o Model para salvar a amostra e seus vínculos
      await AmostraModel.criar(dadosNovaAmostra, arrayAnalises);

      res.redirect("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar amostra:", error);
      res.status(500).send("Erro ao salvar amostra no banco de dados.");
    }
  }

  static async renderLista(req, res) {
    try {
      const amostrasBanco = await AmostraModel.listarTodas();

      const amostrasFormatadas = amostrasBanco.map((amostra) => ({
        _id: amostra.id,
        protocolo: amostra.protocolo,
        tipo_amostra: amostra.tipo_amostras?.nome,
        data_recebimento: amostra.data_recebimento,
        status: amostra.status,
        data_coleta: amostra.data_coleta,
        hora_coleta: amostra.hora_coleta,
        cliente_nome: amostra.clientes?.nome || "Cliente sem Nome",
      }));

      res.render("lista-amostra", {
        pageTitle: "Listagem de Amostra",
        activeAmostrasL: true,
        amostras: amostrasFormatadas,
      });
    } catch (error) {
      console.error("Erro ao listar amostras:", error);
      res.redirect("/amostras");
    }
  }

  static async delete(req, res) {
    try {
      const amostra_id = req.body.amostra_id;
      console.log("Id deletado: " + amostra_id);

      // Delegação de exclusão para o Model correspondente (AmostraModel)
      await AmostraModel.deletar(amostra_id);

      return res.status(201).redirect("/amostras");
    } catch (error) {
      console.error("Erro ao deletar amostra:", error);
      return res.status(500).send("Erro ao tentar remover a amostra.");
    }
  }

  // API consumida via Fetch pelo Front-end para carregar as caixinhas dinâmicas
  static async buscarDeterminacoesPorTipo(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("tipo_amostra_determinacoes")
        .select(
          `
          determinacao_id,
          determinacoes (
            id,
            nome,
            unidade_medida
          )
        `,
        )
        .eq("tipo_amostra_id", id);

      if (error) throw error;

      const listaFormatada = data
        .filter((item) => item.determinacoes)
        .map((item) => item.determinacoes);

      return res.json(listaFormatada);
    } catch (error) {
      console.error("Erro na API de busca de determinações:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar parâmetros do grupo" });
    }
  }

  static async renderFilaAnalises(req, res) {
    try {
      // 1. Busca as amostras no banco
      const amostrasBanco = await AmostraModel.listarTodas();

      // 2. Filtra apenas as que precisam de resultados e formata para o Handlebars
      const amostrasPendentes = amostrasBanco
        .filter((amostra) => amostra.status !== "Concluído") // Esconde as finalizadas
        .map((amostra) => ({
          _id: amostra.id,
          protocolo: amostra.protocolo,
          tipo_amostra: amostra.tipo_amostras?.nome || "Não definido",
          status: amostra.status,
          data_coleta: amostra.data_coleta,
          cliente_nome: amostra.clientes?.nome || "Cliente sem Nome",
        }));

      // 3. Desenha a tela
      res.render("fila-analises", {
        pageTitle: "Fila de Análises",
        amostras: amostrasPendentes,
      });
    } catch (error) {
      console.error("Erro ao listar fila de análises:", error);
      res.redirect("/dashboard");
    }
  }
}

// Função auxiliar para formatar a data padrão YYYY-MM-DD
function PatternData(date) {
  return date.toISOString().split("T")[0];
}

module.exports = AmostraController;
