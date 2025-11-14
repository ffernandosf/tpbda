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
        
        const bancos = ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite'];
        
        const pipeline = [
            { $match: { Termo: { $in: bancos } } },
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
        
        const anos = [...new Set(results.map(r => r._id.year))].sort();
        const datasets = bancos.map(banco => {
            const data = anos.map(ano => {
                const doc = results.find(r => r._id.termo === banco && r._id.year === ano);
                return doc ? doc.mediaAnual : 0;
            });
            return {
                label: banco,
                data: data,
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                fill: false
            };
        });
        
        const grafico = `
        <canvas id="chart" width="800" height="400"></canvas>
        <script>
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(anos)},
                    datasets: ${JSON.stringify(datasets)}
                },
                options: {
                    responsive: true,
                    plugins: { title: { display: true, text: 'Comparativo de Bancos de Dados' } }
                }
            });
        </script>`;
        
        const html = gerarHtmlBase('Q6: Bancos de Dados', 
            `<h2>Desempenho dos Bancos ao Longo do Tempo</h2>${grafico}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;