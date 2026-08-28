// ----------------------------------------------------
// Amja Travels CRM - Expenses Manager (expenses.js)
// ----------------------------------------------------

import { 
  getExpenses, 
  saveExpense, 
  deleteExpense 
} from '../db.js';

let expenseList = [];
const PRE_CATEGORIES = ['Visa Processing', 'Documentation & Photos', 'Vaccinations', 'Air Tickets', 'Office & Admin', 'Courier & Logistics', 'Other'];
const POST_CATEGORIES = ['Hotel Accomodation (Mecca)', 'Hotel Accomodation (Medina)', 'Local Transport (Bus/SUV)', 'Group Meals & Catering', 'Tour Guides & Ziyarat', 'Mina Tents Setup', 'Zamzam & Gifts', 'Other'];

export default {
  async render(container) {
    expenseList = await getExpenses();

    // Separate expenses
    const preExpenses = expenseList.filter(e => e.type === 'pre');
    const postExpenses = expenseList.filter(e => e.type === 'post');

    // Totals
    const totalPre = preExpenses.reduce((sum, e) => sum + e.cost, 0);
    const totalPost = postExpenses.reduce((sum, e) => sum + e.cost, 0);

    container.innerHTML = `
      <div class="view-header-actions" style="margin-bottom: 2rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">Expense Logger</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Manage and track and segregate pre-departure and on-tour expenses.</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary" id="btn-add-pre-expense">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Record Pre-Departure
          </button>
          <button class="btn btn-primary" id="btn-add-post-expense">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Record On-Tour
          </button>
        </div>
      </div>

      <div class="expense-layout">
        <!-- PRE-DEPARTURE COLUMN -->
        <div class="card">
          <div class="card-header" style="border-bottom: 2px solid var(--secondary); padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <div>
              <h2>Pre-Departure Expenses</h2>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Documentation, visa, vaccinations, etc.</span>
            </div>
            <span style="font-size: 1.25rem; font-weight: 800; color: var(--accent-gold);">
              LKR ${totalPre.toLocaleString()}
            </span>
          </div>

          <div class="expense-log expense-pre">
            ${preExpenses.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 3rem; font-size: 0.85rem;">
                No pre-departure expenses recorded yet.
              </div>
            ` : preExpenses.map(e => `
              <div class="expense-item">
                <div class="expense-item-info">
                  <span class="expense-item-desc">${e.description}</span>
                  <span class="expense-item-meta">${e.category} | ${e.date || 'No Date'}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span class="expense-item-value">LKR ${e.cost.toLocaleString()}</span>
                  <button class="expense-item-delete" data-id="${e.id}" title="Delete Expense">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- POST-DEPARTURE COLUMN -->
        <div class="card">
          <div class="card-header" style="border-bottom: 2px solid var(--status-cancelled); padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <div>
              <h2>On-Tour / Post-Departure</h2>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Hotels, transport, meals, local fees, etc.</span>
            </div>
            <span style="font-size: 1.25rem; font-weight: 800; color: var(--status-cancelled);">
              LKR ${totalPost.toLocaleString()}
            </span>
          </div>

          <div class="expense-log expense-post">
            ${postExpenses.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 3rem; font-size: 0.85rem;">
                No on-tour/post-departure expenses recorded yet.
              </div>
            ` : postExpenses.map(e => `
              <div class="expense-item">
                <div class="expense-item-info">
                  <span class="expense-item-desc">${e.description}</span>
                  <span class="expense-item-meta">${e.category} | ${e.date || 'No Date'}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span class="expense-item-value">LKR ${e.cost.toLocaleString()}</span>
                  <button class="expense-item-delete" data-id="${e.id}" title="Delete Expense">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    // Record Pre-Departure Action
    container.querySelector('#btn-add-pre-expense').addEventListener('click', () => {
      this.openExpenseModal(container, 'pre');
    });

    // Record Post-Departure Action
    container.querySelector('#btn-add-post-expense').addEventListener('click', () => {
      this.openExpenseModal(container, 'post');
    });

    // Delete Expense Action
    const deleteBtns = container.querySelectorAll('.expense-item-delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this expense record?')) {
          try {
            await deleteExpense(id);
            window.showNotification('Expense record removed.', 'warning');
            this.render(container);
          } catch (err) {
            window.showNotification('Error deleting expense: ' + err.message, 'error');
          }
        }
      });
    });
  },

  // Modal: Record Expense
  openExpenseModal(container, type) {
    const categories = type === 'pre' ? PRE_CATEGORIES : POST_CATEGORIES;
    const typeLabel = type === 'pre' ? 'Pre-Departure Expense' : 'On-Tour / Post-Departure Expense';

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'expense-modal';

    modalOverlay.innerHTML = `
      <div class="modal-content" style="width: 480px;">
        <div class="modal-header">
          <h3>Record ${typeLabel}</h3>
          <button class="modal-close" id="btn-close-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="expense-form">
          <div class="modal-body">
            <div class="form-group">
              <label for="exp-desc">Description / Particulars *</label>
              <input type="text" id="exp-desc" class="form-control" required placeholder="e.g. Visa stamping fee for Irfan group">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="exp-cat">Category *</label>
                <select id="exp-cat" class="form-control" required>
                  <option value="">-- Choose Category --</option>
                  ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="exp-cost">Cost (LKR) *</label>
                <input type="number" id="exp-cost" class="form-control" required min="1" placeholder="75000">
              </div>
            </div>

            <div class="form-group">
              <label for="exp-date">Expense Date *</label>
              <input type="date" id="exp-date" class="form-control" required value="${new Date().toISOString().substring(0, 10)}">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Record Expense</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);

    modalOverlay.querySelector('#expense-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        type: type,
        description: modalOverlay.querySelector('#exp-desc').value.trim(),
        category: modalOverlay.querySelector('#exp-cat').value,
        cost: parseFloat(modalOverlay.querySelector('#exp-cost').value),
        date: modalOverlay.querySelector('#exp-date').value
      };

      try {
        await saveExpense(payload);
        window.showNotification('Expense recorded successfully!', 'success');
        closeModal();
        this.render(container);
      } catch (err) {
        window.showNotification('Error recording expense: ' + err.message, 'error');
      }
    });
  }
};
