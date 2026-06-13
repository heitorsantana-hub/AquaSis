const DeterminacaoModel = require("../models/DeterminacaoModel.js");
const supabase = require("../../config/supabase.js");

class DeterminacaoController {
  static async criar(req, res) {
    try {
      const dado = {
        nome: req.body.nome,
        unidade_medida: req.body.unidade_medida,
      };

      await DeterminacaoModel.criar(dado);

      return res.status(201).redirect("/amostras/nova");
    } catch (error) {
      console.error("Erro ao cadastrar Tipo de Amostra:", error);
      return res
        .status(500)
        .send("Erro interno ao tentar cadastrar o tipo de amostra.");
    }
  }
}

module.exports = DeterminacaoController;
