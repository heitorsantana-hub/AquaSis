// routes/auth.js
const express = require("express");
const router = express.Router();
const AuthController = require("../controller/AuthController.js");

// Rotas de Autenticação
router.get("/login", AuthController.renderLogin);
router.get("/main", AuthController.renderHome);
router.post("/login", AuthController.processLogin);
router.get("/logout", AuthController.logout);

// Redireciona a raiz para o login
router.get("/", (req, res) => {
  res.redirect("main");
});

module.exports = router;
