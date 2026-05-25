const supabase = require("../../config/supabase.js");

class ClienteModel {
  // Método que você já tem
  static async listarTodos() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data;
  }

  // NOVO: Método para salvar um cliente no banco
  static async criar(dadosCliente) {
    const { data, error } = await supabase
      .from("clientes")
      .insert([dadosCliente])
      .select()
      .single();

    if (error) {
      // Verifica se o erro é de documento (CNPJ/CPF) duplicado
      if (error.code === "23505") {
        throw new Error("Este CNPJ/CPF já está cadastrado no sistema.");
      }
      throw error;
    }

    return data;
  }

  // Busca um cliente específico pelo ID
  static async buscarPorId(id) {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  // Atualiza os dados de um cliente existente
  static async atualizar(id, dadosCliente) {
    const { data, error } = await supabase
      .from("clientes")
      .update(dadosCliente)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Este CNPJ/CPF já está cadastrado em outro cliente.");
      }
      throw error;
    }

    return data;
  }
}

module.exports = ClienteModel;
