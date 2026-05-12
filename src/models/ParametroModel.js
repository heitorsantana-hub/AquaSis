const supabase = require("../../config/supabase.js");

class ParametroModel {
  static async listarTodos() {
    const { data, error } = await supabase
      .from("parametros_analise")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data;
  }
}
module.exports = ParametroModel;
