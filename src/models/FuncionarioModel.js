// models/FuncionarioModel.js
const supabase = require("../../config/supabase.js");

class FuncionarioModel {
  // Busca todos os funcionários ativos
  static async listarTodos() {
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (error) throw error;
    return data;
  }

  // Adicione este método dentro da classe FuncionarioModel

  // Método para salvar um novo funcionário no banco
  static async criar(dadosFuncionario) {
    const { data, error } = await supabase
      .from("funcionarios")
      .insert([dadosFuncionario])
      .select()
      .single();

    if (error) {
      // Verifica se o erro é de e-mail duplicado (Unique violation no PostgreSQL)
      if (error.code === "23505") {
        throw new Error("Este e-mail já está cadastrado para outro usuário.");
      }
      throw error;
    }

    return data;
  }

  // Busca um funcionário pelo e-mail (Usaremos no Login depois!)
  static async buscarPorEmail(email) {
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error; // Ignora erro de "não encontrado"
    return data;
  }

  // Busca todos os funcionários que estão com ativo = true
  static async listarAtivos() {
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (error) throw error;
    return data;
  }

  // Desativa um funcionário
  static async desativar(id) {
    const { data, error } = await supabase
      .from("funcionarios")
      .update({ ativo: false })
      .eq("id", id);

    if (error) throw error;
    return data;
  }
}

module.exports = FuncionarioModel;
