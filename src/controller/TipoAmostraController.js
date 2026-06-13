const TipoAmostraModel = require("../models/TipoAmostraModel");

class TipoAmostraController {
  static async criar(req, res) {
    try {
      console.log("--> REQUISICAO RECEBIDA NO SALVAR:", req.body);
      const { id, nome, determinacoes } = req.body;
      const listaIds = determinacoes
        ? Array.isArray(determinacoes)
          ? determinacoes
          : [determinacoes]
        : [];

      if (id && id.trim() !== "") {
        // =========================================================
        // MODO EDIÇÃO (O usuário alterou um pacote que já existe)
        // =========================================================
        console.log(`--> MODO EDICAO ATIVADO PARA O ID: ${id}`);

        // 1. Atualiza o nome (Caso ele tenha alterado o texto)
        await TipoAmostraModel.atualizar(id, nome);

        // 2. Sincroniza as determinações (Limpa o passado e reescreve o novo pacote)
        await TipoAmostraModel.sincronizarDeterminacoes(id, listaIds);

        console.log("--> SUCESSO: Pacote atualizado com sucesso!");
      } else {
        // =========================================================
        // MODO CRIAÇÃO (Novo cadastro tradicional)
        // =========================================================
        console.log("--> MODO CRIAÇÃO DE NOVO PARÂMETRO ATIVADO");

        const novoTipo = await TipoAmostraModel.criar({ nome });

        if (listaIds.length > 0 && novoTipo && novoTipo.id) {
          await TipoAmostraModel.associarDeterminacoes(novoTipo.id, listaIds);
        }
        console.log("--> SUCESSO: Novo tipo de amostra criado!");
      }

      // Recarrega a página de cadastro limpa e atualizada
      return res.status(201).redirect("/amostras/nova");
    } catch (error) {
      console.error("Erro crítico no processo de salvar/editar:", error);
      return res.status(500).send("Erro interno ao processar a operação.");
    }
  }
}

module.exports = TipoAmostraController;
