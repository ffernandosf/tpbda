# Sistema de Análise de Tecnologias TI

Este projeto implementa um sistema completo de análise de dados de tecnologias usando Node.js, Express e MongoDB.

## Pré-requisitos

1. **MongoDB** instalado e rodando na porta padrão (27017)
2. **Node.js** instalado
3. Dependências instaladas: `npm install`

## Como usar

### 1. Importar os dados

Primeiro, importe os dados JSON para o MongoDB:

```bash
node importar-dados.js
```

### 2. Executar o servidor

```bash
node servidor-completo.js
```

### 3. Acessar as análises

Abra o navegador em `http://localhost:3000` e navegue pelas questões:

- **Q1**: Desempenho mensal das tecnologias do curso (2015-2024)
- **Q2**: Tecnologias fora do curso - primeiro mês de cada ano
- **Q3**: Comparativo de tecnologias concorrentes
- **Q4**: Ranking Backend vs Frontend
- **Q5**: Somatório Backend vs Frontend
- **Q6**: Comparativo de bancos de dados
- **Q7**: Análise por categorias (Top 80)
- **Q8**: Termos do ano - maior crescimento

## Estrutura das Consultas

### Q1: Tecnologias do Curso
- **Termos**: python, javascript, java, react, nodejs, mongodb, express
- **Período**: 2015-2024 (mensal)
- **Saída**: Tabela HTML

### Q2: Tecnologias Fora do Curso
- **Termos**: angular, vue, docker, kubernetes, aws
- **Período**: Janeiro de cada ano
- **Saída**: Gráfico de linha

### Q3: Comparativo Concorrentes
- **Grupos**:
  - Frameworks JS: react, angular, vue
  - Bancos NoSQL: mongodb, redis, cassandra
  - Linguagens Backend: python, java, nodejs
- **Saída**: Tabela com média anual

### Q4: Backend vs Frontend Ranking
- **Backend**: python, java, nodejs, php, ruby
- **Frontend**: javascript, react, angular, vue, css
- **Saída**: Ranking ordinal por ano

### Q5: Somatório Backend vs Frontend
- **Análise**: Soma total de participação por categoria
- **Saída**: Gráfico comparativo

### Q6: Bancos de Dados
- **Termos**: mysql, postgresql, mongodb, redis, sqlite
- **Saída**: Gráfico de evolução temporal

### Q7: Categorização
- **Processo**: 
  1. Seleciona top 80 termos
  2. Categoriza manualmente
  3. Cria coleção auxiliar
  4. Analisa participação por categoria
- **Saída**: Tabela com explicação dos critérios

### Q8: Termos do Ano
- **Análise**: Maior multiplicador de crescimento ano a ano
- **Saída**: Podium anual (🥇🥈🥉)

## Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **MongoDB**: Banco de dados NoSQL
- **Chart.js**: Biblioteca de gráficos
- **HTML/CSS**: Interface web

## Estrutura do Banco

- **Database**: `termosTI`
- **Collection Principal**: `TermosMaisUsados`
- **Collection Auxiliar**: `TermosCategorias` (criada automaticamente na Q7)

### Formato dos Documentos

```json
{
  "Termo": "python",
  "Mensuracao": "01/01/2015",
  "Participacao": 2.5
}
```

## Consultas MongoDB Principais

### Conversão de Data
```javascript
{
  $addFields: { 
    convertedDate: { 
      $dateFromString: { 
        dateString: '$Mensuracao', 
        format: '%d/%m/%Y' 
      } 
    }
  }
}
```

### Agrupamento por Ano
```javascript
{
  $group: {
    _id: { termo: '$Termo', year: { $year: '$convertedDate' } },
    mediaAnual: { $avg: '$Participacao' }
  }
}
```

### Filtro por Período
```javascript
{
  $match: { 
    convertedDate: { 
      $gte: new Date('2015-01-01'), 
      $lte: new Date('2024-12-31') 
    }
  }
}
```

## Troubleshooting

1. **Erro de conexão MongoDB**: Verifique se o MongoDB está rodando
2. **Dados não aparecem**: Execute o script de importação primeiro
3. **Erro de formato de data**: Verifique se o MongoDB é versão 3.6+
4. **Performance lenta**: Os índices são criados automaticamente na importação