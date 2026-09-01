// ----------------------------------------------------
// Amja Travels CRM - Core Application Bootstrapper (main.js)
// ----------------------------------------------------

import './style.css';
import { initializeDatabase, onDataChanged, isFirebaseConnected } from './db.js';

// Import Views
import dashboardView from './views/dashboard.js';
import customersView from './views/customers.js';
import groupsView from './views/groups.js';
import itineraryView from './views/itinerary.js';
import flightsView from './views/flights.js';
import invoicesView from './views/invoices.js';
import expensesView from './views/expenses.js';
import reportsView from './views/reports.js';

// Global Router State
let activeViewName = 'dashboard';
const views = {
  dashboard: dashboardView,
  customers: customersView,
  groups: groupsView,
  itinerary: itineraryView,
  flights: flightsView,
  invoices: invoicesView,
  expenses: expensesView,
  reports: reportsView
};

// Global Notifications Toast Manager
window.showNotification = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icon selection
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-msg" style="flex-grow: 1; padding-right: 0.5rem;">${message}</span>
    <button class="toast-close" style="background: transparent; border: none; color: var(--text-light); cursor: pointer; padding: 0.2rem; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: var(--transition-fast);">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  container.appendChild(toast);

  // Close button click handler
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  // Automatically fade and remove toast (fallback auto-dismiss)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'fadeOutToast 0.3s ease-in forwards';
      toast.addEventListener('animationend', () => toast.remove());
    }
  }, 4500);
};



// View Switcher Router Core
async function navigateTo(viewName) {
  activeViewName = viewName;
  const viewObj = views[viewName];
  if (!viewObj) return;

  // Update navbar items CSS active state
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch display panel visibility
  document.querySelectorAll('.view-panel').forEach(panel => {
    if (panel.id === `panel-${viewName}`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Update Page Headers
  const titleEl = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');
  
  if (viewName === 'dashboard') {
    titleEl.innerText = 'Dashboard Overview';
    subtitleEl.innerText = "Welcome back! Here's the current overview of Amja Travels.";
  } else if (viewName === 'customers') {
    titleEl.innerText = 'Customer Directory';
    subtitleEl.innerText = 'Manage pilgrim bookings, travel status, and record documents submission.';
  } else if (viewName === 'groups') {
    titleEl.innerText = 'Tour Groups & Cohorts';
    subtitleEl.innerText = 'Establish groups of pilgrims, set pricing models, and coordinate tour capacity.';
  } else if (viewName === 'itinerary') {
    titleEl.innerText = 'Daily Itinerary & Timetable Planner';
    subtitleEl.innerText = 'Build chronological daily schedules, apply 1-click templates, and generate prayer timetables.';
  } else if (viewName === 'flights') {
    titleEl.innerText = 'Flights & Ground Transport Logistics';
    subtitleEl.innerText = 'Track airline group bookings, PNRs, airport pickups, and Haramain bullet train transfers.';
  } else if (viewName === 'invoices') {
    titleEl.innerText = 'Invoices & Payment Receipts';
    subtitleEl.innerText = 'Track pilgrim billing summaries, balances due, and generate official payment receipts.';
  } else if (viewName === 'expenses') {
    titleEl.innerText = 'Expenses & Financial Logs';
    subtitleEl.innerText = 'Segregate pre-departure processing costs from on-tour accommodation/travel expenses.';
  } else if (viewName === 'reports') {
    titleEl.innerText = 'Reports & Analytics';
    subtitleEl.innerText = 'Analyze pilgrim enrollments, active cohorts, cancellations, and financial settlements.';
  }

  // Render content
  const panel = document.getElementById(`panel-${viewName}`);
  if (panel) {
    panel.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 3rem;">Loading panel data...</div>`;
    await viewObj.render(panel);
  }
}

// Re-render currently active view panel (called on DB events)
async function reloadActiveView() {
  const panel = document.getElementById(`panel-${activeViewName}`);
  const viewObj = views[activeViewName];
  if (panel && viewObj) {
    await viewObj.render(panel);
  }
}

// App Initialization Bootstrapper
async function initializeApp() {
  // Bind Sidebar Menu Clicks
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      navigateTo(view);
    });
  });



  // Bind Header Quick Actions Menu Trigger
  const quickActionsBtn = document.getElementById('btn-quick-add');
  const quickMenu = document.getElementById('quick-add-menu');
  
  if (quickActionsBtn && quickMenu) {
    quickActionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickMenu.style.display = quickMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      quickMenu.style.display = 'none';
    });

    // Handle Quick Action Items
    quickMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const action = link.getAttribute('data-action');
        
        if (action === 'new-customer') {
          // Switch to customers page first, then trigger modal
          await navigateTo('customers');
          customersView.openCustomerModal(document.getElementById('panel-customers'));
        } else if (action === 'new-group') {
          // Switch to groups directory, then trigger group create modal
          await navigateTo('groups');
          // Set to directory tab
          document.getElementById('tab-group-directory').click();
          groupsView.openGroupModal(document.getElementById('panel-groups'));
        } else if (action === 'new-expense') {
          // Switch to expenses, then open default pre-departure log modal
          await navigateTo('expenses');
          expensesView.openExpenseModal(document.getElementById('panel-expenses'), 'pre');
        }
      });
    });
  }

  // Boot Database Engine silently in background
  await initializeDatabase();

  // Subscribe to DB updates (Firestore syncs or Local writes) to refresh active panel in real time
  onDataChanged(() => {
    reloadActiveView();
  });

  // Load Initial Dashboard
  await navigateTo('dashboard');
}

// Run bootstrapper
document.addEventListener('DOMContentLoaded', initializeApp);
