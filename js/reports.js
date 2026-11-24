// Reports page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on reports page
  if (!document.getElementById('report-income')) return;

  const reportPeriod = document.getElementById('report-period');
  const customDateRange = document.getElementById('custom-date-range');
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  const categoryChart = document.getElementById('category-chart');
  const trendChart = document.getElementById('trend-chart');
  const breakdownBody = document.getElementById('category-breakdown-body');

  let categoryChartInstance = null;
  let trendChartInstance = null;

  function getDateRange() {
    const period = reportPeriod.value;
    const today = new Date();

    switch (period) {
      case 'week':
        return { start: Utils.getWeekStart(), end: Utils.getWeekEnd() };
      case 'month':
        return { start: Utils.getMonthStart(), end: Utils.getMonthEnd() };
      case 'quarter':
        return { start: Utils.getQuarterStart(), end: Utils.getQuarterEnd() };
      case 'year':
        return { start: Utils.getYearStart(), end: Utils.getYearEnd() };
      case 'custom':
        return { start: startDate.value, end: endDate.value };
      default:
        return { start: Utils.getMonthStart(), end: Utils.getMonthEnd() };
    }
  }

  function renderReports() {
    const { start, end } = getDateRange();

    if (!start || !end) return;

    const transactions = Storage.getTransactions();
    const categories = Storage.getCategories();
    const filtered = Utils.filterByDateRange(transactions, start, end);

    const totals = Utils.calculateTotals(filtered);

    // Update summary cards
    document.getElementById('report-income').textContent = Utils.formatCurrency(totals.income);
    document.getElementById('report-expenses').textContent = Utils.formatCurrency(totals.expenses);
    document.getElementById('report-savings').textContent = Utils.formatCurrency(totals.balance);
    document.getElementById('report-savings-rate').textContent = `${totals.savingsRate.toFixed(1)}%`;

    const savingsEl = document.getElementById('report-savings');
    savingsEl.style.color = totals.balance >= 0 ? 'var(--success)' : '#EF4444';

    // Render charts
    renderCategoryChart(filtered, categories);
    renderTrendChart(filtered, start, end);
    renderBreakdownTable(filtered, categories);
  }

  function renderCategoryChart(transactions, categories) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const grouped = Utils.groupByCategory(expenseTransactions, categories.expense);

    const labels = grouped.map(g => g.name);
    const data = grouped.map(g => g.total);
    const colors = grouped.map(g => g.color);

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    if (labels.length === 0) {
      categoryChart.innerHTML = '<p class="empty-state" style="padding: 40px;">No expense data for this period</p>';
      return;
    }

    categoryChartInstance = new Chart(categoryChart, {
      type: 'pie',
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

  function renderTrendChart(transactions, start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    let labels = [];
    let incomeData = [];
    let expenseData = [];

    if (daysDiff <= 31) {
      // Daily for up to 31 days
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }));

        const dayTransactions = transactions.filter(t => t.date === dateStr);
        const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(income);
        expenseData.push(expenses);
      }
    } else if (daysDiff <= 92) {
      // Weekly for up to ~3 months
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
        const weekStart = new Date(d);
        const weekEnd = new Date(d);
        weekEnd.setDate(d.getDate() + 6);
        if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

        labels.push(`${weekStart.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-PH', { day: 'numeric' })}`);

        const weekTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= weekStart && tDate <= weekEnd;
        });
        const income = weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(income);
        expenseData.push(expenses);
      }
    } else {
      // Monthly for longer periods
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        if (monthEnd > endDate) monthEnd.setTime(endDate.getTime());

        labels.push(d.toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }));

        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= monthStart && tDate <= monthEnd;
        });
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(income);
        expenseData.push(expenses);
      }
    }

    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(trendChart, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.3
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

  function renderBreakdownTable(transactions, categories) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const grouped = Utils.groupByCategory(expenseTransactions, categories.expense);

    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (grouped.length === 0) {
      breakdownBody.innerHTML = '<tr class="empty-row"><td colspan="4">No expense data for this period</td></tr>';
      return;
    }

    // Sort by amount descending
    grouped.sort((a, b) => b.total - a.total);

    breakdownBody.innerHTML = grouped.map(g => {
      const percentage = totalExpenses > 0 ? ((g.total / totalExpenses) * 100).toFixed(1) : 0;
      return `
        <tr>
          <td>
            <span class="category-cell">
              <span class="category-icon" style="color: ${g.color}">${g.icon}</span>
              ${g.name}
            </span>
          </td>
          <td>${Utils.formatCurrency(g.total)}</td>
          <td>${percentage}%</td>
          <td>${g.count}</td>
        </tr>
      `;
    }).join('');
  }

  // Event listeners
  reportPeriod.addEventListener('change', () => {
    customDateRange.style.display = reportPeriod.value === 'custom' ? 'flex' : 'none';
    if (reportPeriod.value === 'custom') {
      startDate.value = Utils.getMonthStart();
      endDate.value = Utils.getToday();
    }
    renderReports();
  });

  startDate.addEventListener('change', renderReports);
  endDate.addEventListener('change', renderReports);

  // Initial render
  renderReports();
});