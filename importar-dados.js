const { MongoClient } = require('mongodb');
const fs = require('fs');

async function importarDados() {
    const uri = "mongodb://127.0.0.1:27017/";
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Conectado ao MongoDB');
        
        const db = client.db('termosTI');
        const collection = db.collection('TermosMaisUsados');
        
        // Ler arquivo JSON
        const dadosRaw = JSON.parse(fs.readFileSync('termosTi.TermosMaisUsados.json', 'utf8'));
        
        // Limpar campos $oid e outros campos MongoDB específicos
        const dados = dadosRaw.map(doc => {
            const cleanDoc = { ...doc };
            if (cleanDoc._id && cleanDoc._id.$oid) {
                delete cleanDoc._id;
            }
            return cleanDoc;
        });
        
        // Limpar coleção existente
        await collection.deleteMany({});
        console.log('Coleção limpa');
        
        // Inserir dados
        const resultado = await collection.insertMany(dados);
        console.log(`${resultado.insertedCount} documentos inseridos`);
        
        // Criar índices para melhor performance
        await collection.createIndex({ "Termo": 1 });
        await collection.createIndex({ "Mensuracao": 1 });
        console.log('Índices criados');
        
        // Verificar alguns dados
        const count = await collection.countDocuments();
        console.log(`Total de documentos: ${count}`);
        
        const sample = await collection.findOne();
        console.log('Exemplo de documento:', sample);
        
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await client.close();
        console.log('Conexão fechada');
    }
}

importarDados();