// controllers/RelatorioController.js
const RelatorioModel = require("../models/RelatorioModel");
const ClienteModel = require("../models/ClienteModel");
const puppeteer = require("puppeteer");
const hbs = require("handlebars");
const fs = require("fs");
const path = require("path");

class RelatorioController {
  static async renderRelatorios(req, res) {
    try {
      // Pega os parâmetros da URL (se houver)
      const { dataInicial, dataFinal, clienteId } = req.query;

      // Busca os dados nos Models
      const clientes = await ClienteModel.listarTodos();
      const laudosBrutos = await RelatorioModel.listarLaudos({
        dataInicial,
        dataFinal,
        clienteId,
      });

      // Formata a data para exibir bonito na tabela
      const laudosFormatados = laudosBrutos.map((laudo) => {
        const [ano, mes, dia] = laudo.data_recebimento.split("-");
        return {
          protocolo: laudo.protocolo,
          clienteNome: laudo.clientes.nome,
          dataConclusao: `${dia}/${mes}/${ano}`,
        };
      });

      res.render("relatorio", {
        pageTitle: "Relatórios e Laudos",
        activeRelatorios: true,
        laudos: laudosFormatados,
        clientes: clientes,
        // Passamos os filtros de volta para a view para manter os inputs preenchidos
        filtros: { dataInicial, dataFinal, clienteId },
      });
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      res.status(500).send("Erro ao carregar a página de relatórios.");
    }
  }

  // No seu RelatorioController...
  static async gerarPDF(req, res) {
    try {
      const { protocolo } = req.params;
      const dados = await RelatorioModel.buscarDadosCompletos(protocolo);

      // 1. Carrega e compila o template HBS do laudo
      const templatePath = path.join(
        __dirname,
        "../../views/laudo-tecnico.hbs",
      );
      const htmlContent = fs.readFileSync(templatePath, "utf-8");
      const template = hbs.compile(htmlContent);
      const finalHtml = template({ amostra: dados });

      // 2. Inicia o Puppeteer para converter em PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(finalHtml, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
      });

      await browser.close();

      // 3. Envia o PDF para o navegador
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Laudo-${protocolo}.pdf`,
        "Content-Length": pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      res.status(500).send("Erro ao gerar o arquivo PDF.");
    }
  }
}

module.exports = RelatorioController;
