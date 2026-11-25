# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# LAGO – Project Instructions

## 1. Project Overview

LAGO is a personal budget tracking web application designed to help users manage their income, expenses, budgets, and financial activities.

The application should have a clean, modern, responsive interface with a dark navy and gold visual theme.

### Main Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js
- Lucide Icons (via CDN)
- LocalStorage for initial data persistence

Do not introduce additional frameworks, libraries, or dependencies unless explicitly requested.

---

## 2. Development Principles

Follow these principles throughout the project:

- Write clean, readable, and maintainable code.
- Keep the implementation beginner-friendly.
- Prioritize simplicity over unnecessary complexity.
- Use meaningful variable, function, class, and file names.
- Avoid overly complicated logic and unnecessary abstractions.
- Do not write the entire application in one file.
- Do not combine unrelated functionalities.
- Reuse existing components and utilities whenever appropriate.
- Avoid duplicated code.
- Follow the existing project architecture.

The code should be understandable by someone learning HTML, CSS, and JavaScript.

---

## 3. File Organization

Keep HTML, CSS, and JavaScript in separate files.

### HTML

- HTML files should contain application structure and semantic markup.
- Do not place large CSS styles or JavaScript logic directly inside HTML files.
- Use external CSS and JavaScript files.
- Keep page-specific HTML organized in separate files.

### CSS

- Keep styling in external CSS files.
- Use variables for reusable colors, spacing, typography, and other design values.
- Separate global styles, layouts, components, and responsive styles when appropriate.
- Avoid unnecessary inline styles.
- Avoid duplicating CSS rules across files.

### JavaScript

- Keep JavaScript in external files.
- Separate functionalities according to their responsibilities.
- Do not place all application logic in one large JavaScript file.
- Use reusable functions for repeated operations.
- Keep functions focused on a single responsibility.
- Use ES Modules when appropriate and maintain consistent import/export patterns.
- Avoid unnecessary global variables.

---

## 4. Project Architecture

Current structure (as implemented):

LAGO/
│
├── index.html # Landing page
│
├── pages/ # Feature pages
│ ├── dashboard.html
│ ├── transactions.html
│ ├── budgets.html
│ ├── categories.html
│ ├── reports.html
│ └── settings.html
│
├── components/ # Shared HTML components
│ └── sidebar.txt # Sidebar navigation (loaded via fetch)
│
├── css/
│ ├── variables.css # CSS custom properties (colors, spacing)
│ ├── layout.css # Page layout, header, main, responsive grid
│ └── components.css # UI components (cards, tables, modals, forms, etc.)
│
├── js/
│ ├── app.js # App initialization, sidebar loading, navigation
│ ├── storage.js # LocalStorage operations and data persistence
│ ├── utils.js # Shared helper functions (formatting, calculations, etc.)
│ │
│ ├── dashboard.js # Dashboard calculations and rendering
│ ├── transactions.js # Transaction management
│ ├── budgets.js # Budget calculations and management
│ ├── categories.js # Category management
│ ├── reports.js # Financial reports and chart generation
│ └── settings.js # Application preferences
│
├── assets/
│ └── (icons, images as needed)
│
├── CLAUDE.md
├── README.md
└── .gitignore

Important:

- This structure is a guideline, not a requirement to create every file immediately.
- Only create files when they are needed.
- Do not create empty files for future features.
- You may recommend structural changes when they improve maintainability, but explain why before implementing them.
- Keep shared components reusable instead of duplicating them across pages.

---

## 5. Component Management

Shared interface elements should be reusable.

Currently implemented:

- **Sidebar** (`components/sidebar.txt`): Loaded via `fetch()` in `app.js`, works on all pages
- **Header**: Inlined in each page (consistent markup across pages)

Planned/optional:

- Header component (extract to `components/header.txt` if needed)
- Modal dialogs (currently inlined in each page that needs them)
- Form elements
- Notification messages (handled via `Utils.showNotification()` in `utils.js`)
- Reusable cards (stat cards, budget cards, category cards via CSS)

Do not copy and paste the same component markup into every page unnecessarily.

If using JavaScript `fetch()` to load shared HTML components, ensure that the implementation works with the chosen local development server (file:// protocol requires a local server for fetch to work).

Avoid introducing a complex component system or framework.

---

## 6. JavaScript Responsibilities

Keep application logic separated by feature.

| File              | Responsibility                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `app.js`          | Application initialization, sidebar loading, active nav link highlighting, mobile menu toggle                  |
| `storage.js`      | LocalStorage operations: transactions, budgets, categories, settings, export/import                            |
| `utils.js`        | Formatting (currency, date), calculations (totals, grouping), helpers (debounce, notifications, HTML escaping) |
| `dashboard.js`    | Dashboard stats, charts (expense doughnut, income vs expense bar), recent transactions                         |
| `transactions.js` | Transaction CRUD, filtering, modal form handling                                                               |
| `budgets.js`      | Budget CRUD, period calculations (weekly/monthly/yearly), progress visualization                               |
| `categories.js`   | Category CRUD (income/expense tabs), modal form handling                                                       |
| `reports.js`      | Period selection, summary cards, pie/line charts, category breakdown table                                     |
| `settings.js`     | Theme (dark/light/system), currency, data export/import/clear                                                  |

Do not put every function into `app.js`.

Use `app.js` only for application initialization and coordinating shared functionality when necessary.

---

## 7. Data Management

- Use LocalStorage for initial data persistence.
- Keep storage operations centralized in `storage.js`.
- Avoid directly repeating LocalStorage operations throughout different feature files.
- Use consistent data structures (see below).
- Validate user input before saving.
- Handle missing or invalid stored data safely (fallback to defaults).
- Do not overwrite existing user data without explicit permission.
- Support exporting and importing application data (implemented in `storage.js` and `settings.js`).

### Data Structures

**Transaction**

```js
{
  id: string,
  type: 'income' | 'expense',
  categoryId: string,
  description: string,
  amount: number,
  date: string // YYYY-MM-DD
}
```

**Budget**

```js
{
  id: string,
  categoryId: string,  // expense category only
  amount: number,
  period: 'weekly' | 'monthly' | 'yearly'
}
```

**Category**

```js
{
  id: string,
  name: string,
  icon: string,    // Lucide icon key (e.g., 'home', 'utensils', 'banknote')
  color: string,   // hex color
  type: 'income' | 'expense'
}
```

**Settings**

```js
{
  theme: 'dark' | 'light' | 'system',
  currency: 'PHP' | 'USD' | 'EUR' | 'GBP'
}
```

Use Philippine Peso (PHP) as the default currency while keeping the application architecture flexible enough to support other currencies (via `Utils.formatCurrency()` and settings).

---

## 8. Design Guidelines

Follow the LAGO visual direction (defined in `css/variables.css`):

- Primary background: `#0B1120`
- Secondary background: `#111827`
- Borders: `#1F2937`
- Hover: `#374151`
- Accent: `#FBBF24` (gold)
- Primary text: `#F9FAFB`
- Secondary text: `#9CA3AF`
- Success: `#22C55E` (green)
- Danger: `#EF4444` (red) — used for expenses, errors, destructive actions

Design requirements:

- Clean and modern interface.
- Consistent spacing and typography.
- Reusable UI components via CSS classes.
- Clear visual hierarchy.
- Readable financial information (currency formatting, color coding).
- Consistent colors and interaction states (hover, active, focus).
- Responsive desktop and mobile layouts.
- Support light and dark themes (implemented via `data-theme` attribute on `<html>`).

Avoid unnecessary visual effects and excessive decorative elements.

---

## 9. Responsive Design

The application must work on desktop, tablet, and mobile devices.

Breakpoint: `768px`

Desktop (≥ 768px):

- Persistent sidebar navigation (fixed, 250px wide).
- Header shifts right (`left: 250px`).
- Main content beside sidebar (`margin-left: 250px`).
- Organized dashboard grids (multi-column).

Mobile (< 768px):

- Collapsible sidebar (slide-in drawer, hidden by default).
- Full-width header with hamburger menu button.
- Sidebar overlay backdrop when open.
- Single-column content layouts.
- Mobile-friendly forms and transaction lists.
- No unnecessary horizontal scrolling.

Use consistent breakpoints and avoid duplicating entire layouts unnecessarily.

---

## 10. Development Workflow

Before implementing any requested feature:

1. Inspect the relevant files.
2. Understand the existing implementation.
3. Identify which files need modification.
4. Check whether existing functions or components can be reused.
5. Implement only the requested feature.
6. Verify the changes using relevant checks.

Development rules:

- Work on one feature or manageable task at a time.
- Do not implement multiple development phases in one request.
- Do not rewrite working code unnecessarily.
- Do not modify unrelated files.
- Do not remove existing functionality without permission.
- Do not install dependencies unless explicitly requested.
- Do not start development servers unless requested.
- Do not execute unnecessary terminal commands.
- Avoid repeatedly inspecting files that have not changed.

If a requested change requires modifying additional files, explain why.

---

## 11. Key Implementation Notes

### Sidebar Loading

- `app.js` loads `components/sidebar.txt` via `fetch()`
- Path resolution handles both root (`index.html`) and `/pages/` subdirectory
- Active nav link set via `setActiveNavLink()` based on current pathname

### Chart.js Usage

- Loaded via CDN in each page that needs it
- Chart instances stored in module-scoped variables for proper cleanup (`destroy()`)
- Responsive: `maintainAspectRatio: false`, containers handle sizing

### Data Change Notification

- Pages dispatch `lago-data-changed` custom event after mutations
- Dashboard and other pages listen for this event to re-render
- Also listens to `storage` event for cross-tab sync

### Theme System

- `settings.js` applies theme via `document.documentElement.setAttribute('data-theme', ...)`
- CSS variables can be overridden with `[data-theme="light"]` selectors if light theme is implemented
- System preference detected via `matchMedia('(prefers-color-scheme: dark)')`

### Currency Formatting

- Centralized in `Utils.formatCurrency(amount, currency)`
- Currency symbol map in utils, defaults to PHP (₱)
- Settings page allows user to change default currency

### Form Validation

- HTML5 validation attributes (`required`, `min`, `step`, `type`)
- Additional sanitization in submit handlers (`Utils.toTitleCase`, `Utils.escapeHtml`)
- Amount inputs use `step="0.01"` and `min="0.01"`

---

## 12. Testing & Verification

Since this is a vanilla JS project without a test framework:

- Open pages in browser via local server (e.g., `npx serve` or VS Code Live Server)
- Test each page's functionality: CRUD operations, filtering, charts, persistence
- Verify LocalStorage data survives page reloads
- Test responsive behavior at different viewport sizes
- Test theme switching and persistence
- Test export/import data functionality
