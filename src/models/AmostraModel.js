const supabase = require("../../config/supabase.js");

class AmostraModel {
  // Gera o protocolo no formato SEQ-MMAAAA (Ex: 150-082025)
  static async gerarProtocolo() {
    const hoje = new Date();
    const mesAno = `${String(hoje.getMonth() + 1).padStart(2, "0")}${hoje.getFullYear()}`;

    // Puxa a última amostra cadastrada
    const { data, error } = await supabase
      .from("amostras")
      .select("protocolo")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    let sequencial = 1;
    if (data && data.length > 0) {
      // Extrai o número antes do traço (Ex: de "149-082025" tira o "149")
      const ultimoProtocolo = data[0].protocolo;
      const ultimoSeq = parseInt(ultimoProtocolo.split("-")[0]);
      if (!isNaN(ultimoSeq)) {
        sequencial = ultimoSeq + 1;
      }
    }

    return `${sequencial}-${mesAno}`;
  }

  static async criar(dadosAmostra, arrayDeAnalises) {
    // 1. Insere a amostra
    const { data: amostra, error: errAmostra } = await supabase
      .from("amostras")
      .insert([dadosAmostra])
      .select()
      .single();

    if (errAmostra) throw errAmostra;

    // 2. Insere os parâmetros selecionados na tabela de resultados (em branco)
    if (arrayDeAnalises && arrayDeAnalises.length > 0) {
      const resultadosParaInserir = arrayDeAnalises.map((parametro_id) => ({
        amostra_id: amostra.id,
        parametro_id: parametro_id,
        valor_resultado: null, // Deixa nulo pro Químico preencher depois
      }));

      const { error: errResultados } = await supabase
        .from("resultados")
        .insert(resultadosParaInserir);

      if (errResultados) throw errResultados;
    }

    return amostra;
  }

  // Adicione dentro de models/AmostraModel.js

  // Busca as contagens de cada status
  static async obterEstatisticas() {
    // Faz 3 consultas rápidas apenas para contar (head: true não traz os dados, só o número, o que é muito mais leve)
    const { count: pendentes } = await supabase
      .from("amostras")
      .select("*", { count: "exact", head: true })
      .eq("status", "Recebida");
    const { count: validacao } = await supabase
      .from("amostras")
      .select("*", { count: "exact", head: true })
      .eq("status", "Em Análise");
    const { count: laudos } = await supabase
      .from("amostras")
      .select("*", { count: "exact", head: true })
      .eq("status", "Concluído");

    return {
      pendentes: pendentes || 0,
      validacao: validacao || 0,
      laudos: laudos || 0,
    };
  }

  // Busca as últimas amostras fazendo um JOIN automático com a tabela clientes
  static async listarUltimas(limite = 5) {
    const { data, error } = await supabase
      .from("amostras")
      .select(
        `
                protocolo,
                tipo_amostra,
                data_recebimento,
                status,
                clientes ( nome ) 
            `,
      )
      .order("created_at", { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data;
  }

  //Listar todos os dados na view listagem
  static async listarTodas() {
    const { data, error } = await supabase
      .from("amostras")
      .select(
        `
          *,
          clientes(nome)
        `,
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
}
module.exports = AmostraModel;
