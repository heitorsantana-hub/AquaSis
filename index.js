// index.js
require("dotenv").config();
const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Handlebars
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: { eq: (v1, v2) => v1 === v2 },
  }),
);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// Middlewares Básicos
app.use(express.urlencoded({ extended: true }));

// Configuração da Sessão
app.use(
  session({
    secret: "chave-secreta-do-aquasis",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  }),
);

// Variáveis Globais Dinâmicas para a View
app.use((req, res, next) => {
  if (req.session.usuario) {
    res.locals.userName = req.session.usuario.nome;
    res.locals.userInitials = req.session.usuario.iniciais;
    res.locals.userRole = req.session.usuario.cargo;
    res.locals.isAdmin = req.session.usuario.isAdmin;
  }
  next();
});

// Importação das Rotas
const authRoutes = require("./src/router/auth.js");
const dashboardRoutes = require("./src/router/dashboard.js");

// Registrando as Rotas no Express
app.use("/", authRoutes);
app.use("/", dashboardRoutes);

app.listen(PORT, () => {
  console.log(
    `🚀 Servidor rodando limpo e roteado! Acesse: http://localhost:${PORT}`,
  );
});
