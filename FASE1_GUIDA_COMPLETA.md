# 🚀 Budget Familiare Pro - FASE 1
## Guida Completa Setup e Utilizzo

---

## 📦 PACCHETTO FASE 1 - Contenuto

✅ **File Inclusi:**
1. `index-pro-phase1.html` - App principale
2. `app-pro.js` - JavaScript completo (1427 righe)
3. `manifest.json` - Configurazione PWA
4. `service-worker.js` - Service Worker per offline

✅ **Funzionalità Implementate:**
1. 🎯 **Budget Mensili** - Con alert e progress bar
2. 💰 **Obiettivi di Risparmio** - Tracker completi
3. 🔄 **Transazioni Ricorrenti** - Automatiche
4. 🌙 **Tema Scuro** - Toggle e salvataggio preferenza
5. 📱 **PWA** - Installabile come app nativa

---

## 🔧 SETUP RAPIDO (5 minuti)

### STEP 1: Upload su GitHub

**Opzione A - Via Web (consigliata):**
1. Vai su: https://github.com/giannigrespan/family-budget
2. Clicca **"Add file"** → **"Upload files"**
3. Trascina questi file:
   - `index-pro-phase1.html`
   - `app-pro.js`
   - `manifest.json`
   - `service-worker.js`
   - `vercel.json` (già esistente)
4. **Commit changes** ✅

**Opzione B - Via Git Locale:**
```bash
git add index-pro-phase1.html app-pro.js manifest.json service-worker.js
git commit -m "Phase 1: Budget, Goals, Recurring, Dark Mode, PWA"
git push origin main
```

### STEP 2: Update Vercel (automatico)

Se hai già collegato GitHub a Vercel:
- Vercel rileva il push automaticamente
- Deploy automatico in ~30 secondi ✅

Se NON hai collegato:
1. Vai su: https://vercel.com/new
2. **Import Git Repository**
3. Seleziona `giannigrespan/family-budget`
4. **Deploy** ✅

### STEP 3: Configurazione Vercel

Nel file `vercel.json`, aggiungi il redirect per usare il nuovo file:

```json
{
  "version": 2,
  "name": "family-budget",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index-pro-phase1.html"
    }
  ]
}
```

---

## 🎯 GUIDA UTILIZZO

### 1️⃣ BUDGET MENSILI

**Cosa sono:**
Limiti di spesa per categoria con alert automatici.

**Come usare:**
1. Vai su tab **"🎯 Budget"**
2. Clicca **"➕ Aggiungi Budget"**
3. Seleziona categoria (es. Alimentari)
4. Imposta limite (es. €500)
5. Attiva alert (se superi il 90%)
6. **Salva** ✅

**Visualizzazione:**
- Progress bar per ogni categoria
- Percentuale spesa
- Importo rimanente
- Alert automatici nella dashboard

**Alert:**
- ⚠️ Giallo = 90-99% del budget
- 🚨 Rosso = 100%+ del budget (superato!)

---

### 2️⃣ OBIETTIVI DI RISPARMIO

**Cosa sono:**
Target di risparmio con tracking e previsioni.

**Come usare:**
1. Vai su tab **"💰 Obiettivi"**
2. Clicca **"➕ Nuovo Obiettivo"**
3. Compila:
   - Nome: "Vacanze Estate"
   - Target: €3000
   - Corrente: €500 (quanto hai già)
   - Data: 2025-06-01
   - Icona: 🏖️
4. **Salva** ✅

**Funzioni:**
- Progress bar con percentuale
- Calcolo automatico mancante
- Giorni rimanenti
- **Necessario/mese** automatico
- Aggiungi importo quando risparmi

**Dashboard:**
I primi 3 obiettivi attivi appaiono nella dashboard

---

### 3️⃣ TRANSAZIONI RICORRENTI

**Cosa sono:**
Transazioni che si ripetono automaticamente.

**Come usare:**
1. Vai su tab **"💳 Transazioni"**
2. Compila form normale
3. ✅ Seleziona **"🔄 Transazione Ricorrente"**
4. Scegli frequenza:
   - 📅 Giornaliera
   - 📆 Settimanale
   - 🗓️ Mensile (default)
   - 📊 Annuale
5. Imposta "Prossima Occorrenza"
6. **Aggiungi** ✅

**Automatismi:**
- Ogni volta che apri l'app, controlla le date
- Se è il giorno della ricorrenza → crea automaticamente
- Aggiorna la prossima occorrenza
- Notifica: "X transazioni ricorrenti create!"

**Gestione:**
- Tab **"🔄 Ricorrenti"**: visualizza tutte
- ✅ Attiva/disattiva
- 🗑️ Elimina

**Esempi:**
- Stipendio: Mensile, giorno 1
- Affitto: Mensile, giorno 5
- Abbonamento Netflix: Mensile
- Bollo auto: Annuale

---

### 4️⃣ TEMA SCURO

**Come attivare:**
1. Clicca icona 🌙 in alto a destra
2. Toggle automatico tra:
   - ☀️ Tema Chiaro
   - 🌙 Tema Scuro
3. Preferenza salvata automaticamente

**Caratteristiche:**
- Transizione smooth 0.3s
- Tutti i colori adattati
- Grafici leggibili in entrambi
- Salvataggio automatico

---

### 5️⃣ PWA (Progressive Web App)

**Cos'è:**
L'app può essere installata come app nativa sul telefono!

**Come installare:**

**Su iPhone/iPad:**
1. Apri l'app in Safari
2. Tocca l'icona "Condividi" 📤
3. **"Aggiungi a Home"**
4. Icona apparirà nella home! 📱

**Su Android:**
1. Apri l'app in Chrome
2. Clicca **"📱 Installa"** (o menu → Installa app)
3. Conferma installazione
4. Icona nella home! 📱

**Su Desktop:**
1. Vedrai "📱 Installa" in alto
2. Clicca e conferma
3. App nel launcher/menu start!

**Vantaggi:**
- Apertura veloce come app nativa
- Icona personalizzata
- Schermo intero (no barra browser)
- Notifiche push (fase 2)

---

## 📊 DASHBOARD SPIEGATA

### Summary Cards (in alto):

1. **💚 Entrate Mensili**
   - Totale entrate mese corrente
   - Confronto vs mese scorso

2. **❤️ Spese Mensili**
   - Totale spese mese corrente
   - Confronto vs mese scorso

3. **💙 Bilancio Mensile**
   - Entrate - Spese
   - Confronto vs mese scorso

4. **💜 Tasso Risparmio**
   - Percentuale risparmiata
   - Obiettivo: 20%

### Budget Alerts:
- Appaiono quando superi il 90% di un budget
- Colore giallo/rosso a seconda gravità

### Obiettivi Attivi:
- Primi 3 obiettivi con progress bar
- Quick view nella dashboard

### Grafici:

1. **📊 Spese per Categoria** (Doughnut)
   - Solo spese mese corrente
   - Colori per categoria
   - Click per dettagli

2. **📈 Trend Ultimi 6 Mesi** (Line)
   - Confronto entrate vs spese
   - Ultimi 6 mesi
   - Identifica trend

3. **🔮 Previsione Budget** (Line con forecast)
   - Storico + previsione futura
   - Linea tratteggiata = previsto
   - Configurabile (3-12 mesi storico, 1-6 mesi futuri)

---

## 🎨 PERSONALIZZAZIONI

### Categorie:

**Entrate:**
- 💼 Stipendio
- 💻 Freelance
- 🏖️ Affitto Torpè
- 📈 Investimenti
- 💰 Altro

**Spese:**
- 🏠 Casa
- 🛒 Alimentari
- 🚗 Trasporti
- 💡 Utenze
- ⚕️ Salute
- 📚 Istruzione
- 🎬 Intrattenimento
- 🍽️ Ristorazione
- 👔 Abbigliamento
- ✈️ Viaggi
- 🔧 Manutenzione Torpè
- 💼 Business
- 📦 Altro

**Modificare categorie:**
Apri `app-pro.js`, cerca:
```javascript
const INCOME_CATEGORIES = [
    { name: 'Stipendio', icon: '💼' },
    // Aggiungi qui
];
```

---

## 🔄 WORKFLOW COMPLETO

### Scenario: Uso Quotidiano

**Mattina:**
1. Apri app
2. Controlla alert budget (se presenti)
3. Ricorrenze create automaticamente (es. stipendio)

**Durante il giorno:**
1. Fai una spesa → Aggiungi transazione
2. Notifica immediata salvata
3. Budget aggiornato automaticamente
4. Alert se superi limite

**Sera:**
1. Revisionare spese giornata
2. Aggiornare obiettivi (se hai risparmiato)
3. Check progress budget

**Fine mese:**
1. Revisionare dashboard
2. Vedere confronto vs mese scorso
3. Aggiustare budget per mese prossimo
4. Controllare previsioni

---

## 💾 STORAGE & SINCRONIZZAZIONE

### Dati Locali (Browser Storage):
- Budgets
- Goals
- Recurring Transactions
- Theme preference

### Dati Cloud (Google Sheets via n8n):
- Transactions (entrate/spese)

**Backup Automatico:**
Tutti i dati sono al sicuro:
- Transazioni → Google Sheets
- Budget/Goals → Browser (backup possibile)

---

## 🆘 TROUBLESHOOTING

### "Budget alert non appaiono"
- Verifica di aver impostato "Alert" nel budget
- Controlla di aver superato il 90%
- Ricarica la pagina

### "Ricorrenze non create"
- Controlla che siano attive (✅)
- Verifica "Prossima Occorrenza"
- Deve essere <= oggi
- Ricarica per forzare check

### "Tema non si salva"
- Controlla localStorage browser
- Svuota cache se necessario
- F5 per ricaricare

### "PWA non installa"
- Su iPhone: usa SOLO Safari
- Su Android: usa Chrome
- Desktop: icona appare dopo 2-3 visite

### "Grafici non visualizzati"
- Controlla connessione (CDN Chart.js)
- Console (F12) per errori
- Ricarica pagina

---

## 📈 PROSSIMI STEP - FASE 2

Dopo aver testato la Fase 1, implementeremo:

1. **OCR Scontrini** 📸
   - Foto scontrino → dati estratti automaticamente
   
2. **AI Categorizzazione** 🤖
   - Suggerimento categoria intelligente
   
3. **Chatbot** 💬
   - "Quanto ho speso per ristoranti?"
   
4. **Consigli Personalizzati** 💡
   - AI analizza patterns e suggerisce risparmi
   
5. **Report PDF/Excel** 📄
   - Export automatici mensili

---

## ✅ CHECKLIST COMPLETA

- [ ] File caricati su GitHub
- [ ] Vercel collegato e deployed
- [ ] URL funzionante
- [ ] Test aggiunta transazione
- [ ] Test budget creato
- [ ] Test obiettivo creato
- [ ] Test transazione ricorrente
- [ ] Tema scuro funzionante
- [ ] PWA installata su telefono
- [ ] n8n workflow attivo
- [ ] Google Sheets sincronizzato

**Quando tutti ✅ = FASE 1 COMPLETA! 🎉**

---

## 🎯 CONTATTI & SUPPORTO

- **Repository**: https://github.com/giannigrespan/family-budget
- **Deploy URL**: [Il tuo URL Vercel]
- **n8n Workflow**: budget (ID: EeeesbLMddZBCrU9)

**Buon budget! 💰📊**
