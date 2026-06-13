const supabase = require("../../config/supabase.js");

class DeterminacaoModel {
  static async criar(dadosDeterminacao) {
    const { data, error } = await supabase
      .from("determinacoes")
      .insert(dadosDeterminacao)
      .select();

    if (error) throw error;
    return data;
  }

  static async listarTodos() {
    const { data, error } = await supabase
      .from("determinacoes")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data;
  }
}

module.exports = DeterminacaoModel;
