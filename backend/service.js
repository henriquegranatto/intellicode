var fs = require('fs')
const {OpenAI} = require("openai")
var parser = require('java-parser')
const socketManager = require('./socket')
const { execSync } = require('child_process')

const smellTypes = ['Long Method', 'Complex Method'];

const filterItemsWithSmells = (items, smellTypes) =>
{
    return items.filter(item =>
        smellTypes.every(type =>
            item.smells.some(smell =>
                smell.smell === type
            )
        )
    )
}

const getMethodCode = (code, method) =>
{
    const cst = parser.parse(code);

    function traverse(node, methodName) 
    {
        if (node.name === 'methodDeclaration' && node.children.methodHeader[0].children.methodDeclarator[0].children.Identifier[0].image === methodName) 
            return code.substring(node.location.startOffset, node.location.endOffset);
        else 
            for (const key in node.children)
                for (const child of node.children[key])
                {
                    const result = traverse(child, methodName)
                    if (result) return result;
                }
    }

    return traverse(cst, method);
}

const getMethods = (smells) =>
{
    const items = filterItemsWithSmells(smells, smellTypes);

    const codeMethods = items.map(item => {
        const method = item.method.split(".").pop().replace("()", "")
        const arquivo = `repository/src/${item.method.split(".").slice(0, -1).join("/")}.java` 
        const code = fs.readFileSync(arquivo, 'utf-8');
        return {file: `${arquivo}:${item.line}`, method: `${method}()`, code: getMethodCode(code, method)}
    })
    
    return codeMethods
}

const sendToGPT = async (smell) =>
{
    console.log('Gerando análise')
    socketManager.emitMessage('status', 'Gerando análise....');
    const LongMethodExplain = `What is "Long Method"? The "Long Method" is a source code smell identified during software analysis, characterized by the presence of extensive and complex methods in a computer program. This smell arises when a method becomes excessively long, making it difficult to understand, maintain and test the code. Reasons for this problem to arise include lack of modularity, accumulation of logic at a single point, and violation of the principles of cohesion and loose coupling. Effective treatment for this smell involves refactoring the code, breaking the long method into smaller, more specialized parts. This not only improves code readability but also makes reuse and maintenance easier. Consequences of long methods can include difficulties in identifying bugs, increased development effort, and reduced software flexibility for future changes. Therefore, identifying and proactively addressing the "Long Method" smell is essential to ensure the quality and sustainability of the source code.`
    const ComplexMethodExplain = `What is "Long Method"? "Complex Method" is a source code odor that manifests itself when a method in a computer program becomes overly complex and intricate. This smell arises due to the presence of complex logic, excessive nesting, or a combination of multiple responsibilities within a single method. Reasons for this problem to arise include a lack of decomposition of tasks into smaller, more manageable parts, as well as a lack of application of design principles such as the single responsibility principle. Effective treatment for "Complex Method" involves applying refactoring techniques such as extracting methods or reorganizing logic to reduce complexity. By simplifying the method structure, code readability is improved, making it easier to understand and maintain. The consequences of this smell include difficulties in detecting errors, increased cognitive complexity for developers and reduced adaptability of the code to future changes. Therefore, it is crucial to proactively address the "Complex Method" smell to promote software maintainability and scalability.`
    const Code = smell.code

    const openai = new OpenAI({ apiKey: "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" });

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
                content: `Crie um texto em markdown que: explique o que significa o smell do Método Longo, explique o que significa o smell do Método Complexo, explique porque o código citado possuí esses dois smells, crie uma versão completa do código citado que resolva esses smells`
            }
        ]
    });

    console.log(completion)

    execSync(`rm -rf repository`)
    execSync(`rm -rf analysis`)

    socketManager.emitMessage('complete', {file: smell.file, method: smell.method, code: smell.code, analysis: completion.choices[0].message});
}

const process = async (smells) => 
{
    console.log('Processando Dados')
    socketManager.emitMessage('status', 'Processando Dados...');
    return sendToGPT(getMethods(smells)[0])
}

module.exports = { process }