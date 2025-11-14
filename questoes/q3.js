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
        
        const grupos = {
            'Frameworks JS': ['react', 'angular', 'vue'],
            'Bancos NoSQL': ['mongodb', 'redis', 'cassandra'],
            'Linguagens Backend': ['python', 'java', 'nodejs']
        };
        
        const todosTermos = Object.values(grupos).flat();
        
        const pipeline = [
            { $match: { Termo: { $in: todosTermos } } },
            { $addFields: { 
                convertedDate: { $dateFromString: { dateString: '$Mensuracao', format: '%d/%m/%Y' } }
            }},
            { $addFields: { year: { $year: '$convertedDate' } }},
            { $group: {
                _id: { termo: '$Termo', year: '$year' },
                mediaAnual: { $avg: '$Participacao' }
            }},
            { $sort: { '_id.termo': 1, '_id.year': 1 } }
        ];
        
        const results = await collection.aggregate(pipeline).toArray();
        
        let tabela = '<table><thead><tr><th>Categoria</th><th>Tecnologia</th>';
        const anos = [...new Set(results.map(r => r._id.year))].sort();
        anos.forEach(ano => tabela += `<th>${ano}</th>`);
        tabela += '</tr></thead><tbody>';
        
        Object.entries(grupos).forEach(([categoria, termos]) => {
            termos.forEach(termo => {
                tabela += `<tr><td>${categoria}</td><td>${termo}</td>`;
                anos.forEach(ano => {
                    const doc = results.find(r => r._id.termo === termo && r._id.year === ano);
                    const valor = doc ? doc.mediaAnual.toFixed(4) : '-';
                    tabela += `<td>${valor}</td>`;
                });
                tabela += '</tr>';
            });
        });
        tabela += '</tbody></table>';
        
        const html = gerarHtmlBase('Q3: Comparativo de Tecnologias Concorrentes', 
            `<h2>Média Anual por Categoria</h2>${tabela}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;