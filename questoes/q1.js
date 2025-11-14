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
        
        const termos = ['javascript', 'java', 'react', 'nodejs', 'mongodb'];
        
        const pipeline = [
            { $match: { Termo: { $in: termos } } },
            { $addFields: { 
                convertedDate: { $dateFromString: { dateString: '$Mensuracao', format: '%d/%m/%Y' } }
            }},
            { $match: { 
                convertedDate: { 
                    $gte: new Date('2015-01-01'), 
                    $lte: new Date('2024-12-31') 
                }
            }},
            { $sort: { Termo: 1, convertedDate: 1 } }
        ];
        
        const results = await collection.aggregate(pipeline).toArray();
        
        const pivotData = {};
        const meses = new Set();
        
        results.forEach(doc => {
            const yearMonth = doc.convertedDate.toISOString().substring(0, 7);
            meses.add(yearMonth);
            
            if (!pivotData[doc.Termo]) pivotData[doc.Termo] = {};
            pivotData[doc.Termo][yearMonth] = doc.Participacao;
        });
        
        const mesesOrdenados = Array.from(meses).sort();
        
        let tabela = '<table><thead><tr><th>Termo</th>';
        mesesOrdenados.forEach(mes => tabela += `<th>${mes}</th>`);
        tabela += '</tr></thead><tbody>';
        
        termos.forEach(termo => {
            tabela += `<tr><th>${termo}</th>`;
            mesesOrdenados.forEach(mes => {
                const valor = pivotData[termo]?.[mes] ? pivotData[termo][mes].toFixed(4) : '-';
                tabela += `<td>${valor}</td>`;
            });
            tabela += '</tr>';
        });
        tabela += '</tbody></table>';
        
        const html = gerarHtmlBase('Q1: Desempenho Mensal das Tecnologias do Curso', 
            `<h2>Desempenho Mensal (2015-2024)</h2>${tabela}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;