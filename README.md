# FLAMMA — Landing page

Landing page da consultoria FLAMMA, com o formulário do sorteio salvando as inscrições numa planilha do Google Sheets.

## Estrutura

```
index.html                 página
styles.css                 estilos (cores da marca em :root)
script.js                  animações + envio do formulário (configure SHEETS_URL)
assets/                    logo, fotos do time, logos dos clientes e produtos (otimizados em .webp)
google-apps-script/Code.gs código que liga o formulário à planilha
```

Para ver localmente, basta abrir o `index.html` no navegador.

## Ligar o sorteio ao Google Sheets

1. Crie uma planilha nova no Google Sheets (ex.: "Sorteio FLAMMA").
2. Na planilha, vá em **Extensões → Apps Script**.
3. Apague o conteúdo do editor, cole todo o conteúdo de [google-apps-script/Code.gs](google-apps-script/Code.gs) e salve.
4. Clique em **Implantar → Nova implantação**.
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar**, autorize o acesso com sua conta Google e copie a **URL do app da Web** (termina em `/exec`).
6. Abra [script.js](script.js) e cole a URL na primeira linha de configuração:
   ```js
   const SHEETS_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
   ```
7. Teste: preencha o formulário no site. Uma aba **Inscrições** aparece na planilha com as colunas
   Data/Hora · Nome completo · WhatsApp · Instagram · Curso · Aceite.

> Se alterar o `Code.gs` depois, publique de novo em **Implantar → Gerenciar implantações → Editar → Nova versão** (a URL continua a mesma).

Inscrições com o mesmo WhatsApp não são duplicadas.

### Sortear o vencedor

Ao reabrir a planilha aparece o menu **FLAMMA → Sortear vencedor**. Ele escolhe uma inscrição aleatória, mostra nome/WhatsApp/Instagram e destaca a linha em rosa.

## Publicar o site

É um site estático, então funciona em qualquer hospedagem gratuita:

- **GitHub Pages:** suba o repositório e ative em *Settings → Pages → Branch: main / root*.
- **Netlify / Vercel:** arraste a pasta do projeto no painel.
