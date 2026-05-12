module.exports = {
  // Verifica se há um usuário na sessão, se não tiver, redireciona para o login
  protegerRota: (req, res, next) => {
    if (!req.session.usuario) {
      return res.redirect("/login");
    }
    next(); // Se estiver logado, deixa a requisição passar para o Controller
  },
};
