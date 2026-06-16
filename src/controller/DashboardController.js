// controllers/DashboardController.js
const AmostraModel = require("../models/AmostraModel");

class DashboardController {
  static async renderDashboard(req, res) {
    try {
      // 1. Buscamos os dados básicos do banco
      const estatisticas = await AmostraModel.obterEstatisticas();
      const ultimasAmostras = await AmostraModel.listarUltimas(5);

      // Precisamos de todas as amostras para montar os gráficos e os cards mensais
      const todasAmostras = await AmostraModel.listarTodas();

      // 2. Cálculos dos Cards Globais
      const amostrasPendentes = estatisticas.pendentes + estatisticas.validacao;
      const totalAmostras = amostrasPendentes + estatisticas.laudos;
      const taxaProcessamento =
        totalAmostras === 0
          ? 0
          : Math.round((estatisticas.laudos / totalAmostras) * 100);

      // 3. Variáveis de contagem de Tempo (Mês atual e últimos 6 meses)
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth();
      const anoAtual = dataAtual.getFullYear();

      let amostrasMes = 0;
      let laudosMes = 0;

      // Arrays para os Gráficos
      const contagemTipos = {}; // Para o gráfico de Rosca
      const contagemMeses = {}; // Para o gráfico de Linhas
      const nomesMeses = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];

      // Pré-preenche os últimos 6 meses zerados para o Gráfico de Linha não quebrar
      for (let i = 5; i >= 0; i--) {
        const d = new Date(anoAtual, mesAtual - i, 1);
        const chaveMes = `${nomesMeses[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
        contagemMeses[chaveMes] = 0;
      }

      // 4. Varre todas as amostras distribuindo os dados para os gráficos e cards
      todasAmostras.forEach((amostra) => {
        // Pega a data (criada em ou data de recebimento)
        const dataAmostra = new Date(
          amostra.created_at || amostra.data_recebimento,
        );
        const amostraMes = dataAmostra.getMonth();
        const amostraAno = dataAmostra.getFullYear();

        // Lógica dos Cards (Apenas do Mês Atual)
        if (amostraMes === mesAtual && amostraAno === anoAtual) {
          amostrasMes++;
          if (amostra.status === "Concluído") laudosMes++;
        }

        // Lógica do Gráfico de Rosca (Tipos de Matriz)
        const nomeTipo = amostra.tipo_amostras?.nome || "Outros";
        contagemTipos[nomeTipo] = (contagemTipos[nomeTipo] || 0) + 1;

        // Lógica do Gráfico de Linha (Soma +1 se a amostra for de um dos últimos 6 meses)
        const chaveMesGrafico = `${nomesMeses[amostraMes]}/${amostraAno.toString().slice(-2)}`;
        if (contagemMeses[chaveMesGrafico] !== undefined) {
          contagemMeses[chaveMesGrafico]++;
        }
      });

      const contagemClientes = {};

      todasAmostras.forEach((amostra) => {
        const nomeCliente = amostra.clientes?.nome;
        if (nomeCliente) {
          contagemClientes[nomeCliente] =
            (contagemClientes[nomeCliente] || 0) + 1;
        }
      });

      // 2. Descobre quem é o campeão
      let topClienteNome = "Sem Dados";
      let topClienteQuantidade = 0;

      for (const [cliente, quantidade] of Object.entries(contagemClientes)) {
        if (quantidade > topClienteQuantidade) {
          topClienteQuantidade = quantidade;
          topClienteNome = cliente;
        }
      }

      // 5. Renderizamos a página passando tudo (JSON.stringify envia as listas no formato correto pro JS do front)
      res.render("dashboard", {
        pageTitle: "Visão Geral",
        activeDashboard: true,

        // Dados dos Cards
        amostrasMes,
        laudosMes,
        taxaProcessamento,
        amostrasPendentes,
        ultimasAmostras,
        topClienteNome,
        topClienteQuantidade,

        // Dados dos Gráficos
        graficoRoscaLabels: JSON.stringify(Object.keys(contagemTipos)),
        graficoRoscaDados: JSON.stringify(Object.values(contagemTipos)),
        graficoLinhaLabels: JSON.stringify(Object.keys(contagemMeses)),
        graficoLinhaDados: JSON.stringify(Object.values(contagemMeses)),
      });
    } catch (error) {
      console.error("Erro ao processar os dados do dashboard:", error);
      res.status(500).send("Erro interno ao renderizar o dashboard.");
    }
  }
}

module.exports = DashboardController;
