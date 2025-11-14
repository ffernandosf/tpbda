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
                convertedDate: { $dateFromString: { dateString: '$Mensuracao', format: '%d/%m/%Y' } },
                categoria: { $cond: { if: { $in: ['$Termo', backend] }, then: 'Backend', else: 'Frontend' } }
            }},
            { $addFields: { year: { $year: '$convertedDate' } }},
            { $group: {
                _id: { categoria: '$categoria', year: '$year' },
                totalParticipacao: { $sum: '$Participacao' }
            }},
            { $sort: { '_id.year': 1, '_id.categoria': 1 } }
        ];
        
        const results = await collection.aggregate(pipeline).toArray();
        
        const anos = [...new Set(results.map(r => r._id.year))].sort();
        const backendData = anos.map(ano => {
            const doc = results.find(r => r._id.categoria === 'Backend' && r._id.year === ano);
            return doc ? doc.totalParticipacao : 0;
        });
        const frontendData = anos.map(ano => {
            const doc = results.find(r => r._id.categoria === 'Frontend' && r._id.year === ano);
            return doc ? doc.totalParticipacao : 0;
        });
        
        const grafico = `
        <canvas id="chart" width="800" height="400"></canvas>
        <script>
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(anos)},
                    datasets: [
                        { label: 'Backend', data: ${JSON.stringify(backendData)}, borderColor: 'blue', fill: false },
                        { label: 'Frontend', data: ${JSON.stringify(frontendData)}, borderColor: 'red', fill: false }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: { title: { display: true, text: 'Backend vs Frontend - Participação Total' } }
                }
            });
        </script>`;
        
        const html = gerarHtmlBase('Q5: Backend vs Frontend Total', 
            `<h2>Somatório de Participação ao Longo do Tempo</h2>${grafico}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;