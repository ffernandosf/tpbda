const express = require('express');
const q1 = require('./questoes/q1');
const q2 = require('./questoes/q2');
const q3 = require('./questoes/q3');
const q4 = require('./questoes/q4');
const q5 = require('./questoes/q5');
const q6 = require('./questoes/q6');
const q7 = require('./questoes/q7');
const q8 = require('./questoes/q8');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Sistema de Análise de Tecnologias TI</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            h1 { color: #333; }
            .questoes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 40px 0; }
            .questao { padding: 20px; border: 2px solid #007bff; border-radius: 8px; text-decoration: none; color: #007bff; }
            .questao:hover { background-color: #f8f9fa; }
        </style>
    </head>
    <body>
        <h1>Sistema de Análise de Tecnologias TI</h1>
        <div class="questoes">
            <a href="/q1" class="questao"><h3>Q1</h3>Tecnologias do Curso</a>
            <a href="/q2" class="questao"><h3>Q2</h3>Tecnologias Fora do Curso</a>
            <a href="/q3" class="questao"><h3>Q3</h3>Comparativo Concorrentes</a>
            <a href="/q4" class="questao"><h3>Q4</h3>Backend vs Frontend</a>
            <a href="/q5" class="questao"><h3>Q5</h3>Somatório Backend vs Frontend</a>
            <a href="/q6" class="questao"><h3>Q6</h3>Bancos de Dados</a>
            <a href="/q7" class="questao"><h3>Q7</h3>Análise por Categorias</a>
            <a href="/q8" class="questao"><h3>Q8</h3>Termos do Ano</a>
        </div>
    </body>
    </html>`;
    res.send(html);
});

app.use('/q1', q1);
app.use('/q2', q2);
app.use('/q3', q3);
app.use('/q4', q4);
app.use('/q5', q5);
app.use('/q6', q6);
app.use('/q7', q7);
app.use('/q8', q8);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});