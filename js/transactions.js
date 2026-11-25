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

  const detailsModalOverlay = document.getElementById('details-modal-overlay');
  const detailsModal = document.getElementById('details-modal');
  const detailsModalClose = document.getElementById('details-modal-close');
  const detailsCloseBtn = document.getElementById('details-close-btn');
  const detailsEditBtn = document.getElementById('details-edit-btn');
  const detailsDeleteBtn = document.getElementById('details-delete-btn');

  let editingTransactionId = null;

  function showDetails(id) {
    const transaction = Storage.getTransactions().find(t => t.id === id);
    if (!transaction) return;

    const categories = Storage.getCategories();
    const category = Utils.getCategoryById(categories, transaction.categoryId);
    const typeClass = transaction.type === 'income' ? 'income' : 'expense';
    const sign = transaction.type === 'income' ? '+' : '-';

    document.getElementById('detail-date').textContent = Utils.formatDate(transaction.date);
    document.getElementById('detail-category').textContent = category?.name || 'Unknown';
    document.getElementById('detail-description').textContent = transaction.description;
    document.getElementById('detail-type').innerHTML = `<span class="type-badge ${typeClass}">${transaction.type}</span>`;
    document.getElementById('detail-amount').textContent = `${sign}${Utils.formatCurrency(transaction.amount)}`;
    document.getElementById('detail-amount').className = `stat-value ${typeClass}`;

    detailsEditBtn.onclick = () => {
      closeDetailsModal();
      openModal(transaction.id);
    };

    detailsDeleteBtn.onclick = () => {
      closeDetailsModal();
      deleteTransaction(transaction.id);
    };

    detailsModalOverlay.classList.add('active');
    detailsModal.classList.add('active');
    Utils.initLucide();
  }

  function closeDetailsModal() {
    detailsModalOverlay.classList.remove('active');
    detailsModal.classList.remove('active');
  }

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
      const mobileList = document.getElementById('mobile-transactions-list');
      if (mobileList) {
        mobileList.innerHTML = '<p class="empty-state">No transactions yet</p>';
      }
      return;
    }

    transactionsBody.innerHTML = transactions.map(t => {
      const category = Utils.getCategoryById(categories, t.categoryId);
      const icon = category ? Utils.getIcon(category.icon, 18) : Utils.getIcon('other', 18);
      const typeClass = t.type === 'income' ? 'income' : 'expense';
      const sign = t.type === 'income' ? '+' : '-';

      return `
        <tr data-id="${t.id}" class="transaction-row">
          <td data-label="Date">${Utils.formatDate(t.date)}</td>
          <td data-label="Category">
            <span class="category-cell">
              <span class="category-icon" style="color: ${category?.color || 'var(--secondary-text)'}">${icon}</span>
              ${category?.name || 'Unknown'}
            </span>
          </td>
          <td data-label="Description" class="description-cell">${Utils.escapeHtml(t.description)}</td>
          <td data-label="Type"><span class="type-badge ${typeClass}">${t.type}</span></td>
          <td data-label="Amount" class="${typeClass}">${sign}${Utils.formatCurrency(t.amount)}</td>
          <td data-label="Actions">
            <div class="action-buttons">
              <button class="action-btn edit-btn" data-id="${t.id}">${Utils.getIcon('edit', 16)}</button>
              <button class="action-btn delete delete-btn" data-id="${t.id}">${Utils.getIcon('delete', 16)}</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const mobileList = document.getElementById('mobile-transactions-list');
    if (mobileList) {
      mobileList.innerHTML = transactions.map(t => {
        const category = Utils.getCategoryById(categories, t.categoryId);
        const icon = category ? Utils.getIcon(category.icon, 20) : Utils.getIcon('other', 20);
        const typeClass = t.type === 'income' ? 'income' : 'expense';
        const sign = t.type === 'income' ? '+' : '-';

        return `
          <div class="transaction-item" data-id="${t.id}" style="cursor: pointer;">
            <div class="transaction-icon" style="color: ${category?.color || 'var(--secondary-text)'}">${icon}</div>
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

      // Add click listener for mobile transaction items to show details
      mobileList.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', (e) => {
          showDetails(item.dataset.id);
        });
      });
    }

    // Add event listeners
    document.querySelectorAll('.transaction-row td:not(:last-child)').forEach(td => {
      td.addEventListener('click', (e) => {
        if (!e.target.closest('.action-buttons')) {
          showDetails(td.closest('tr').dataset.id);
        }
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
    });

    // Initialize Lucide icons for dynamically added content
    Utils.initLucide();
  }

  function populateCategoryFilter(categories, type) {
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    const categoryList = type === 'all' ? [...categories.income, ...categories.expense] : categories[type] || [];
    categoryList.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.name}`;
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
      option.textContent = `${cat.name}`;
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
      Utils.showNotification('Transaction deleted', 'error');
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

  detailsModalClose.addEventListener('click', closeDetailsModal);
  detailsCloseBtn.addEventListener('click', closeDetailsModal);
  detailsModalOverlay.addEventListener('click', closeDetailsModal);

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