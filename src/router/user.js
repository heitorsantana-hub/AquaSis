// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { protegerRota } = require("../middlewares/authMiddlewares.js");

router.get("/login/cliente", (req, res) => {
  res.render("login-user", { layout: false });
});

router.get("/login/cliente1", (req, res) => {
  res.render("login-user1", { layout: false });
});

router.get("/login/cliente2", (req, res) => {
  res.render("login-user2", { layout: false });
});

router.get("/login/cliente3", (req, res) => {
  res.render("login-user3", { layout: false });
});

router.get("/consulta/cliente", (req, res) => {
  res.render("consulta-cliente", { layout: false });
});

module.exports = router;
