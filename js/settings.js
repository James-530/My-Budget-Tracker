// Settings page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on settings page
  if (!document.getElementById('theme-select')) return;

  const themeSelect = document.getElementById('theme-select');
  const currencySelect = document.getElementById('currency-select');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');
  const clearDataBtn = document.getElementById('clear-data-btn');

  function loadSettings() {
    const settings = Storage.getSettings();
    themeSelect.value = settings.theme || 'dark';
    currencySelect.value = settings.currency || 'PHP';
    applyTheme(settings.theme || 'dark');
  }

  function applyTheme(theme) {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  function saveSettings() {
    const settings = {
      theme: themeSelect.value,
      currency: currencySelect.value
    };
    Storage.saveSettings(settings);
    applyTheme(settings.theme);
    Utils.showNotification('Settings saved', 'success');
  }

  function exportData() {
    const data = Storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lago-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showNotification('Data exported successfully', 'success');
  }

  function importData() {
    importFile.click();
  }

  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Storage.importData(data)) {
          Utils.showNotification('Data imported successfully', 'success');
          window.dispatchEvent(new CustomEvent('lago-data-changed'));
          loadSettings(); // Reload settings in case they changed
        } else {
          Utils.showNotification('Import failed', 'error');
        }
      } catch (err) {
        console.error('Import error:', err);
        Utils.showNotification('Invalid file format', 'error');
      }
      // Reset file input
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      if (confirm('This will permanently delete all transactions, budgets, categories, and settings. Continue?')) {
        Storage.clearAllData();
        Utils.showNotification('All data cleared', 'error');
        window.dispatchEvent(new CustomEvent('lago-data-changed'));
        loadSettings();
      }
    }
  }

  // Event listeners
  themeSelect.addEventListener('change', saveSettings);
  currencySelect.addEventListener('change', saveSettings);
  exportBtn.addEventListener('click', exportData);
  importBtn.addEventListener('click', importData);
  importFile.addEventListener('change', handleImport);
  clearDataBtn.addEventListener('click', clearAllData);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const settings = Storage.getSettings();
    if (settings.theme === 'system') {
      applyTheme('system');
    }
  });

  // Initial load
  loadSettings();
  Utils.initLucide();
});