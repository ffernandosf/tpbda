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
        
        const pipeline = [
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
        
        const crescimentos = [];
        const termos = [...new Set(results.map(r => r._id.termo))];
        const anos = [...new Set(results.map(r => r._id.year))].sort();
        
        anos.forEach((ano, index) => {
            if (index === 0) return;
            
            const anoAnterior = anos[index - 1];
            const crescimentosAno = [];
            
            termos.forEach(termo => {
                const dadoAtual = results.find(r => r._id.termo === termo && r._id.year === ano);
                const dadoAnterior = results.find(r => r._id.termo === termo && r._id.year === anoAnterior);
                
                if (dadoAtual && dadoAnterior && dadoAnterior.mediaAnual > 0) {
                    const multiplicador = dadoAtual.mediaAnual / dadoAnterior.mediaAnual;
                    crescimentosAno.push({ termo, multiplicador, ano });
                }
            });
            
            crescimentosAno.sort((a, b) => b.multiplicador - a.multiplicador);
            crescimentos.push(...crescimentosAno.slice(0, 3));
        });
        
        let tabela = '<table><thead><tr><th>Ano</th><th>Posição</th><th>Termo</th><th>Multiplicador</th></tr></thead><tbody>';
        
        anos.slice(1).forEach(ano => {
            const podiumAno = crescimentos.filter(c => c.ano === ano).slice(0, 3);
            podiumAno.forEach((item, index) => {
                const posicao = ['🥇', '🥈', '🥉'][index];
                tabela += `<tr><td>${index === 0 ? ano : ''}</td><td>${posicao}</td><td>${item.termo}</td><td>${item.multiplicador.toFixed(2)}x</td></tr>`;
            });
        });
        tabela += '</tbody></table>';
        
        const html = gerarHtmlBase('Q8: Termos do Ano', 
            `<h2>Podium Anual - Maior Crescimento</h2>${tabela}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;