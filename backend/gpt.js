import OpenAI from "openai";

const LongMethodExplain = `What is "Long Method"? The "Long Method" is a source code smell identified during software analysis, characterized by the presence of extensive and complex methods in a computer program. This smell arises when a method becomes excessively long, making it difficult to understand, maintain and test the code. Reasons for this problem to arise include lack of modularity, accumulation of logic at a single point, and violation of the principles of cohesion and loose coupling. Effective treatment for this smell involves refactoring the code, breaking the long method into smaller, more specialized parts. This not only improves code readability but also makes reuse and maintenance easier. Consequences of long methods can include difficulties in identifying bugs, increased development effort, and reduced software flexibility for future changes. Therefore, identifying and proactively addressing the "Long Method" smell is essential to ensure the quality and sustainability of the source code.`
const ComplexMethodExplain = `What is "Long Method"? "Complex Method" is a source code odor that manifests itself when a method in a computer program becomes overly complex and intricate. This smell arises due to the presence of complex logic, excessive nesting, or a combination of multiple responsibilities within a single method. Reasons for this problem to arise include a lack of decomposition of tasks into smaller, more manageable parts, as well as a lack of application of design principles such as the single responsibility principle. Effective treatment for "Complex Method" involves applying refactoring techniques such as extracting methods or reorganizing logic to reduce complexity. By simplifying the method structure, code readability is improved, making it easier to understand and maintain. The consequences of this smell include difficulties in detecting errors, increased cognitive complexity for developers and reduced adaptability of the code to future changes. Therefore, it is crucial to proactively address the "Complex Method" smell to promote software maintainability and scalability.`
const Code = 
`public static void PopulaContas() throws URISyntaxException {
	BancoServicos bancoServicos = new BancoServicos(bancos);
	PessoaServicos pessoaServicos = new PessoaServicos(pessoas);
	ContasServicos contasServicos = new ContasServicos(bancos, pessoas);
	Path caminhoDoArquivo = Path.of(Main.class.getResource(Path.of("dados", "contas.csv").toString()).toURI()).toAbsolutePath();

	Helpers.percorreCSV(
        caminhoDoArquivo,
        (colunas) -> {
            Pessoa pessoa = pessoaServicos.buscarPorCPF(colunas.get(1));
            Banco banco = bancoServicos.buscarPorNumero(Integer.parseInt(colunas.get(2)));
            int numero = Integer.parseInt(colunas.get(3));
            double saldo = Double.parseDouble(colunas.get(4));
            String senha = colunas.get(5);

            if (pessoa == null || banco == null) {
                return false;
            }

            switch (colunas.get(0).toLowerCase()) {
                case "poupança" -> {
                    double rendimento = Double.parseDouble(colunas.get(7));
                    contasServicos.inserirNovo(new ContaPoupanca(pessoa, banco, numero, senha, saldo, rendimento));
                }
                case "corrente" -> {
                    double taxaMensal = Double.parseDouble(colunas.get(6));
                    contasServicos.inserirNovo(new ContaCorrente(pessoa, banco, numero, senha, saldo, taxaMensal));
                }
            }
            return true;
        }
	);
}`

const openai = new OpenAI({ apiKey: "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" });

async function analyze() {
  const completion = await openai.chat.completions.create({
    top_p: 1,
    temperature: 1,
    max_tokens: 2000,
    presence_penalty: 0,
    frequency_penalty: 0,
    model: "gpt-3.5-turbo",
    messages: [
      { 
        role: "system", 
        content: 
        `
          ${LongMethodExplain}
          ${ComplexMethodExplain}
          ${Code}
        `
      },
      { 
        role: "user", 
        content: `Crie um texto que: explique o que significa o smell do Método Longo, explique o que significa o smell do Método Complexo, explique porque o código de exemplo possuí esses dois smells, crie uma versão completa do código de exemplo que resolva esses smells`
      }
    ]
  });

  console.log(JSON.stringify(completion));
}

analyze();