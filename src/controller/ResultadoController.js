const supabase = require("../../config/supabase.js");

class ResultadoController {
  static async render(req, res) {
    try {
      // 1. Pega o ID da amostra que veio na URL (Ex: /amostras/resultados/123-abc)
      const amostraId = req.params.id;

      if (!amostraId) {
        return res.status(400).send("ID da amostra não informado.");
      }

      // 2. Busca APENAS essa amostra específica (trazendo o nome do cliente e do tipo junto)
      const { data: amostra, error: errAmostra } = await supabase
        .from("amostras")
        .select("*, clientes(nome), tipo_amostras(nome)")
        .eq("id", amostraId)
        .single(); // Garante que traz só 1 objeto, e não um array

      if (errAmostra) throw errAmostra;

      // 3. Busca a tabela de resultados atrelada a esta amostra (Trazendo o nome do ensaio e a unidade)
      const { data: resultados, error: errResultados } = await supabase
        .from("resultados")
        .select("*, determinacoes(nome, unidade_medida)")
        .eq("amostra_id", amostraId);

      if (errResultados) throw errResultados;

      // 4. Renderiza a tela de preencher resultados enviando os dados
      res.render("resultado", {
        // Troque "resultado" pelo nome exato do seu arquivo .hbs se for diferente
        pageTitle: "Lançamento de Resultados",
        amostra: amostra,
        resultados: resultados,
      });
    } catch (error) {
      console.error("Erro ao carregar a tela de resultados:", error);
      res.status(500).send("Erro interno ao buscar os dados da amostra.");
    }
  }

  static async salvar(req, res) {
    try {
      const { amostra_id, resultados } = req.body;

      if (!resultados || resultados.length == 0) {
        return res.status(400).send("Nenhum resultado foi enviado para enviar");
      }

      const dadosAtualizados = resultados.map((item) => ({
        id: item.id,
        valor_resultado: item.valor,
        amostra_id: amostra_id,
      }));

      //Inserindo na tabela resultados
      const { error: errResultados } = await supabase
        .from("resultados")
        .upsert(dadosAtualizados);

      if (errResultados) throw errResultados;

      //Atualizando status da amostra
      const { error: errAmostra } = await supabase
        .from("amostras")
        .update({ status: "Concluído" })
        .eq("id", amostra_id);

      if (errAmostra) throw errAmostra;

      res.status(201).redirect("/fila");
    } catch (error) {
      console.error("Erro ao salvar no banco: ", error);
      res.status(500).send("Erro interno ao salvar no banco de dados");
    }
  }
}

module.exports = ResultadoController;
