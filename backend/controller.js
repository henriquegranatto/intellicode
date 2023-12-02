var fs = require('fs')
var path = require('path')
var service = require('./service')
var clone = require('git-clone/promise')
const socketManager = require('./socket')
const { execSync } = require('child_process')

module.exports = async (request, response, next) =>
{
    response.status(200).send()

    console.log('Clonando repositório')
    socketManager.emitMessage('status', 'Clonando repositório...');
    await clone(request.body.repository, "repository")

    console.log('Rodando Dr. Tools')
    socketManager.emitMessage('status', 'Rodando Dr. Tools...');
    execSync(`bash drtools-code-health.sh repository --analyze analysis`)
    
    const basePath = path.join(__dirname, 'analysis', '.drtools', 'analysis');
    const analysisFolder = fs.readdirSync(basePath)[0]
    const file = path.join(basePath, analysisFolder, 'smells', 'drtools-smells-methods.json');
    
    service.process(JSON.parse(fs.readFileSync(file, 'utf8')))
}