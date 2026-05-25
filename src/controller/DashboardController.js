// controllers/DashboardController.js
const AmostraModel = require("../models/AmostraModel");

class DashboardController {
  static async renderDashboard(req, res) {
    try {
      // 1. Buscamos os dados reais do banco usando o seu Model
      const estatisticas = await AmostraModel.obterEstatisticas();
      const ultimasAmostras = await AmostraModel.listarUltimas(5);

      // 2. Realizamos a lógica de negócio (Cálculos)
      const amostrasPendentes = estatisticas.pendentes + estatisticas.validacao;
      const totalAmostras = amostrasPendentes + estatisticas.laudos;

      // Calcula a % de amostras já concluídas (evita divisão por zero)
      const taxaProcessamento =
        totalAmostras === 0
          ? 0
          : Math.round((estatisticas.laudos / totalAmostras) * 100);

      // ATENÇÃO: Como não há método financeiro nos models enviados,
      // as variáveis de faturamento estão mockadas. Futuramente você substitui
      // por chamadas como `await FinanceiroModel.obterFaturamentoMensal()`.
      const faturamentoMensal = "40.000,00";
      const faturamentoAnual = "215.000,00";

      // 3. Renderizamos a página passando o objeto com as variáveis do Handlebars
      res.render("dashboard", {
        pageTitle: "Visão Geral",
        activeDashboard: true, // Acende o botão na sidebar
        faturamentoMensal,
        faturamentoAnual,
        taxaProcessamento,
        amostrasPendentes,
        ultimasAmostras,
      });
    } catch (error) {
      console.error("Erro ao processar os dados do dashboard:", error);
      res.status(500).send("Erro interno ao renderizar o dashboard.");
    }
  }
}

module.exports = DashboardController;
