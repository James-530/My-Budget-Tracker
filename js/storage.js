// Storage utility for LocalStorage operations
const Storage = {
  // Keys
  KEYS: {
    TRANSACTIONS: 'lago_transactions',
    BUDGETS: 'lago_budgets',
    CATEGORIES: 'lago_categories',
    SETTINGS: 'lago_settings'
  },

  // Default data
  DEFAULTS: {
    TRANSACTIONS: [],
    BUDGETS: [],
    CATEGORIES: {
      income: [
        { id: 'income_salary', name: 'Salary', icon: '💵', color: '#22C55E', type: 'income' },
        { id: 'income_business', name: 'Business', icon: '💼', color: '#3B82F6', type: 'income' },
        { id: 'income_gift', name: 'Gift', icon: '🎁', color: '#A855F7', type: 'income' },
        { id: 'income_other', name: 'Other', icon: '💰', color: '#FBBF24', type: 'income' }
      ],
      expense: [
        { id: 'expense_housing', name: 'Housing', icon: '🏠', color: '#EF4444', type: 'expense' },
        { id: 'expense_food', name: 'Food', icon: '🍔', color: '#F97316', type: 'expense' },
        { id: 'expense_transport', name: 'Transport', icon: '🚌', color: '#06B6D4', type: 'expense' },
        { id: 'expense_shopping', name: 'Shopping', icon: '🛍️', color: '#EC4899', type: 'expense' },
        { id: 'expense_health', name: 'Health', icon: '🏥', color: '#22C55E', type: 'expense' },
        { id: 'expense_entertainment', name: 'Entertainment', icon: '🎮', color: '#A855F7', type: 'expense' },
        { id: 'expense_education', name: 'Education', icon: '📚', color: '#3B82F6', type: 'expense' },
        { id: 'expense_utilities', name: 'Utilities', icon: '⚡', color: '#FBBF24', type: 'expense' },
        { id: 'expense_vehicle', name: 'Vehicle', icon: '🚗', color: '#64748B', type: 'expense' },
        { id: 'expense_travel', name: 'Travel', icon: '✈️', color: '#14B8A6', type: 'expense' },
        { id: 'expense_personal', name: 'Personal', icon: '💄', color: '#F472B6', type: 'expense' },
        { id: 'expense_other', name: 'Other', icon: '📦', color: '#9CA3AF', type: 'expense' }
      ]
    },
    SETTINGS: {
      theme: 'dark',
      currency: 'PHP'
    }
  },

  // Initialize default data if not exists
  init() {
    Object.entries(this.KEYS).forEach(([key, storageKey]) => {
      if (!localStorage.getItem(storageKey)) {
        const defaultData = this.DEFAULTS[key];
        if (defaultData !== undefined) {
          localStorage.setItem(storageKey, JSON.stringify(defaultData));
        }
      }
    });
  },

  // Generic get/set
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  // Transactions
  getTransactions() {
    return this.get(this.KEYS.TRANSACTIONS) || [];
  },

  saveTransactions(transactions) {
    return this.set(this.KEYS.TRANSACTIONS, transactions);
  },

  addTransaction(transaction) {
    const transactions = this.getTransactions();
    transactions.unshift(transaction);
    return this.saveTransactions(transactions);
  },

  updateTransaction(id, updates) {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      return this.saveTransactions(transactions);
    }
    return false;
  },

  deleteTransaction(id) {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    return this.saveTransactions(transactions);
  },

  // Budgets
  getBudgets() {
    return this.get(this.KEYS.BUDGETS) || [];
  },

  saveBudgets(budgets) {
    return this.set(this.KEYS.BUDGETS, budgets);
  },

  addBudget(budget) {
    const budgets = this.getBudgets();
    budgets.push(budget);
    return this.saveBudgets(budgets);
  },

  updateBudget(id, updates) {
    const budgets = this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      return this.saveBudgets(budgets);
    }
    return false;
  },

  deleteBudget(id) {
    const budgets = this.getBudgets().filter(b => b.id !== id);
    return this.saveBudgets(budgets);
  },

  // Categories
  getCategories() {
    return this.get(this.KEYS.CATEGORIES) || this.DEFAULTS.CATEGORIES;
  },

  saveCategories(categories) {
    return this.set(this.KEYS.CATEGORIES, categories);
  },

  getCategoriesByType(type) {
    const categories = this.getCategories();
    return categories[type] || [];
  },

  addCategory(category) {
    const categories = this.getCategories();
    if (!categories[category.type]) {
      categories[category.type] = [];
    }
    categories[category.type].push(category);
    return this.saveCategories(categories);
  },

  updateCategory(type, id, updates) {
    const categories = this.getCategories();
    const index = categories[type]?.findIndex(c => c.id === id);
    if (index !== -1 && index !== undefined) {
      categories[type][index] = { ...categories[type][index], ...updates };
      return this.saveCategories(categories);
    }
    return false;
  },

  deleteCategory(type, id) {
    const categories = this.getCategories();
    if (categories[type]) {
      categories[type] = categories[type].filter(c => c.id !== id);
      return this.saveCategories(categories);
    }
    return false;
  },

  // Settings
  getSettings() {
    return this.get(this.KEYS.SETTINGS) || this.DEFAULTS.SETTINGS;
  },

  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  },

  // Export/Import
  exportData() {
    return {
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      categories: this.getCategories(),
      settings: this.getSettings()
    };
  },

  importData(data) {
    let success = true;
    if (data.transactions) success = this.saveTransactions(data.transactions) && success;
    if (data.budgets) success = this.saveBudgets(data.budgets) && success;
    if (data.categories) success = this.saveCategories(data.categories) && success;
    if (data.settings) success = this.saveSettings(data.settings) && success;
    return success;
  },

  clearAllData() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.init();
  }
};

// Initialize on load
Storage.init();