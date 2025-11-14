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
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const auxCollection = db.collection('TermosCategorias');
        
        const top80 = await collection.aggregate([
            { $group: { _id: '$Termo', total: { $sum: '$Participacao' } } },
            { $sort: { total: -1 } },
            { $limit: 80 }
        ]).toArray();
        
        const categorias = {
            'Linguagens': ['python', 'javascript', 'java', 'php', 'ruby', 'go', 'rust', 'kotlin'],
            'Frameworks': ['react', 'angular', 'vue', 'django', 'spring', 'express'],
            'Bancos': ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite'],
            'DevOps': ['docker', 'kubernetes', 'aws', 'azure', 'jenkins'],
            'Frontend': ['css', 'html', 'sass', 'bootstrap', 'jquery'],
            'Mobile': ['android', 'ios', 'react-native', 'flutter', 'xamarin']
        };
        
        const termosCategorizados = top80.map(termo => {
            let categoria = 'Outros';
            for (const [cat, termos] of Object.entries(categorias)) {
                if (termos.includes(termo._id.toLowerCase())) {
                    categoria = cat;
                    break;
                }
            }
            return { termo: termo._id, categoria, total: termo.total };
        });
        
        await auxCollection.deleteMany({});
        await auxCollection.insertMany(termosCategorizados);
        
        const pipeline = [
            { $match: { Termo: { $in: top80.map(t => t._id) } } },
            { $addFields: { 
                convertedDate: { $dateFromString: { dateString: '$Mensuracao', format: '%d/%m/%Y' } }
            }},
            { $addFields: { year: { $year: '$convertedDate' } }},
            { $lookup: {
                from: 'TermosCategorias',
                localField: 'Termo',
                foreignField: 'termo',
                as: 'catInfo'
            }},
            { $unwind: '$catInfo' },
            { $group: {
                _id: { categoria: '$catInfo.categoria', year: '$year' },
                totalParticipacao: { $sum: '$Participacao' }
            }},
            { $sort: { '_id.categoria': 1, '_id.year': 1 } }
        ];
        
        const results = await collection.aggregate(pipeline).toArray();
        
        let explicacao = `
        <h3>Critério de Categorização</h3>
        <p>Os 80 termos mais presentes foram categorizados em:</p>
        <ul>
            <li><strong>Linguagens:</strong> Linguagens de programação</li>
            <li><strong>Frameworks:</strong> Frameworks e bibliotecas</li>
            <li><strong>Bancos:</strong> Sistemas de banco de dados</li>
            <li><strong>DevOps:</strong> Ferramentas de desenvolvimento e operações</li>
            <li><strong>Frontend:</strong> Tecnologias de interface</li>
            <li><strong>Mobile:</strong> Desenvolvimento mobile</li>
            <li><strong>Outros:</strong> Demais tecnologias</li>
        </ul>`;
        
        const categoriasList = [...new Set(results.map(r => r._id.categoria))];
        const anos = [...new Set(results.map(r => r._id.year))].sort();
        
        let tabela = '<table><thead><tr><th>Categoria</th>';
        anos.forEach(ano => tabela += `<th>${ano}</th>`);
        tabela += '</tr></thead><tbody>';
        
        categoriasList.forEach(categoria => {
            tabela += `<tr><td>${categoria}</td>`;
            anos.forEach(ano => {
                const doc = results.find(r => r._id.categoria === categoria && r._id.year === ano);
                const valor = doc ? doc.totalParticipacao.toFixed(2) : '-';
                tabela += `<td>${valor}</td>`;
            });
            tabela += '</tr>';
        });
        tabela += '</tbody></table>';
        
        const html = gerarHtmlBase('Q7: Análise por Categorias', 
            `<h2>Top 80 Termos Categorizados</h2>${explicacao}${tabela}`);
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;