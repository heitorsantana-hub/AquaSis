const supabase = require("../../config/supabase.js");

class TipoAmostraModel {
  static async criar(dadosTipo) {
    const { data, error } = await supabase
      .from("tipo_amostras")
      .insert(dadosTipo)
      .select("*");

    if (error) {
      throw error;
    }

    // O Supabase sempre retorna um array (data) após um insert com .select()
    if (data && data.length > 0) {
      console.log("--> DADO REAL QUE SAIU DO SUPABASE:", data[0]);
      return data[0]; // Retorna a linha completa contendo { id: X, nome: '...', created_at: '...' }
    }

    return data;
  }

  static async listarTodos() {
    const { data, error } = await supabase
      .from("tipo_amostras")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data;
  }

  static async associarDeterminacoes(tipoAmostraId, determinacoesIds) {
    // 1. Transforma o array de IDs simples em um array de objetos para a tabela intermediária
    const associacoes = determinacoesIds.map((detId) => ({
      tipo_amostra_id: tipoAmostraId,
      determinacao_id: detId,
    }));

    // 2. Insere todas as linhas de uma vez só (alta performance)
    const { data, error } = await supabase
      .from("tipo_amostra_determinacoes")
      .insert(associacoes);

    if (error) {
      throw error;
    }

    return data;
  }

  // Atualiza o nome do tipo de amostra
  static async atualizar(id, novoNome) {
    const { data, error } = await supabase
      .from("tipo_amostras")
      .update({ nome: novoNome })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Limpa as relações antigas e adiciona as novas (Sincronização)
  static async sincronizarDeterminacoes(tipoAmostraId, determinacoesIds) {
    // 1. Deleta tudo o que esse tipo já tinha associado
    const { error: deleteError } = await supabase
      .from("tipo_amostra_determinacoes")
      .delete()
      .eq("tipo_amostra_id", tipoAmostraId);

    if (deleteError) throw deleteError;

    // 2. Se houver novas determinações selecionadas, associa elas
    if (determinacoesIds && determinacoesIds.length > 0) {
      await this.associarDeterminacoes(tipoAmostraId, determinacoesIds);
    }
  }

  // Atualiza apenas o nome na tabela 'tipo_amostras'
  static async atualizar(id, novoNome) {
    const { data, error } = await supabase
      .from("tipo_amostras")
      .update({ nome: novoNome })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Sincroniza o relacionamento (Limpa o antigo e injeta o novo pacote)
  static async sincronizarDeterminacoes(tipoAmostraId, determinacoesIds) {
    // 1. Deleta todas as linhas antigas ligadas a esse tipo_amostra_id
    const { error: deleteError } = await supabase
      .from("tipo_amostra_determinacoes")
      .delete()
      .eq("tipo_amostra_id", tipoAmostraId);

    if (deleteError) throw deleteError;

    // 2. Se o usuário deixou caixas marcadas, faz a nova associação em lote
    if (determinacoesIds && determinacoesIds.length > 0) {
      await this.associarDeterminacoes(tipoAmostraId, determinacoesIds);
    }
  }
}

module.exports = TipoAmostraModel;
