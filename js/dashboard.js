// Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on dashboard page
  if (!document.getElementById('total-income')) return;

  const expenseChart = document.getElementById('expense-chart');
  const incomeExpenseChart = document.getElementById('income-expense-chart');
  const recentTransactions = document.getElementById('recent-transactions');

  let expenseChartInstance = null;
  let incomeExpenseChartInstance = null;

  function renderDashboard() {
    const transactions = Storage.getTransactions();
    const categories = Storage.getCategories();
    const totals = Utils.calculateTotals(transactions);

    // Update stat cards
    document.getElementById('total-income').textContent = Utils.formatCurrency(totals.income);
    document.getElementById('total-expenses').textContent = Utils.formatCurrency(totals.expenses);
    document.getElementById('balance').textContent = Utils.formatCurrency(totals.balance);
    document.getElementById('savings-rate').textContent = `${totals.savingsRate.toFixed(1)}%`;

    // Update balance color
    const balanceEl = document.getElementById('balance');
    balanceEl.style.color = totals.balance >= 0 ? 'var(--success)' : '#EF4444';

    // Render charts
    renderExpenseChart(transactions, categories);
    renderIncomeExpenseChart(transactions);
    renderRecentTransactions(transactions, categories);
  }

  function renderExpenseChart(transactions, categories) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const grouped = Utils.groupByCategory(expenseTransactions, categories.expense);

    const labels = grouped.map(g => g.name);
    const data = grouped.map(g => g.total);
    const colors = grouped.map(g => g.color);

    if (expenseChartInstance) {
      expenseChartInstance.destroy();
    }

    expenseChartInstance = new Chart(expenseChart, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9CA3AF',
              padding: 16,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${Utils.formatCurrency(context.raw)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  function renderIncomeExpenseChart(transactions) {
    // Get last 7 days
    const labels = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-PH', { weekday: 'short' }));

      const dayTransactions = transactions.filter(t => t.date === dateStr);
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(income);
      expenseData.push(expenses);
    }

    if (incomeExpenseChartInstance) {
      incomeExpenseChartInstance.destroy();
    }

    incomeExpenseChartInstance = new Chart(incomeExpenseChart, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: 4
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#9CA3AF',
              font: { size: 12 }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9CA3AF', font: { size: 11 } }
          },
          y: {
            grid: { color: '#1F2937' },
            ticks: { color: '#9CA3AF', font: { size: 11 } }
          }
        }
      }
    });
  }

  function renderRecentTransactions(transactions, categories) {
    const recent = transactions.slice(0, 5);

    if (recent.length === 0) {
      recentTransactions.innerHTML = '<p class="empty-state">No transactions yet</p>';
      return;
    }

    recentTransactions.innerHTML = recent.map(t => {
      const category = Utils.getCategoryById(categories, t.categoryId);
      const icon = category?.icon || '📦';
      const typeClass = t.type === 'income' ? 'income' : 'expense';
      const sign = t.type === 'income' ? '+' : '-';

      return `
        <div class="transaction-item">
          <div class="transaction-icon">${icon}</div>
          <div class="transaction-details">
            <div class="transaction-description">${Utils.escapeHtml(t.description)}</div>
            <div class="transaction-meta">
              <span class="transaction-category">${category?.name || 'Unknown'}</span>
              <span class="transaction-date">${Utils.formatDate(t.date)}</span>
            </div>
          </div>
          <div class="transaction-amount ${typeClass}">${sign}${Utils.formatCurrency(t.amount)}</div>
        </div>
      `;
    }).join('');
  }

  // Initial render
  renderDashboard();

  // Listen for storage changes
  window.addEventListener('storage', renderDashboard);

  // Also listen for custom events from other pages
  window.addEventListener('lago-data-changed', renderDashboard);
});