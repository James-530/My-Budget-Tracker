// Categories page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on categories page
  if (!document.getElementById('income-category-grid')) return;

  const incomeGrid = document.getElementById('income-category-grid');
  const expenseGrid = document.getElementById('expense-category-grid');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const modalOverlay = document.getElementById('category-modal-overlay');
  const modal = document.getElementById('category-modal');
  const modalClose = document.getElementById('category-modal-close');
  const cancelBtn = document.getElementById('category-cancel-btn');
  const form = document.getElementById('category-form');
  const modalTitle = document.getElementById('category-modal-title');

  let editingCategory = null; // { type, id }
  let activeTab = 'income';

  function renderCategories() {
    const categories = Storage.getCategories();

    // Income categories
    if (categories.income.length === 0) {
      incomeGrid.innerHTML = '<p class="empty-state">No income categories yet</p>';
    } else {
      incomeGrid.innerHTML = categories.income.map(cat => `
        <div class="category-card" data-id="${cat.id}">
          <div class="category-icon" style="color: ${cat.color}">${cat.icon}</div>
          <h3 class="category-name">${cat.name}</h3>
          <div class="category-actions">
            <button class="action-btn edit-btn" data-id="${cat.id}" data-type="income">Edit</button>
            <button class="action-btn delete delete-btn" data-id="${cat.id}" data-type="income">Delete</button>
          </div>
        </div>
      `).join('');
    }

    // Expense categories
    if (categories.expense.length === 0) {
      expenseGrid.innerHTML = '<p class="empty-state">No expense categories yet</p>';
    } else {
      expenseGrid.innerHTML = categories.expense.map(cat => `
        <div class="category-card" data-id="${cat.id}">
          <div class="category-icon" style="color: ${cat.color}">${cat.icon}</div>
          <h3 class="category-name">${cat.name}</h3>
          <div class="category-actions">
            <button class="action-btn edit-btn" data-id="${cat.id}" data-type="expense">Edit</button>
            <button class="action-btn delete delete-btn" data-id="${cat.id}" data-type="expense">Delete</button>
          </div>
        </div>
      `).join('');
    }

    // Add event listeners
    document.querySelectorAll('.category-card .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.type, btn.dataset.id));
    });
    document.querySelectorAll('.category-card .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteCategory(btn.dataset.type, btn.dataset.id));
    });
  }

  function openModal(type, categoryId = null) {
    editingCategory = categoryId ? { type, id: categoryId } : { type, id: null };
    const categories = Storage.getCategories();

    form.reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-type').value = type;

    // Add input event for auto-capitalize on category name
    const nameInput = document.getElementById('category-name');
    nameInput.addEventListener('blur', function() {
      this.value = Utils.toTitleCase(this.value.trim());
    });

    if (categoryId) {
      modalTitle.textContent = 'Edit Category';
      const category = categories[type].find(c => c.id === categoryId);
      if (category) {
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-icon').value = category.icon;
        document.getElementById('category-color').value = category.color;
      }
    } else {
      modalTitle.textContent = 'Add Category';
    }

    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    editingCategory = null;
  }

  function deleteCategory(type, id) {
    if (confirm('Are you sure you want to delete this category?')) {
      Storage.deleteCategory(type, id);
      renderCategories();
      notifyDataChanged();
      Utils.showNotification('Category deleted', 'success');
    }
  }

  function notifyDataChanged() {
    window.dispatchEvent(new CustomEvent('lago-data-changed'));
  }

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${btn.dataset.tab}-categories`).classList.add('active');

      activeTab = btn.dataset.tab;
    });
  });

  // Event listeners
  addCategoryBtn.addEventListener('click', () => openModal(activeTab));

  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const categoryNameEl = document.getElementById('category-name');
    const categoryName = Utils.toTitleCase(categoryNameEl.value.trim());

    const category = {
      id: editingCategory.id || Utils.generateId(),
      name: categoryName,
      icon: document.getElementById('category-icon').value,
      color: document.getElementById('category-color').value,
      type: editingCategory.type
    };

    if (editingCategory.id) {
      Storage.updateCategory(editingCategory.type, editingCategory.id, category);
      Utils.showNotification('Category updated', 'success');
    } else {
      Storage.addCategory(category);
      Utils.showNotification('Category added', 'success');
    }

    closeModal();
    renderCategories();
    notifyDataChanged();
  });

  // Initial render
  renderCategories();
});