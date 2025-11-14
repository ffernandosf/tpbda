function gerarHtmlBase(titulo, conteudo) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .nav { margin: 20px 0; }
            .nav a { margin-right: 15px; text-decoration: none; color: #007bff; }
            .nav a:hover { text-decoration: underline; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
        <div class="nav">
            <a href="/">Home</a> | 
            <a href="/q1">Q1</a> | <a href="/q2">Q2</a> | <a href="/q3">Q3</a> | 
            <a href="/q4">Q4</a> | <a href="/q5">Q5</a> | <a href="/q6">Q6</a> | 
            <a href="/q7">Q7</a> | <a href="/q8">Q8</a>
        </div>
        ${conteudo}
    </body>
    </html>`;
}

module.exports = { gerarHtmlBase };