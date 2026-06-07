// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { protegerRota } = require("../middlewares/authMiddlewares.js");
const AmostraController = require("../controller/AmostraController");
const DashboardController = require("../controller/DashboardController");
const ClienteController = require("../controller/ClienteController");
const RelatorioController = require("../controller/RelatorioController");
const FuncionarioController = require("../controller/FuncionarioController");

// Rota para o dashboard principal com os dados
router.get("/dashboard", protegerRota, DashboardController.renderDashboard);

//Rota de relatorios e laudos
router.get("/relatorios", protegerRota, RelatorioController.renderRelatorios);

//Rota de listagem de clientes
router.get("/clientes", protegerRota, ClienteController.renderLista);
router.post("/clientes/editar/:id", protegerRota, ClienteController.atualizar);
router.post("/clientes/deletar", protegerRota, ClienteController.deletar);

// Rota para listar os funcionários ativos
router.get("/funcionarios", protegerRota, FuncionarioController.renderLista);

router.get("/clientes/novo", protegerRota, (req, res) => {
  res.render("cadastro-cliente", {
    pageTitle: "Cadastrar Cliente",
    activeCliente: true,
  });
});

// Rota para renderizar a tela de cadastro de amostra
router.get("/amostras/nova", protegerRota, AmostraController.renderNova);
router.post("/amostras/salvar", protegerRota, AmostraController.salvar);

//Listagem de Amostras
router.get("/amostras", protegerRota, AmostraController.renderLista);
router.post("/amostras/deletar", protegerRota, AmostraController.delete);

router.get("/funcionarios/novo", protegerRota, (req, res) => {
  res.render("cadastro-funcionario", {
    pageTitle: "Cadastrar Funcionário",
    activeFuncionarioC: true,
  });
});

// Rota para salvar um novo funcionário
router.post("/funcionarios/salvar", protegerRota, FuncionarioController.salvar);

//Rota desativar funcionario
router.get(
  "/funcionarios/desativar/:id",
  protegerRota,
  FuncionarioController.desativarAcesso,
);

//Rota para salvar um novo cliente
router.post("/clientes/salvar", protegerRota, ClienteController.salvar);

// Rota para gerar PDF do laudo técnico
router.get(
  "/relatorios/download/:protocolo",
  protegerRota,
  RelatorioController.gerarPDF,
);

// Rota para desativar um funcionário
router.post(
  "/funcionarios/desativar/:id",
  protegerRota,
  FuncionarioController.desativarAcesso,
);

module.exports = router;
