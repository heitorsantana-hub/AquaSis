// controllers/DashboardController.js
const AmostraModel = require("../models/AmostraModel");

class DashboardController {
  static async renderDashboard(req, res) {
    try {
      // 1. Busca os dados no Model
      const stats = await AmostraModel.obterEstatisticas();
      const ultimas = await AmostraModel.listarUltimas(5); // Pega as 5 mais recentes

      // 2. Formata o array para o Handlebars entender ({{clienteNome}}, etc)
      const ultimasAmostrasFormatadas = ultimas.map((amostra) => {
        // Formata a data de AAAA-MM-DD para DD/MM/AAAA (opcional, mas fica mais bonito)
        const [ano, mes, dia] = amostra.data_recebimento.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;

        return {
          protocolo: amostra.protocolo,
          clienteNome: amostra.clientes
            ? amostra.clientes.nome
            : "Cliente Removido",
          tipoAmostra: amostra.tipo_amostra,
          dataRecebimento: dataFormatada,
          status: amostra.status,
        };
      });

      // 3. Envia tudo para a view
      res.render("dashboard", {
        pageTitle: "Dashboard Executivo",
        activeDashboard: true,
        pendentesCount: stats.pendentes,
        validacaoCount: stats.validacao,
        laudosCount: stats.laudos,
        ultimasAmostras: ultimasAmostrasFormatadas,
      });
    } catch (error) {
      console.error("Erro ao carregar o dashboard:", error);
      res.status(500).send("Erro interno ao carregar o painel.");
    }
  }
}

module.exports = DashboardController;
