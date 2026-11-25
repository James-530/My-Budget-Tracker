// Budgets page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on budgets page
  if (!document.getElementById('budget-cards')) return;

  const budgetCards = document.getElementById('budget-cards');
  const addBudgetBtn = document.getElementById('add-budget-btn');
  const modalOverlay = document.getElementById('budget-modal-overlay');
  const modal = document.getElementById('budget-modal');
  const modalClose = document.getElementById('budget-modal-close');
  const cancelBtn = document.getElementById('budget-cancel-btn');
  const form = document.getElementById('budget-form');
  const modalTitle = document.getElementById('budget-modal-title');
  const budgetCategory = document.getElementById('budget-category');

  let editingBudgetId = null;

  function renderBudgets() {
    const budgets = Storage.getBudgets();
    const transactions = Storage.getTransactions();
    const categories = Storage.getCategories();

    // Update summary cards
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    let totalSpent = 0;

    budgets.forEach(budget => {
      const budgetTransactions = transactions.filter(t =>
        t.type === 'expense' &&
        t.categoryId === budget.categoryId &&
        isWithinPeriod(t.date, budget.period)
      );
      totalSpent += budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    const totalRemaining = totalBudgeted - totalSpent;

    document.getElementById('total-budgeted').textContent = Utils.formatCurrency(totalBudgeted);
    document.getElementById('total-spent').textContent = Utils.formatCurrency(totalSpent);
    document.getElementById('total-remaining').textContent = Utils.formatCurrency(totalRemaining);

    const remainingEl = document.getElementById('total-remaining');
    remainingEl.style.color = totalRemaining >= 0 ? 'var(--success)' : '#EF4444';

    // Render budget cards
    if (budgets.length === 0) {
      budgetCards.innerHTML = '<p class="empty-state">No budgets created yet. Click "+ Add" to create your first budget.</p>';
      return;
    }

    budgetCards.innerHTML = budgets.map(budget => {
      const category = Utils.getCategoryById(categories, budget.categoryId);
      const budgetTransactions = transactions.filter(t =>
        t.type === 'expense' &&
        t.categoryId === budget.categoryId &&
        isWithinPeriod(t.date, budget.period)
      );
      const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount * 100) : 0;

      let progressClass = 'normal';
      if (percentage >= 100) progressClass = 'danger';
      else if (percentage >= 80) progressClass = 'warning';

      return `
        <div class="budget-card">
          <div class="budget-card-header">
            <div class="budget-card-info">
              <h3>${category?.name || 'Unknown Category'}</h3>
              <span class="category">${budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}</span>
            </div>
            <div class="budget-card-actions">
              <button class="action-btn edit-btn" data-id="${budget.id}">${Utils.getIcon('edit', 16)}</button>
              <button class="action-btn delete delete-btn" data-id="${budget.id}">${Utils.getIcon('delete', 16)}</button>
            </div>
          </div>
          <div class="budget-progress">
            <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="budget-card-footer">
            <span class="spent">Spent: ${Utils.formatCurrency(spent)}</span>
            <span class="remaining">${remaining >= 0 ? 'Remaining' : 'Over'}: ${Utils.formatCurrency(Math.abs(remaining))}</span>
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.budget-card .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
    document.querySelectorAll('.budget-card .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteBudget(btn.dataset.id));
    });

    // Initialize Lucide icons for dynamically added content
    Utils.initLucide();
  }

  function isWithinPeriod(dateStr, period) {
    const date = new Date(dateStr);
    const now = new Date();

    switch (period) {
      case 'weekly': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return date >= weekStart && date <= weekEnd;
      }
      case 'monthly': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return date >= monthStart && date <= monthEnd;
      }
      case 'yearly': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        return date >= yearStart && date <= yearEnd;
      }
      default:
        return true;
    }
  }

  function openModal(budgetId = null) {
    editingBudgetId = budgetId;
    const categories = Storage.getCategories();

    form.reset();
    document.getElementById('budget-id').value = '';
    populateCategorySelect(categories);

    if (budgetId) {
      modalTitle.textContent = 'Edit Budget';
      const budget = Storage.getBudgets().find(b => b.id === budgetId);
      if (budget) {
        document.getElementById('budget-id').value = budget.id;
        document.getElementById('budget-amount').value = budget.amount;
        document.getElementById('budget-period').value = budget.period;
        budgetCategory.value = budget.categoryId;
      }
    } else {
      modalTitle.textContent = 'Add Budget';
    }

    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }

  function populateCategorySelect(categories) {
    budgetCategory.innerHTML = '';
    // Only expense categories for budgets
    categories.expense.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.name}`;
      budgetCategory.appendChild(option);
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    editingBudgetId = null;
  }

  function deleteBudget(id) {
    if (confirm('Are you sure you want to delete this budget?')) {
      Storage.deleteBudget(id);
      renderBudgets();
      notifyDataChanged();
      Utils.showNotification('Budget deleted', 'error');
    }
  }

  function notifyDataChanged() {
    window.dispatchEvent(new CustomEvent('lago-data-changed'));
  }

  // Event listeners
  addBudgetBtn.addEventListener('click', () => openModal());

  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Note: Budgets use category selection via dropdown, no name input. Auto-capitalize not applicable here.
    const budget = {
      id: editingBudgetId || Utils.generateId(),
      categoryId: budgetCategory.value,
      amount: parseFloat(document.getElementById('budget-amount').value),
      period: document.getElementById('budget-period').value
    };

    if (editingBudgetId) {
      Storage.updateBudget(editingBudgetId, budget);
      Utils.showNotification('Budget updated', 'success');
    } else {
      Storage.addBudget(budget);
      Utils.showNotification('Budget added', 'success');
    }

    closeModal();
    renderBudgets();
    notifyDataChanged();
  });

  // Initial render
  renderBudgets();
});