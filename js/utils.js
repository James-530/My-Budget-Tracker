// Utility functions
const Utils = {
  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Format currency
  formatCurrency(amount, currency = 'PHP') {
    const symbols = {
      PHP: '₱',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    const symbol = symbols[currency] || '₱';
    return `${symbol}${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Get current date in YYYY-MM-DD format
  getToday() {
    return new Date().toISOString().split('T')[0];
  },

  // Get date N days ago
  getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  },

  // Get start of current month
  getMonthStart() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  },

  // Get end of current month
  getMonthEnd() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  },

  // Get start of current week (Monday)
  getWeekStart() {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  },

  // Get end of current week (Sunday)
  getWeekEnd() {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? 0 : 7);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  },

  // Get start of current quarter
  getQuarterStart() {
    const date = new Date();
    const month = date.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    return new Date(date.getFullYear(), quarterStartMonth, 1).toISOString().split('T')[0];
  },

  // Get end of current quarter
  getQuarterEnd() {
    const date = new Date();
    const month = date.getMonth();
    const quarterEndMonth = Math.floor(month / 3) * 3 + 3;
    return new Date(date.getFullYear(), quarterEndMonth, 0).toISOString().split('T')[0];
  },

  // Get start of current year
  getYearStart() {
    const date = new Date();
    return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
  },

  // Get end of current year
  getYearEnd() {
    const date = new Date();
    return new Date(date.getFullYear(), 11, 31).toISOString().split('T')[0];
  },

  // Filter transactions by date range
  filterByDateRange(transactions, startDate, endDate) {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  },

  // Filter transactions by type
  filterByType(transactions, type) {
    if (type === 'all') return transactions;
    return transactions.filter(t => t.type === type);
  },

  // Filter transactions by category
  filterByCategory(transactions, categoryId) {
    if (categoryId === 'all') return transactions;
    return transactions.filter(t => t.categoryId === categoryId);
  },

  // Calculate totals
  calculateTotals(transactions) {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income * 100) : 0
    };
  },

  // Group transactions by category
  groupByCategory(transactions, categories) {
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.id] = { ...c, total: 0, count: 0 };
    });

    transactions.forEach(t => {
      if (categoryMap[t.categoryId]) {
        categoryMap[t.categoryId].total += t.amount;
        categoryMap[t.categoryId].count += 1;
      }
    });

    return Object.values(categoryMap).filter(c => c.total > 0);
  },

  // Get category by ID
  getCategoryById(categories, id) {
    for (const type of ['income', 'expense']) {
      const found = categories[type]?.find(c => c.id === id);
      if (found) return found;
    }
    return null;
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 2000;
      animation: slideIn 0.3s ease;
      background-color: ${type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#3B82F6'};
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Convert string to title case
  toTitleCase(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);