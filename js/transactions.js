// Transactions page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on transactions page
  if (!document.getElementById('transactions-table')) return;

  const transactionsBody = document.getElementById('transactions-body');
  const typeFilter = document.getElementById('type-filter');
  const categoryFilter = document.getElementById('category-filter');
  const dateFilter = document.getElementById('date-filter');
  const addTransactionBtn = document.getElementById('add-transaction-btn');
  const modalOverlay = document.getElementById('transaction-modal-overlay');
  const modal = document.getElementById('transaction-modal');
  const modalClose = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('cancel-btn');
  const form = document.getElementById('transaction-form');
  const modalTitle = document.getElementById('modal-title');
  const transType = document.getElementById('trans-type');
  const transCategory = document.getElementById('trans-category');

  let editingTransactionId = null;

  function renderTransactions() {
    let transactions = Storage.getTransactions();
    const categories = Storage.getCategories();

    // Apply filters
    const type = typeFilter.value;
    const categoryId = categoryFilter.value;
    const date = dateFilter.value;

    transactions = Utils.filterByType(transactions, type);
    transactions = Utils.filterByCategory(transactions, categoryId);
    if (date) {
      transactions = transactions.filter(t => t.date === date);
    }

    // Populate category filter
    populateCategoryFilter(categories, type);

    if (transactions.length === 0) {
      transactionsBody.innerHTML = '<tr class="empty-row"><td colspan="6">No transactions found</td></tr>';
      return;
    }

    transactionsBody.innerHTML = transactions.map(t => {
      const category = Utils.getCategoryById(categories, t.categoryId);
      const icon = category?.icon || '📦';
      const typeClass = t.type === 'income' ? 'income' : 'expense';
      const sign = t.type === 'income' ? '+' : '-';

      return `
        <tr>
          <td>${Utils.formatDate(t.date)}</td>
          <td>
            <span class="category-cell">
              <span class="category-icon">${icon}</span>
              ${category?.name || 'Unknown'}
            </span>
          </td>
          <td>${Utils.escapeHtml(t.description)}</td>
          <td><span class="type-badge ${typeClass}">${t.type}</span></td>
          <td class="${typeClass}">${sign}${Utils.formatCurrency(t.amount)}</td>
          <td>
            <div class="action-buttons">
              <button class="action-btn edit-btn" data-id="${t.id}">Edit</button>
              <button class="action-btn delete delete-btn" data-id="${t.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
    });
  }

  function populateCategoryFilter(categories, type) {
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    const categoryList = type === 'all' ? [...categories.income, ...categories.expense] : categories[type] || [];
    categoryList.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.icon} ${cat.name}`;
      categoryFilter.appendChild(option);
    });

    if (categoryList.some(c => c.id === currentValue)) {
      categoryFilter.value = currentValue;
    }
  }

  function openModal(transactionId = null) {
    editingTransactionId = transactionId;
    const categories = Storage.getCategories();
    const type = transactionId ? Storage.getTransactions().find(t => t.id === transactionId)?.type || 'expense' : 'expense';

    // Reset form
    form.reset();
    document.getElementById('transaction-id').value = '';
    transType.value = type;

    // Add input event for auto-capitalize on description
    const descriptionInput = document.getElementById('trans-description');
    descriptionInput.addEventListener('blur', function() {
      this.value = Utils.toTitleCase(this.value.trim());
    });

    // Populate categories based on type
    populateCategorySelect(categories, type);

    if (transactionId) {
      modalTitle.textContent = 'Edit Transaction';
      const transaction = Storage.getTransactions().find(t => t.id === transactionId);
      if (transaction) {
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('trans-description').value = transaction.description;
        document.getElementById('trans-amount').value = transaction.amount;
        document.getElementById('trans-date').value = transaction.date;
        transCategory.value = transaction.categoryId;
      }
    } else {
      modalTitle.textContent = 'Add Transaction';
      document.getElementById('trans-date').value = Utils.getToday();
    }

    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }

  function populateCategorySelect(categories, type) {
    transCategory.innerHTML = '';
    const categoryList = categories[type] || [];
    categoryList.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.icon} ${cat.name}`;
      transCategory.appendChild(option);
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    editingTransactionId = null;
  }

  function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      Storage.deleteTransaction(id);
      renderTransactions();
      notifyDataChanged();
      Utils.showNotification('Transaction deleted', 'success');
    }
  }

  function notifyDataChanged() {
    window.dispatchEvent(new CustomEvent('lago-data-changed'));
  }

  // Event listeners
  addTransactionBtn.addEventListener('click', () => openModal());

  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  transType.addEventListener('change', () => {
    const categories = Storage.getCategories();
    populateCategorySelect(categories, transType.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descriptionEl = document.getElementById('trans-description');
    const description = Utils.toTitleCase(descriptionEl.value.trim());

    const transaction = {
      id: editingTransactionId || Utils.generateId(),
      type: transType.value,
      categoryId: transCategory.value,
      description: description,
      amount: parseFloat(document.getElementById('trans-amount').value),
      date: document.getElementById('trans-date').value
    };

    if (editingTransactionId) {
      Storage.updateTransaction(editingTransactionId, transaction);
      Utils.showNotification('Transaction updated', 'success');
    } else {
      Storage.addTransaction(transaction);
      Utils.showNotification('Transaction added', 'success');
    }

    closeModal();
    renderTransactions();
    notifyDataChanged();
  });

  [typeFilter, categoryFilter, dateFilter].forEach(filter => {
    filter.addEventListener('change', renderTransactions);
  });

  typeFilter.addEventListener('change', () => {
    const categories = Storage.getCategories();
    populateCategoryFilter(categories, typeFilter.value);
  });

  // Initial render
  renderTransactions();
});