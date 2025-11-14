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
        
        const termosForaCurso = ['angular', 'vue', 'docker', 'kubernetes', 'aws'];
        
        const pipeline = [
            { $match: { Termo: { $in: termosForaCurso } } },
            { $addFields: { 
                convertedDate: { $dateFromString: { dateString: '$Mensuracao', format: '%d/%m/%Y' } }
            }},
            { $addFields: {
                year: { $year: '$convertedDate' },
                month: { $month: '$convertedDate' }
            }},
            { $match: { month: 1 } },
            { $sort: { Termo: 1, year: 1 } }
        ];
        
        const results = await collection.aggregate(pipeline).toArray();
        
        const anos = [...new Set(results.map(r => r.year))].sort();
        const datasets = termosForaCurso.map(termo => {
            const data = anos.map(ano => {
                const doc = results.find(r => r.Termo === termo && r.year === ano);
                return doc ? doc.Participacao : 0;
            });
            return {
                label: termo,
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
                    plugins: { title: { display: true, text: 'Tecnologias Fora do Curso - Janeiro de Cada Ano' } }
                }
            });
        </script>`;
        
        const html = gerarHtmlBase('Q2: Tecnologias Fora do Curso', 
            `<h2>Desempenho Anual (Janeiro)</h2>${grafico}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;