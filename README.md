# 💰 Family Budget - Gestione Budget Familiare

Applicazione web per la gestione del budget familiare con sincronizzazione Google Sheets tramite n8n.

## ✨ Caratteristiche

- 📊 Dashboard con riepilogo entrate/spese
- 💳 Gestione transazioni completa
- 📈 Previsione budget futura
- 🔄 Sincronizzazione automatica con Google Sheets
- 📱 Responsive design per mobile
- 🎨 Grafici interattivi con Chart.js

## 🚀 Deploy su Vercel

### Deploy Automatico (Git Integration)

1. Fai il push di questo progetto su GitHub
2. Vai su https://vercel.com/new
3. Importa il repository
4. Vercel farà il deploy automaticamente! ✅

### Deploy Manuale

1. Comprimi questa cartella
2. Vai su https://vercel.com/new
3. Trascina la cartella
4. Clicca Deploy

## 📋 Setup Prerequisiti

1. **Google Sheet** configurato con intestazioni
2. **Workflow n8n** attivo con URL webhook
3. URL webhook configurato in `index.html`

## 🔧 Configurazione

L'URL del webhook n8n è già configurato in `index.html`:

```javascript
const N8N_WEBHOOK_URL = 'https://n8n.srv1194161.hstgr.cloud/webhook/family-budget';
```

## 📱 Utilizzo

1. Apri l'app deployata su Vercel
2. Aggiungi transazioni (entrate/spese)
3. Visualizza grafici e previsioni
4. I dati vengono salvati automaticamente su Google Sheets

## 🛠️ Tecnologie

- HTML5 + JavaScript vanilla
- Tailwind CSS
- Chart.js
- n8n (workflow automation)
- Google Sheets (storage)
- Vercel (hosting)

## 📄 Licenza

MIT
