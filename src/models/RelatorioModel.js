// models/RelatorioModel.js
const supabase = require("../../config/supabase.js");

class RelatorioModel {
  static async listarLaudos(filtros = {}) {
    // Inicia a query buscando apenas as amostras concluídas
    // O inner join (!) garante que só traga se o cliente existir
    let query = supabase
      .from("amostras")
      .select(
        `
                protocolo,
                data_recebimento,
                clientes!inner(id, nome)
            `,
      )
      .eq("status", "Concluído")
      .order("data_recebimento", { ascending: false });

    // Adiciona os filtros dinamicamente se eles foram preenchidos na tela
    if (filtros.dataInicial) {
      query = query.gte("data_recebimento", filtros.dataInicial);
    }
    if (filtros.dataFinal) {
      query = query.lte("data_recebimento", filtros.dataFinal);
    }
    if (filtros.clienteId) {
      query = query.eq("cliente_id", filtros.clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }

  // models/RelatorioModel.js
  static async buscarDadosCompletos(protocolo) {
    const { data, error } = await supabase
      .from("amostras")
      .select(
        `
            *,
            clientes (*),
            funcionarios (nome),
            resultados (
                valor_resultado,
                parametros_analise (nome, unidade, acreditada)
            )
        `,
      )
      .eq("protocolo", protocolo)
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = RelatorioModel;
