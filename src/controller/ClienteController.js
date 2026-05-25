// controllers/ClienteController.js
const ClienteModel = require("../models/ClienteModel");
const { isCPF } = require("validation-br");

class ClienteController {
  // Recebe os dados do formulário (POST)
  static async salvar(req, res) {
    try {
      // AGORA EXTRAINDO OS DADOS NOVOS DE ENDEREÇO
      const {
        nome,
        documento,
        telefone,
        email,
        cep,
        logradouro,
        bairro,
        cidade,
        estado,
      } = req.body;

      //Variavel validação de documento
      const teste = isCPF(documento);

      //Se o documento for verdadeiro
      if (teste) {
        const novoCliente = {
          nome,
          documento,
          telefone,
          email,
          cep,
          logradouro,
          bairro,
          cidade,
          estado,
        };

        // Manda pro banco de dados
        await ClienteModel.criar(novoCliente);

        res.redirect("/amostras/nova");
      } else {
        //Retornando mensagem de erro com caso de CPF Inválido
        return res.render("cadastro-cliente", {
          pageTitle: "Cadastrar Cliente",
          activeClientes: true,
          erro: "O CPF ou CPNJ informado está inválido. Por favor, verifique os números digitados.",
          cliente: req.body, // Devolve os dados para o formulário não apagar o que ele já preencheu
        });
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error.message);

      res.render("cadastro-cliente", {
        pageTitle: "Cadastrar Cliente",
        activeClientes: true,
        erro: error.message,
      });
    }
  }

  // Renderiza a tela de cadastro, mas no modo "Edição" (GET)
  static async renderEditar(req, res) {
    try {
      const { id } = req.params;

      // Busca os dados do cliente no banco
      const cliente = await ClienteModel.buscarPorId(id);

      // Renderiza a MESMA tela de cadastro, mas passando a flag "isEdit"
      res.render("cadastro-cliente", {
        pageTitle: "Editar Cliente",
        activeClientes: true,
        cliente: cliente, // Envia os dados para preencher os inputs
        isEdit: true, // Avisa o Handlebars que é uma edição
      });
    } catch (error) {
      console.error("Erro ao buscar cliente para edição:", error);
      res.redirect("/dashboard"); // Ou para uma lista de clientes, se você tiver
    }
  }

  static async renderLista(req, res) {
    try {
      // 1. Chama o seu Model para buscar os dados no Supabase
      const clientesSupabase = await ClienteModel.listarTodos();

      // 2. Mapeamento de Dados (IMPORTANTE)
      // O Supabase por padrão usa a coluna "id", mas no HTML nós colocamos "{{this._id}}"
      // para manter compatibilidade caso você usasse MongoDB. Vamos mapear para o Handlebars entender:
      const clientesFormatados = clientesSupabase.map((cliente) => ({
        _id: cliente.id,
        nome: cliente.nome,
        email: cliente.email || "Sem e-mail",
        telefone: cliente.telefone || "Sem telefone",
      }));

      // 3. Renderiza a tela (clientes.hbs) passando o array de dados
      res.render("clientes", {
        pageTitle: "Gestão de Clientes",
        activeClienteL: true, // Acende o botão "Clientes" na barra lateral
        clientes: clientesFormatados,
      });
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      // Em um sistema real, você pode renderizar uma página de erro aqui
      res.status(500).send("Erro interno ao carregar a lista de clientes.");
    }
  }

  // Recebe os dados alterados e salva no banco (POST)
  static async atualizar(req, res) {
    const { id } = req.params;
    try {
      const {
        nome,
        documento,
        telefone,
        email,
        cep,
        logradouro,
        bairro,
        cidade,
        estado,
      } = req.body;

      // Reutilizamos a sua validação do validation-br aqui (lembre de importar o isCPF se for usar)
      // Para simplificar o exemplo, vamos direto para a atualização:

      const dadosAtualizados = {
        nome,
        documento,
        telefone,
        email,
        cep,
        logradouro,
        bairro,
        cidade,
        estado,
      };

      await ClienteModel.atualizar(id, dadosAtualizados);

      // Redireciona para o dashboard ou lista após o sucesso
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error.message);
      res.render("cadastro-cliente", {
        pageTitle: "Editar Cliente",
        activeClientes: true,
        cliente: { ...req.body, id }, // Mantém o que ele digitou
        isEdit: true,
        erro: error.message,
      });
    }
  }
}

module.exports = ClienteController;
