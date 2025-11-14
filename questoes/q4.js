const express = require('express');
const { MongoClient } = require('mongodb');
const { gerarHtmlBase } = require('../utils/htmlBase');

const router = express.Router();
const uri = "mongodb://127.0.0.1:27017/";
const dbName = "termosTI";
const collectionName = "TermosMaisUsados";

router.get('/', async (req, res) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);
        
        const backend = ['python', 'java', 'nodejs', 'php', 'ruby'];
        const frontend = ['javascript', 'react', 'angular', 'vue', 'css'];
        
        const pipeline = [
            { $match: { Termo: { $in: [...backend, ...frontend] } } },
            { $addFields: { 
                convertedDate: { $dateFromString: { dateString: '$Mensuracao', format: '%d/%m/%Y' } }
            }},
            { $addFields: { year: { $year: '$convertedDate' } }},
            { $group: {
                _id: { termo: '$Termo', year: '$year' },
                mediaAnual: { $avg: '$Participacao' }
            }},
            { $sort: { '_id.year': 1, mediaAnual: -1 } }
        ];
        
        const results = await collection.aggregate(pipeline).toArray();
        
        const anos = [...new Set(results.map(r => r._id.year))].sort();
        let tabela = '<table><thead><tr><th>Ano</th><th>Posição</th><th>Backend</th><th>Frontend</th></tr></thead><tbody>';
        
        anos.forEach(ano => {
            const dadosAno = results.filter(r => r._id.year === ano).sort((a, b) => b.mediaAnual - a.mediaAnual);
            
            for (let i = 0; i < Math.max(backend.length, frontend.length); i++) {
                const backendTermo = dadosAno.find(d => backend.includes(d._id.termo) && 
                    dadosAno.filter(x => backend.includes(x._id.termo)).indexOf(d) === i);
                const frontendTermo = dadosAno.find(d => frontend.includes(d._id.termo) && 
                    dadosAno.filter(x => frontend.includes(x._id.termo)).indexOf(d) === i);
                
                tabela += `<tr><td>${i === 0 ? ano : ''}</td><td>${i + 1}º</td>`;
                tabela += `<td>${backendTermo ? `${backendTermo._id.termo} (${backendTermo.mediaAnual.toFixed(4)})` : '-'}</td>`;
                tabela += `<td>${frontendTermo ? `${frontendTermo._id.termo} (${frontendTermo.mediaAnual.toFixed(4)})` : '-'}</td></tr>`;
            }
        });
        tabela += '</tbody></table>';
        
        const html = gerarHtmlBase('Q4: Ranking Backend vs Frontend', 
            `<h2>Comparativo Ordinal ao Longo do Tempo</h2>${tabela}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;