// ============================================
// BUDGET FAMILIARE PRO - PHASE 1
// Features: Budgets, Goals, Recurring, Dark Mode, PWA
// ============================================

// Configuration
const N8N_WEBHOOK_URL = 'https://n8n.srv1194161.hstgr.cloud/webhook/family-budget';
const USE_N8N_STORAGE = true;

// Categories
const INCOME_CATEGORIES = [
    { name: 'Stipendio', icon: '💼' },
    { name: 'Freelance', icon: '💻' },
    { name: 'Affitto Torpè', icon: '🏖️' },
    { name: 'Investimenti', icon: '📈' },
    { name: 'Altro', icon: '💰' }
];

const EXPENSE_CATEGORIES = [
    { name: 'Casa', icon: '🏠' },
    { name: 'Alimentari', icon: '🛒' },
    { name: 'Trasporti', icon: '🚗' },
    { name: 'Utenze', icon: '💡' },
    { name: 'Salute', icon: '⚕️' },
    { name: 'Istruzione', icon: '📚' },
    { name: 'Intrattenimento', icon: '🎬' },
    { name: 'Ristorazione', icon: '🍽️' },
    { name: 'Abbigliamento', icon: '👔' },
    { name: 'Viaggi', icon: '✈️' },
    { name: 'Manutenzione Torpè', icon: '🔧' },
    { name: 'Business', icon: '💼' },
    { name: 'Altro', icon: '📦' }
];

// State Management
let transactions = [];
let budgets = [];
let goals = [];
let recurringTransactions = [];
let chart = null;
let forecastChart = null;
let trendChart = null;
let currentTab = 'dashboard';
let deferredPrompt = null;

console.log('Budget Familiare Pro - Phase 1 Loading...');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('Initializing Budget Familiare Pro...');
    updateStorageIndicator();
    await loadAllData();
    setupEventListeners();
    updateCategorySelect();
    applyTheme();
    setupPWA();
    renderAll();
    setTodayDate();
    checkRecurringTransactions();
    console.log('✅ App initialized successfully');
}

// ============================================
// DATA LOADING & SAVING
// ============================================

async function loadAllData() {
    await loadData();
    await loadBudgets();
    await loadGoals();
    await loadRecurringTransactions();
}

async function loadData() {
    if (USE_N8N_STORAGE) {
        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation: 'load' })
            });
            
            if (!response.ok) throw new Error('Failed to load from n8n');
            
            const data = await response.json();
            // Filter out soft-deleted transactions
            transactions = (data.transactions || []).filter(t => !t.deleted);
        } catch (error) {
            console.error('Error loading transactions:', error);
            showNotification('Errore nel caricamento delle transazioni', 'error');
            transactions = [];
        }
    } else {
        try {
            const result = await window.storage.get('family-budget-transactions');
            if (result && result.value) {
                transactions = JSON.parse(result.value);
            }
        } catch (error) {
            console.log('No previous transactions found');
            transactions = [];
        }
    }
}

async function loadBudgets() {
    try {
        const result = await window.storage.get('family-budget-budgets');
        if (result && result.value) {
            budgets = JSON.parse(result.value);
        }
    } catch (error) {
        console.log('No budgets found');
        budgets = [];
    }
}

async function loadGoals() {
    try {
        const result = await window.storage.get('family-budget-goals');
        if (result && result.value) {
            goals = JSON.parse(result.value);
        }
    } catch (error) {
        console.log('No goals found');
        goals = [];
    }
}

async function loadRecurringTransactions() {
    try {
        const result = await window.storage.get('family-budget-recurring');
        if (result && result.value) {
            recurringTransactions = JSON.parse(result.value);
        }
    } catch (error) {
        console.log('No recurring transactions found');
        recurringTransactions = [];
    }
}

async function saveData() {
    if (USE_N8N_STORAGE) {
        return; // Handled per transaction
    } else {
        try {
            await window.storage.set('family-budget-transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error('Error saving data:', error);
            showNotification('Errore nel salvare i dati', 'error');
        }
    }
}

async function saveBudgets() {
    try {
        await window.storage.set('family-budget-budgets', JSON.stringify(budgets));
    } catch (error) {
        console.error('Error saving budgets:', error);
        showNotification('Errore nel salvare i budget', 'error');
    }
}

async function saveGoals() {
    try {
        await window.storage.set('family-budget-goals', JSON.stringify(goals));
    } catch (error) {
        console.error('Error saving goals:', error);
        showNotification('Errore nel salvare gli obiettivi', 'error');
    }
}

async function saveRecurringTransactions() {
    try {
        await window.storage.set('family-budget-recurring', JSON.stringify(recurringTransactions));
    } catch (error) {
        console.error('Error saving recurring:', error);
        showNotification('Errore nel salvare le ricorrenze', 'error');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    document.getElementById('transactionForm').addEventListener('submit', handleAddTransaction);
    document.getElementById('budgetForm').addEventListener('submit', handleAddBudget);
    document.getElementById('goalForm').addEventListener('submit', handleAddGoal);
    
    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', updateCategorySelect);
    });
    
    document.getElementById('filterMonth').addEventListener('change', renderTransactionsList);
    
    document.getElementById('isRecurring').addEventListener('change', (e) => {
        document.getElementById('recurringOptions').classList.toggle('hidden', !e.target.checked);
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ============================================
// TRANSACTIONS
// ============================================

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('nextOccurrence').value = today;
}

function updateCategorySelect() {
    const type = document.querySelector('input[name="type"]:checked').value;
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const select = document.getElementById('category');
    const budgetSelect = document.getElementById('budgetCategory');
    
    select.innerHTML = categories.map(cat => 
        `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`
    ).join('');
    
    if (budgetSelect) {
        budgetSelect.innerHTML = EXPENSE_CATEGORIES.map(cat => 
            `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`
        ).join('');
    }
}

async function handleAddTransaction(e) {
    e.preventDefault();
    
    const transaction = {
        id: Date.now(),
        type: document.querySelector('input[name="type"]:checked').value,
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    // Handle recurring
    const isRecurring = document.getElementById('isRecurring').checked;
    if (isRecurring) {
        const recurring = {
            id: Date.now(),
            ...transaction,
            frequency: document.getElementById('recurringFrequency').value,
            nextOccurrence: document.getElementById('nextOccurrence').value,
            active: true
        };
        recurringTransactions.push(recurring);
        await saveRecurringTransactions();
        showNotification('Transazione ricorrente creata! ✅', 'success');
    }

    if (USE_N8N_STORAGE) {
        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'save',
                    transaction: transaction
                })
            });
            
            if (!response.ok) throw new Error('Failed to save');
            
            transactions.unshift(transaction);
            showNotification('Transazione aggiunta! ✅', 'success');
        } catch (error) {
            console.error('Error saving:', error);
            showNotification('Errore nel salvare la transazione', 'error');
            return;
        }
    } else {
        transactions.unshift(transaction);
        await saveData();
        showNotification('Transazione aggiunta! ✅', 'success');
    }
    
    document.getElementById('transactionForm').reset();
    setTodayDate();
    updateCategorySelect();
    renderAll();
    checkBudgets();
}

async function deleteTransaction(id) {
    if (confirm('Sei sicuro di voler nascondere questa transazione? (Puoi eliminarla manualmente da Google Sheets)')) {
        // Just hide locally, don't call n8n
        transactions = transactions.filter(t => t.id !== id);
        renderAll();
        showNotification('⚠️ Transazione nascosta dall\'app. Per eliminarla definitivamente, cancellala manualmente da Google Sheets.', 'warning');
    }
}

// ============================================
// BUDGETS
// ============================================

function showAddBudgetModal() {
    updateCategorySelect(); // Update budget category select
    document.getElementById('budgetModal').classList.add('active');
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
    document.getElementById('budgetForm').reset();
}

async function handleAddBudget(e) {
    e.preventDefault();
    
    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);
    const alert = document.getElementById('budgetAlert').checked;
    
    // Check if budget already exists for this category
    const existingIndex = budgets.findIndex(b => b.category === category);
    
    const budget = {
        id: existingIndex >= 0 ? budgets[existingIndex].id : Date.now(),
        category,
        limit,
        alert
    };
    
    if (existingIndex >= 0) {
        budgets[existingIndex] = budget;
        showNotification('Budget aggiornato! ✅', 'success');
    } else {
        budgets.push(budget);
        showNotification('Budget creato! ✅', 'success');
    }
    
    await saveBudgets();
    closeBudgetModal();
    renderAll();
    checkBudgets();
}

async function deleteBudget(id) {
    if (confirm('Sei sicuro di voler eliminare questo budget?')) {
        budgets = budgets.filter(b => b.id !== id);
        await saveBudgets();
        renderAll();
        showNotification('Budget eliminato', 'info');
    }
}

function checkBudgets() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = {};
    
    transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .forEach(t => {
            monthlyExpenses[t.category] = (monthlyExpenses[t.category] || 0) + t.amount;
        });
    
    const alerts = [];
    budgets.forEach(budget => {
        const spent = monthlyExpenses[budget.category] || 0;
        const percentage = (spent / budget.limit) * 100;
        
        if (budget.alert && percentage >= 90) {
            alerts.push({
                category: budget.category,
                spent,
                limit: budget.limit,
                percentage
            });
        }
    });
    
    renderBudgetAlerts(alerts);
}

function renderBudgetAlerts(alerts) {
    const container = document.getElementById('budgetAlerts');
    
    if (alerts.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = alerts.map(alert => {
        const color = alert.percentage >= 100 ? 'red' : 'yellow';
        const icon = alert.percentage >= 100 ? '🚨' : '⚠️';
        
        return `
            <div class="bg-${color}-100 border-l-4 border-${color}-500 p-4 rounded budget-alert">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${icon}</span>
                    <div class="flex-1">
                        <p class="font-bold text-${color}-800">
                            ${alert.percentage >= 100 ? 'Budget Superato!' : 'Attenzione al Budget!'}
                        </p>
                        <p class="text-sm text-${color}-700">
                            ${alert.category}: €${alert.spent.toFixed(2)} di €${alert.limit.toFixed(2)} (${alert.percentage.toFixed(0)}%)
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderBudgetsList() {
    const container = document.getElementById('budgetsList');
    
    if (budgets.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nessun budget impostato. Aggiungi il primo budget!</p>';
        return;
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = {};
    
    transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .forEach(t => {
            monthlyExpenses[t.category] = (monthlyExpenses[t.category] || 0) + t.amount;
        });
    
    container.innerHTML = budgets.map(budget => {
        const spent = monthlyExpenses[budget.category] || 0;
        const percentage = Math.min((spent / budget.limit) * 100, 100);
        const remaining = Math.max(budget.limit - spent, 0);
        const isOver = spent > budget.limit;
        
        const category = EXPENSE_CATEGORIES.find(c => c.name === budget.category);
        const icon = category ? category.icon : '📦';
        
        const progressColor = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
        
        return `
            <div class="card p-4 rounded-lg">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">${icon}</span>
                        <div>
                            <h3 class="font-bold text-lg">${budget.category}</h3>
                            <p class="text-sm" style="color: var(--text-secondary)">
                                €${spent.toFixed(2)} / €${budget.limit.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <button onclick="deleteBudget(${budget.id})" class="text-red-500 hover:text-red-700 p-2">
                        🗑️
                    </button>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div class="progress-bar ${progressColor}" style="width: ${percentage}%"></div>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="${isOver ? 'text-red-600 font-bold' : 'text-gray-600'}">
                        ${isOver ? 'Superato di' : 'Rimanente'}: €${Math.abs(remaining).toFixed(2)}
                    </span>
                    <span class="text-gray-600">${percentage.toFixed(0)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// GOALS
// ============================================

function showAddGoalModal() {
    document.getElementById('goalModal').classList.add('active');
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('active');
    document.getElementById('goalForm').reset();
}

async function handleAddGoal(e) {
    e.preventDefault();
    
    const goal = {
        id: Date.now(),
        name: document.getElementById('goalName').value,
        target: parseFloat(document.getElementById('goalTarget').value),
        current: parseFloat(document.getElementById('goalCurrent').value) || 0,
        date: document.getElementById('goalDate').value,
        icon: document.getElementById('goalIcon').value,
        createdAt: new Date().toISOString()
    };
    
    goals.push(goal);
    await saveGoals();
    closeGoalModal();
    renderAll();
    showNotification('Obiettivo creato! 🎯', 'success');
}

async function updateGoalProgress(id, amount) {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.current = Math.min(parseFloat(amount), goal.target);
        await saveGoals();
        renderAll();
        
        if (goal.current >= goal.target) {
            showNotification(`🎉 Obiettivo "${goal.name}" raggiunto!`, 'success');
        }
    }
}

async function deleteGoal(id) {
    if (confirm('Sei sicuro di voler eliminare questo obiettivo?')) {
        goals = goals.filter(g => g.id !== id);
        await saveGoals();
        renderAll();
        showNotification('Obiettivo eliminato', 'info');
    }
}

function renderGoalsList() {
    const container = document.getElementById('goalsList');
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nessun obiettivo. Crea il tuo primo obiettivo di risparmio!</p>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const percentage = Math.min((goal.current / goal.target) * 100, 100);
        const remaining = goal.target - goal.current;
        const daysLeft = Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24));
        const monthlyNeeded = remaining / Math.max(daysLeft / 30, 1);
        
        const progressColor = percentage >= 100 ? 'bg-green-500' : percentage >= 75 ? 'bg-blue-500' : 'bg-purple-500';
        
        return `
            <div class="card p-6 rounded-lg">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-4xl">${goal.icon}</span>
                        <div>
                            <h3 class="font-bold text-xl">${goal.name}</h3>
                            <p class="text-sm" style="color: var(--text-secondary)">
                                Scadenza: ${new Date(goal.date).toLocaleDateString('it-IT')}
                            </p>
                        </div>
                    </div>
                    <button onclick="deleteGoal(${goal.id})" class="text-red-500 hover:text-red-700 p-2">
                        🗑️
                    </button>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between mb-2">
                        <span class="font-bold">€${goal.current.toFixed(2)}</span>
                        <span class="text-gray-600">€${goal.target.toFixed(2)}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div class="progress-bar ${progressColor} rounded-full" style="width: ${percentage}%"></div>
                    </div>
                    <div class="flex justify-between text-sm mt-2" style="color: var(--text-secondary)">
                        <span>${percentage.toFixed(0)}% completato</span>
                        <span>${daysLeft > 0 ? `${daysLeft} giorni rimanenti` : 'Scaduto'}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p style="color: var(--text-secondary)">Mancante</p>
                        <p class="font-bold text-lg">€${remaining.toFixed(2)}</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p style="color: var(--text-secondary)">Necessario/mese</p>
                        <p class="font-bold text-lg">€${monthlyNeeded.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <input type="number" id="goalAmount${goal.id}" step="0.01" placeholder="Aggiungi importo" class="flex-1 px-3 py-2 border rounded-lg text-sm">
                    <button onclick="updateGoalProgress(${goal.id}, document.getElementById('goalAmount${goal.id}').value)" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">
                        💰 Aggiungi
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderGoalsProgress() {
    const container = document.getElementById('goalsProgress');
    
    if (goals.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const activeGoals = goals.filter(g => {
        const daysLeft = Math.ceil((new Date(g.date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && g.current < g.target;
    }).slice(0, 3);
    
    if (activeGoals.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div class="card rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold mb-4">🎯 Obiettivi Attivi</h3>
            <div class="space-y-3">
                ${activeGoals.map(goal => {
                    const percentage = Math.min((goal.current / goal.target) * 100, 100);
                    return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span>${goal.icon} ${goal.name}</span>
                                <span class="font-bold">${percentage.toFixed(0)}%</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div class="progress-bar bg-purple-500 rounded-full" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}


// ============================================
// RECURRING TRANSACTIONS
// ============================================

async function checkRecurringTransactions() {
    const today = new Date().toISOString().split('T')[0];
    let created = 0;
    
    for (const recurring of recurringTransactions) {
        if (!recurring.active) continue;
        if (recurring.nextOccurrence > today) continue;
        
        // Create transaction
        const transaction = {
            id: Date.now() + created,
            type: recurring.type,
            description: `${recurring.description} (Ricorrente)`,
            amount: recurring.amount,
            category: recurring.category,
            date: today
        };
        
        if (USE_N8N_STORAGE) {
            try {
                await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        operation: 'save',
                        transaction: transaction
                    })
                });
                transactions.unshift(transaction);
                created++;
            } catch (error) {
                console.error('Error creating recurring transaction:', error);
            }
        } else {
            transactions.unshift(transaction);
            created++;
        }
        
        // Update next occurrence
        const nextDate = calculateNextOccurrence(recurring.nextOccurrence, recurring.frequency);
        recurring.nextOccurrence = nextDate;
    }
    
    if (created > 0) {
        await saveRecurringTransactions();
        if (!USE_N8N_STORAGE) await saveData();
        showNotification(`${created} transazione/i ricorrente/i create! 🔄`, 'success');
        renderAll();
    }
}

function calculateNextOccurrence(currentDate, frequency) {
    const date = new Date(currentDate);
    
    switch(frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    
    return date.toISOString().split('T')[0];
}

async function toggleRecurring(id) {
    const recurring = recurringTransactions.find(r => r.id === id);
    if (recurring) {
        recurring.active = !recurring.active;
        await saveRecurringTransactions();
        renderRecurringList();
        showNotification(recurring.active ? 'Ricorrenza attivata' : 'Ricorrenza disattivata', 'info');
    }
}

async function deleteRecurring(id) {
    if (confirm('Sei sicuro di voler eliminare questa ricorrenza?')) {
        recurringTransactions = recurringTransactions.filter(r => r.id !== id);
        await saveRecurringTransactions();
        renderRecurringList();
        showNotification('Ricorrenza eliminata', 'info');
    }
}

function renderRecurringList() {
    const container = document.getElementById('recurringList');
    
    if (recurringTransactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nessuna transazione ricorrente. Aggiungi una transazione e seleziona "Ricorrente"!</p>';
        return;
    }
    
    container.innerHTML = recurringTransactions.map(recurring => {
        const category = (recurring.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)
            .find(c => c.name === recurring.category);
        const icon = category ? category.icon : '📦';
        
        const frequencyText = {
            'daily': '📅 Giornaliera',
            'weekly': '📆 Settimanale',
            'monthly': '🗓️ Mensile',
            'yearly': '📊 Annuale'
        }[recurring.frequency];
        
        return `
            <div class="card p-4 rounded-lg ${!recurring.active ? 'opacity-50' : ''}">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3 flex-1">
                        <span class="text-3xl">${icon}</span>
                        <div class="flex-1">
                            <h3 class="font-bold">${recurring.description}</h3>
                            <p class="text-sm" style="color: var(--text-secondary)">
                                ${frequencyText} • ${recurring.category}
                            </p>
                            <p class="text-sm mt-1">
                                <span class="font-semibold ${recurring.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                                    ${recurring.type === 'income' ? '+' : '-'}€${recurring.amount.toFixed(2)}
                                </span>
                                <span class="text-gray-500 ml-2">
                                    Prossima: ${new Date(recurring.nextOccurrence).toLocaleDateString('it-IT')}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="toggleRecurring(${recurring.id})" class="p-2 rounded ${recurring.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}" title="${recurring.active ? 'Disattiva' : 'Attiva'}">
                            ${recurring.active ? '✅' : '⏸️'}
                        </button>
                        <button onclick="deleteRecurring(${recurring.id})" class="p-2 text-red-500 hover:text-red-700">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// CHARTS & VISUALIZATIONS
// ============================================

function renderExpensesChart() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const expensesByCategory = {};
    
    transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });

    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);

    if (chart) chart.destroy();

    const ctx = document.getElementById('expensesChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                    '#4BC0C0', '#FF9F40', '#36A2EB', '#FFCE56', '#FF6384'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: €${context.parsed.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderTrendChart() {
    const monthlyData = {};
    const months = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        months.push(monthKey);
        monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    
    transactions.forEach(t => {
        const monthKey = t.date.slice(0, 7);
        if (monthlyData[monthKey]) {
            if (t.type === 'income') {
                monthlyData[monthKey].income += t.amount;
            } else {
                monthlyData[monthKey].expenses += t.amount;
            }
        }
    });
    
    const incomeData = months.map(m => monthlyData[m].income);
    const expenseData = months.map(m => monthlyData[m].expenses);
    const labels = months.map(m => {
        const date = new Date(m + '-01');
        return date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
    });
    
    if (trendChart) trendChart.destroy();
    
    const ctx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entrate',
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Spese',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': €' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// FORECAST
// ============================================

function toggleForecastSettings() {
    const settings = document.getElementById('forecastSettings');
    settings.classList.toggle('hidden');
}

function getMonthlyData() {
    const monthlyData = {};
    
    transactions.forEach(t => {
        const monthKey = t.date.slice(0, 7);
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expenses: 0 };
        }
        
        if (t.type === 'income') {
            monthlyData[monthKey].income += t.amount;
        } else {
            monthlyData[monthKey].expenses += t.amount;
        }
    });
    
    return monthlyData;
}

function calculateAverages(monthlyData, historyMonths) {
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    const recentMonths = sortedMonths.slice(0, historyMonths);
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let count = 0;
    
    recentMonths.forEach(month => {
        totalIncome += monthlyData[month].income;
        totalExpenses += monthlyData[month].expenses;
        count++;
    });
    
    return {
        avgIncome: count > 0 ? totalIncome / count : 0,
        avgExpenses: count > 0 ? totalExpenses / count : 0,
        monthsCounted: count
    };
}

function generateForecast() {
    const historyMonths = parseInt(document.getElementById('forecastHistoryMonths').value) || 3;
    const futureMonths = parseInt(document.getElementById('forecastFutureMonths').value) || 3;
    
    const monthlyData = getMonthlyData();
    const { avgIncome, avgExpenses, monthsCounted } = calculateAverages(monthlyData, historyMonths);
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const last6Months = sortedMonths.slice(-6);
    
    const futureMonthsData = [];
    const today = new Date();
    
    for (let i = 1; i <= futureMonths; i++) {
        const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthKey = futureDate.toISOString().slice(0, 7);
        futureMonthsData.push(monthKey);
    }
    
    return {
        historicalMonths: last6Months,
        monthlyData,
        futureMonths: futureMonthsData,
        avgIncome,
        avgExpenses,
        avgBalance: avgIncome - avgExpenses,
        monthsCounted
    };
}

function formatMonth(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
}

function updateForecast() {
    const forecast = generateForecast();
    
    const labels = [...forecast.historicalMonths.map(formatMonth), ...forecast.futureMonths.map(formatMonth)];
    const incomeData = [];
    const expensesData = [];
    const balanceData = [];
    
    forecast.historicalMonths.forEach(month => {
        const data = forecast.monthlyData[month] || { income: 0, expenses: 0 };
        incomeData.push(data.income);
        expensesData.push(data.expenses);
        balanceData.push(data.income - data.expenses);
    });
    
    forecast.futureMonths.forEach(() => {
        incomeData.push(forecast.avgIncome);
        expensesData.push(forecast.avgExpenses);
        balanceData.push(forecast.avgBalance);
    });
    
    if (forecastChart) forecastChart.destroy();
    
    const ctx = document.getElementById('forecastChart').getContext('2d');
    forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entrate',
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Spese',
                    data: expensesData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Bilancio',
                    data: balanceData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderDash: balanceData.map((_, i) => 
                        i >= forecast.historicalMonths.length ? [5, 5] : []
                    )
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const isPrediction = context.dataIndex >= forecast.historicalMonths.length;
                            const prefix = isPrediction ? '(Prev.) ' : '';
                            return prefix + context.dataset.label + ': €' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
    
    renderForecastDetails(forecast);
}

function renderForecastDetails(forecast) {
    const container = document.getElementById('forecastDetails');
    
    const savings = forecast.avgBalance * forecast.futureMonths.length;
    const savingsClass = savings > 0 ? 'text-green-600' : 'text-red-600';
    
    container.innerHTML = `
        <div class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg border border-green-200">
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">📈 Entrate Medie Mensili</div>
            <div class="text-2xl font-bold text-green-700 dark:text-green-300">€${forecast.avgIncome.toFixed(2)}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Basato su ${forecast.monthsCounted} mesi</div>
        </div>
        
        <div class="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg border border-red-200">
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">📉 Spese Medie Mensili</div>
            <div class="text-2xl font-bold text-red-700 dark:text-red-300">€${forecast.avgExpenses.toFixed(2)}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Basato su ${forecast.monthsCounted} mesi</div>
        </div>
        
        <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg border border-blue-200">
            <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">💰 Risparmio Previsto</div>
            <div class="text-2xl font-bold ${savingsClass}">€${savings.toFixed(2)}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Prossimi ${forecast.futureMonths.length} mesi</div>
        </div>
    `;
}


// ============================================
// SUMMARY & STATISTICS
// ============================================

function updateMonthlySummary() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthKey = lastMonth.toISOString().slice(0, 7);
    
    const currentIncome = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const lastIncome = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(lastMonthKey))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const lastExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(lastMonthKey))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const currentBalance = currentIncome - currentExpenses;
    const lastBalance = lastIncome - lastExpenses;
    
    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome * 100) : 0;
    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses * 100) : 0;
    const balanceChange = lastBalance !== 0 ? ((currentBalance - lastBalance) / Math.abs(lastBalance) * 100) : 0;
    
    const savingsRate = currentIncome > 0 ? ((currentBalance / currentIncome) * 100) : 0;
    
    document.getElementById('monthlyIncome').textContent = `€${currentIncome.toFixed(0)}`;
    document.getElementById('monthlyExpenses').textContent = `€${currentExpenses.toFixed(0)}`;
    document.getElementById('monthlyBalance').textContent = `€${currentBalance.toFixed(0)}`;
    document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(0)}%`;
    
    document.getElementById('incomeChange').textContent = `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs mese scorso`;
    document.getElementById('expenseChange').textContent = `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% vs mese scorso`;
    document.getElementById('balanceChange').textContent = `${balanceChange >= 0 ? '+' : ''}${balanceChange.toFixed(1)}% vs mese scorso`;
}

// ============================================
// TRANSACTIONS LIST
// ============================================

function populateMonthFilter() {
    const months = new Set();
    transactions.forEach(t => {
        const monthYear = t.date.slice(0, 7);
        months.add(monthYear);
    });

    const select = document.getElementById('filterMonth');
    const currentOptions = Array.from(select.options).map(o => o.value);
    
    Array.from(months).sort().reverse().forEach(monthYear => {
        if (!currentOptions.includes(monthYear)) {
            const [year, month] = monthYear.split('-');
            const date = new Date(year, month - 1);
            const monthName = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
            const option = document.createElement('option');
            option.value = monthYear;
            option.textContent = monthName;
            select.appendChild(option);
        }
    });
}

function getFilteredTransactions() {
    const filterValue = document.getElementById('filterMonth').value;
    if (filterValue === 'all') return transactions;
    
    return transactions.filter(t => t.date.startsWith(filterValue));
}

function renderTransactionsList() {
    const filteredTransactions = getFilteredTransactions();
    const container = document.getElementById('transactionsList');
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nessuna transazione trovata</p>';
        return;
    }

    container.innerHTML = filteredTransactions.map(t => {
        const categories = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        const category = categories.find(c => c.name === t.category);
        const icon = category ? category.icon : '📦';
        
        return `
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <div class="flex items-center gap-4 flex-1">
                    <span class="text-2xl">${icon}</span>
                    <div class="flex-1">
                        <div class="font-semibold">${t.description}</div>
                        <div class="text-sm" style="color: var(--text-secondary)">${t.category} • ${new Date(t.date).toLocaleDateString('it-IT')}</div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                        ${t.type === 'income' ? '+' : '-'}€${t.amount.toFixed(2)}
                    </span>
                    <button onclick="deleteTransaction(${t.id})" class="text-red-500 hover:text-red-700 p-2">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// THEME (DARK MODE)
// ============================================

function applyTheme() {
    const savedTheme = localStorage.getItem('budget-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('budget-theme', newTheme);
    updateThemeIcon(newTheme);
    showNotification(`Tema ${newTheme === 'dark' ? 'scuro' : 'chiaro'} attivato 🎨`, 'info');
}

function updateThemeIcon(theme) {
    document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ============================================
// PWA (PROGRESSIVE WEB APP)
// ============================================

function setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Service Worker registered:', reg))
                .catch(err => console.log('Service Worker registration failed:', err));
        });
    }
    
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('installBtn').classList.remove('hidden');
    });
}

async function installPWA() {
    if (!deferredPrompt) {
        showNotification('App già installata o installazione non disponibile', 'info');
        return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showNotification('App installata con successo! 🎉', 'success');
        document.getElementById('installBtn').classList.add('hidden');
    }
    
    deferredPrompt = null;
}

// ============================================
// TAB NAVIGATION
// ============================================

function switchTab(tabName) {
    currentTab = tabName;
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('tab-active');
    
    // Render content based on tab
    if (tabName === 'budgets') {
        renderBudgetsList();
    } else if (tabName === 'goals') {
        renderGoalsList();
    } else if (tabName === 'recurring') {
        renderRecurringList();
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const id = Date.now();
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const notification = document.createElement('div');
    notification.id = `notif-${id}`;
    notification.className = `notification ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span>${message}</span>
            <button onclick="document.getElementById('notif-${id}').remove()" class="ml-2 text-white hover:text-gray-200">
                ✕
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ============================================
// STORAGE INDICATOR
// ============================================

function updateStorageIndicator() {
    const indicator = document.getElementById('storageIndicator');
    if (USE_N8N_STORAGE) {
        indicator.innerHTML = `
            <div class="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span class="font-semibold">Google Sheets</span>
            </div>
        `;
    } else {
        indicator.innerHTML = `
            <div class="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span class="font-semibold">Storage Locale</span>
            </div>
        `;
    }
}

// ============================================
// RENDER ALL
// ============================================

function renderAll() {
    updateMonthlySummary();
    renderTransactionsList();
    renderExpensesChart();
    renderTrendChart();
    populateMonthFilter();
    updateForecast();
    renderGoalsProgress();
    checkBudgets();
}

// ============================================
// INITIALIZATION
// ============================================

console.log('✅ Budget Familiare Pro - Phase 1 Loaded');
console.log('Features: Budgets ✓ Goals ✓ Recurring ✓ Dark Mode ✓ PWA ✓');


// ============================================
// PHASE 2 - AI FEATURES
// ============================================

// AI Configuration
const OPENAI_PROXY_URL = N8N_WEBHOOK_URL.replace('/family-budget', '/ai-assistant');
let aiChatHistory = [];

// ============================================
// OCR - RECEIPT SCANNING
// ============================================

async function handleReceiptUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const statusDiv = document.getElementById('ocrStatus');
    statusDiv.innerHTML = '📸 Scansione scontrino in corso...';
    
    try {
        // Read file as base64
        const base64 = await fileToBase64(file);
        
        // Show preview
        const preview = document.createElement('img');
        preview.src = base64;
        preview.style.maxWidth = '200px';
        preview.style.marginTop = '10px';
        statusDiv.appendChild(preview);
        
        statusDiv.innerHTML += '<br>🤖 Estrazione dati con AI...';
        
        // Call AI to extract data from receipt
        const extractedData = await extractReceiptData(base64);
        
        if (extractedData) {
            // Populate form
            document.getElementById('description').value = extractedData.description || '';
            document.getElementById('amount').value = extractedData.amount || '';
            
            // Try to match category
            const suggestedCategory = suggestCategoryFromDescription(extractedData.description);
            if (suggestedCategory) {
                document.getElementById('category').value = suggestedCategory;
            }
            
            statusDiv.innerHTML = '✅ Dati estratti! Controlla e conferma.';
            showNotification('Dati estratti dallo scontrino! 🎉', 'success');
        }
    } catch (error) {
        console.error('OCR Error:', error);
        statusDiv.innerHTML = '❌ Errore nella scansione. Riprova o inserisci manualmente.';
        showNotification('Errore OCR: ' + error.message, 'error');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function extractReceiptData(base64Image) {
    try {
        const response = await fetch(OPENAI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operation: 'ocr',
                image: base64Image
            })
        });
        
        if (!response.ok) throw new Error('OCR failed');
        
        const data = await response.json();
        return data.extracted;
    } catch (error) {
        console.error('Extract receipt error:', error);
        // Fallback: basic extraction without AI
        return { description: 'Spesa', amount: '' };
    }
}

// ============================================
// AI CATEGORIZATION
// ============================================

function suggestCategoryFromDescription(description) {
    if (!description) return null;
    
    const desc = description.toLowerCase();
    
    // Rule-based suggestions
    const rules = {
        'Alimentari': ['supermercato', 'conad', 'coop', 'esselunga', 'lidl', 'market', 'spesa'],
        'Ristorazione': ['ristorante', 'pizzeria', 'bar', 'caffè', 'trattoria', 'osteria'],
        'Trasporti': ['benzina', 'carburante', 'autostrada', 'parcheggio', 'taxi', 'uber', 'trenitalia'],
        'Utenze': ['enel', 'gas', 'acqua', 'telefono', 'internet', 'bolletta'],
        'Salute': ['farmacia', 'medico', 'dentista', 'ospedale', 'analisi'],
        'Abbigliamento': ['abbigliamento', 'scarpe', 'zara', 'h&m', 'nike'],
        'Intrattenimento': ['cinema', 'teatro', 'netflix', 'spotify', 'amazon prime'],
        'Casa': ['affitto', 'condominio', 'ikea', 'leroy merlin', 'bricocenter']
    };
    
    for (const [category, keywords] of Object.entries(rules)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
            return category;
        }
    }
    
    return null;
}

function setupAICategorization() {
    const descInput = document.getElementById('description');
    let debounceTimer;
    
    descInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const suggestion = suggestCategoryFromDescription(e.target.value);
            const suggestionDiv = document.getElementById('categoryAI');
            
            if (suggestion) {
                suggestionDiv.innerHTML = `💡 Suggerito: <strong>${suggestion}</strong> <button onclick="document.getElementById('category').value='${suggestion}'; document.getElementById('categoryAI').innerHTML='';" class="text-blue-600 underline ml-2">Applica</button>`;
            } else {
                suggestionDiv.innerHTML = '';
            }
        }, 500);
    });
}

// ============================================
// AI CHATBOT
// ============================================

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingId = addChatMessage('🤔 Sto pensando...', 'assistant');
    
    try {
        const response = await askAI(message);
        
        // Remove typing indicator
        document.getElementById(typingId).remove();
        
        // Add AI response
        addChatMessage(response, 'assistant');
    } catch (error) {
        document.getElementById(typingId).remove();
        addChatMessage('❌ Errore: ' + error.message, 'error');
    }
}

function addChatMessage(text, sender) {
    const container = document.getElementById('chatMessages');
    const messageId = 'msg-' + Date.now();
    
    const colors = {
        user: 'bg-blue-100 dark:bg-blue-900 text-right ml-8',
        assistant: 'bg-gray-100 dark:bg-gray-800 mr-8',
        error: 'bg-red-100 dark:bg-red-900 text-red-800'
    };
    
    const message = document.createElement('div');
    message.id = messageId;
    message.className = `p-3 rounded-lg mb-2 ${colors[sender] || colors.assistant}`;
    message.textContent = text;
    
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    
    return messageId;
}

async function askAI(question) {
    // Prepare context with recent transactions
    const recentTransactions = transactions.slice(0, 20);
    const context = {
        question,
        transactions: recentTransactions,
        budgets,
        goals,
        currentMonth: new Date().toISOString().slice(0, 7)
    };
    
    // Try local analysis first
    const localAnswer = analyzeQuestionLocally(question);
    if (localAnswer) return localAnswer;
    
    // Fallback to AI if needed
    try {
        const response = await fetch(OPENAI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operation: 'chat',
                context
            })
        });
        
        if (!response.ok) throw new Error('AI not available');
        
        const data = await response.json();
        return data.answer;
    } catch (error) {
        // Fallback to local analysis
        return "Mi dispiace, non riesco a connettermi all'AI. Prova con domande specifiche come: 'Quanto ho speso per alimentari questo mese?'";
    }
}

function analyzeQuestionLocally(question) {
    const q = question.toLowerCase();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Pattern: "quanto ho speso per [categoria]"
    if (q.includes('quanto') && q.includes('speso')) {
        for (const cat of EXPENSE_CATEGORIES) {
            if (q.includes(cat.name.toLowerCase())) {
                const total = transactions
                    .filter(t => t.type === 'expense' && 
                                t.category === cat.name && 
                                t.date.startsWith(currentMonth))
                    .reduce((sum, t) => sum + t.amount, 0);
                
                return `Hai speso €${total.toFixed(2)} per ${cat.name} questo mese.`;
            }
        }
        
        // Total expenses
        const totalExpenses = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        
        return `Le tue spese totali questo mese sono €${totalExpenses.toFixed(2)}.`;
    }
    
    // Pattern: "quante transazioni"
    if (q.includes('quante') && q.includes('transazioni')) {
        const count = transactions.filter(t => t.date.startsWith(currentMonth)).length;
        return `Hai registrato ${count} transazioni questo mese.`;
    }
    
    // Pattern: "bilancio"
    if (q.includes('bilancio') || q.includes('balance')) {
        const income = transactions
            .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = income - expenses;
        return `Il tuo bilancio questo mese è €${balance.toFixed(2)} (Entrate: €${income.toFixed(2)}, Spese: €${expenses.toFixed(2)})`;
    }
    
    return null;
}

// ============================================
// AI INSIGHTS & RECOMMENDATIONS
// ============================================

function generateAIInsights() {
    const insights = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Calculate monthly data
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Expenses by category
    const expensesByCategory = {};
    transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
    
    // Insight 1: Highest spending category
    const topCategory = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory) {
        const percentage = (topCategory[1] / monthlyExpenses * 100).toFixed(0);
        insights.push({
            icon: '📊',
            title: 'Categoria principale',
            text: `${topCategory[0]} rappresenta il ${percentage}% delle tue spese (€${topCategory[1].toFixed(2)})`
        });
    }
    
    // Insight 2: Savings rate
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;
    if (savingsRate > 20) {
        insights.push({
            icon: '💰',
            title: 'Ottimo risparmio!',
            text: `Stai risparmiando il ${savingsRate.toFixed(0)}% delle tue entrate. Continua così!`
        });
    } else if (savingsRate > 0) {
        insights.push({
            icon: '💡',
            title: 'Puoi migliorare',
            text: `Risparmio al ${savingsRate.toFixed(0)}%. Obiettivo consigliato: 20%. Cerca di ridurre le spese non essenziali.`
        });
    } else {
        insights.push({
            icon: '⚠️',
            title: 'Attenzione',
            text: `Stai spendendo più di quanto guadagni questo mese. Rivedi il budget!`
        });
    }
    
    // Insight 3: Budget status
    const budgetsExceeded = budgets.filter(b => {
        const spent = expensesByCategory[b.category] || 0;
        return spent > b.limit;
    });
    
    if (budgetsExceeded.length > 0) {
        insights.push({
            icon: '🚨',
            title: 'Budget superati',
            text: `Hai superato ${budgetsExceeded.length} budget questo mese. Controlla: ${budgetsExceeded.map(b => b.category).join(', ')}`
        });
    }
    
    return insights;
}

function renderAIInsights() {
    const container = document.getElementById('aiInsights');
    const insights = generateAIInsights();
    
    if (insights.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Aggiungi più transazioni per ricevere insights personalizzati</p>';
        return;
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
            <div class="flex items-start gap-3">
                <span class="text-3xl">${insight.icon}</span>
                <div>
                    <h4 class="font-bold mb-1">${insight.title}</h4>
                    <p class="text-sm" style="color: var(--text-secondary)">${insight.text}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function generateAIRecommendations() {
    const recommendations = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Analyze spending patterns
    const expensesByCategory = {};
    transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
    
    // Recommendation 1: Reduce highest category if over average
    const avgExpense = Object.values(expensesByCategory).reduce((a, b) => a + b, 0) / Object.keys(expensesByCategory).length;
    
    for (const [category, amount] of Object.entries(expensesByCategory)) {
        if (amount > avgExpense * 1.5) {
            recommendations.push({
                icon: '💡',
                title: `Riduci spese per ${category}`,
                text: `Prova a ridurre del 10% le spese per ${category}. Risparmieresti €${(amount * 0.1).toFixed(2)} al mese.`,
                action: 'budget',
                category
            });
        }
    }
    
    // Recommendation 2: Set budgets for categories without
    const categoriesWithoutBudget = EXPENSE_CATEGORIES
        .filter(cat => expensesByCategory[cat.name] && !budgets.find(b => b.category === cat.name))
        .slice(0, 2);
    
    categoriesWithoutBudget.forEach(cat => {
        const suggested = Math.ceil(expensesByCategory[cat.name] * 1.1);
        recommendations.push({
            icon: '🎯',
            title: `Imposta budget per ${cat.name}`,
            text: `Ti suggerisco un budget di €${suggested} al mese per ${cat.name}.`,
            action: 'setBudget',
            category: cat.name,
            amount: suggested
        });
    });
    
    // Recommendation 3: Recurring transactions
    const frequentDescriptions = {};
    transactions.forEach(t => {
        frequentDescriptions[t.description] = (frequentDescriptions[t.description] || 0) + 1;
    });
    
    const recurring = Object.entries(frequentDescriptions)
        .filter(([_, count]) => count >= 2)
        .slice(0, 1);
    
    recurring.forEach(([desc, count]) => {
        if (!recurringTransactions.find(r => r.description === desc)) {
            recommendations.push({
                icon: '🔄',
                title: 'Crea transazione ricorrente',
                text: `"${desc}" appare ${count} volte. Vuoi renderla ricorrente?`,
                action: 'recurring',
                description: desc
            });
        }
    });
    
    return recommendations.slice(0, 5);
}

function renderAIRecommendations() {
    const container = document.getElementById('aiRecommendations');
    const recommendations = generateAIRecommendations();
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nessun consiglio al momento. Continua a usare l\'app!</p>';
        return;
    }
    
    container.innerHTML = recommendations.map((rec, i) => `
        <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <div class="flex items-start gap-3">
                <span class="text-2xl">${rec.icon}</span>
                <div class="flex-1">
                    <h4 class="font-bold mb-1">${rec.title}</h4>
                    <p class="text-sm mb-2" style="color: var(--text-secondary)">${rec.text}</p>
                    ${rec.action ? `
                        <button onclick="applyRecommendation(${i})" class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                            Applica
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function applyRecommendation(index) {
    const recommendations = generateAIRecommendations();
    const rec = recommendations[index];
    
    if (!rec) return;
    
    switch (rec.action) {
        case 'setBudget':
            document.getElementById('budgetCategory').value = rec.category;
            document.getElementById('budgetLimit').value = rec.amount;
            showAddBudgetModal();
            showNotification('Budget pre-compilato! Modifica se necessario', 'info');
            break;
            
        case 'budget':
            switchTab('budgets');
            showNotification(`Controlla il budget per ${rec.category}`, 'info');
            break;
            
        case 'recurring':
            switchTab('transactions');
            document.getElementById('description').value = rec.description;
            document.getElementById('isRecurring').checked = true;
            document.getElementById('recurringOptions').classList.remove('hidden');
            showNotification('Form pre-compilato per transazione ricorrente', 'info');
            break;
    }
}


// Update initialization to include AI features
const originalInitApp = initApp;
async function initApp() {
    await originalInitApp();
    setupAICategorization();
    renderAIInsights();
    renderAIRecommendations();
}

// Update renderAll to include AI
const originalRenderAll = renderAll;
function renderAll() {
    originalRenderAll();
    renderAIInsights();
    renderAIRecommendations();
}

// Update switchTab to handle AI tab
const originalSwitchTab = switchTab;
function switchTab(tabName) {
    originalSwitchTab(tabName);
    if (tabName === 'ai') {
        renderAIInsights();
        renderAIRecommendations();
    }
}

console.log('✅ Budget Familiare Pro - Phase 2 Loaded');
console.log('AI Features: OCR ✓ Smart Categorization ✓ Chatbot ✓ Insights ✓ Recommendations ✓');

