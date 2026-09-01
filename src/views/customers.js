// ----------------------------------------------------
// Amja Travels CRM - Customers Manager (customers.js)
// ----------------------------------------------------

import { 
  getCustomers, 
  saveCustomer, 
  deleteCustomer,
  getGroups
} from '../db.js';

let customerList = [];
let groupList = [];
let currentFilter = 'all';
let currentSearch = '';

export default {
  async render(container) {
    customerList = await getCustomers();
    groupList = await getGroups();
    
    // Apply filters
    let filtered = customerList.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                          c.phone.includes(currentSearch) || 
                          c.email.toLowerCase().includes(currentSearch.toLowerCase());
      
      if (currentFilter === 'all') return matchSearch;
      if (currentFilter === 'hajj') return matchSearch && c.packageType === 'hajj';
      if (currentFilter === 'umrah') return matchSearch && c.packageType === 'umrah';
      if (currentFilter === 'active') return matchSearch && c.status === 'active';
      if (currentFilter === 'completed') return matchSearch && c.status === 'completed';
      if (currentFilter === 'cancelled') return matchSearch && c.status === 'cancelled';
      return matchSearch;
    });

    // Render HTML shell
    container.innerHTML = `
      <div class="view-header-actions">
        <div class="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="customer-search" placeholder="Search by name, phone or email..." value="${currentSearch}">
        </div>

        <div class="filter-actions">
          <select id="customer-filter" class="form-control" style="width: 160px; margin-bottom: 0; padding: 0.5rem 0.75rem;">
            <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>All Packages</option>
            <option value="hajj" ${currentFilter === 'hajj' ? 'selected' : ''}>Hajj Packages</option>
            <option value="umrah" ${currentFilter === 'umrah' ? 'selected' : ''}>Umrah Packages</option>
            <option value="active" ${currentFilter === 'active' ? 'selected' : ''}>Active Bookings</option>
            <option value="completed" ${currentFilter === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${currentFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>

          <button class="btn btn-primary" id="btn-add-customer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Customer
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Package</th>
              <th>Travel Date</th>
              <th>Financials</th>
              <th>Documents</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                  No customers found matching the criteria.
                </td>
              </tr>
            ` : filtered.map(c => {
              const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              const group = groupList.find(g => g.id === c.groupId);
              const unpaid = c.price - c.paid;

              return `
                <tr>
                  <td>
                    <div class="customer-avatar-name">
                      <div class="avatar-circle">${initials}</div>
                      <div class="customer-info-detail">
                        <span class="customer-name">${c.name}</span>
                        <span class="customer-meta">${c.phone} | ${c.email}</span>
                        ${(() => {
                          const sr = c.specialRequests || {};
                          const tags = [];
                          if (sr.wheelchair) tags.push('<span class="badge-sr" title="Wheelchair Required">♿ Wheelchair</span>');
                          if (sr.diet) tags.push('<span class="badge-sr" title="Special Diabetic/Diet">🥗 Diet</span>');
                          if (sr.elderly) tags.push('<span class="badge-sr" title="Senior Citizen Care">🧓 Elderly</span>');
                          if (sr.groundFloor) tags.push('<span class="badge-sr" title="Ground Floor Room">🛏️ Low Floor</span>');
                          if (sr.cot) tags.push('<span class="badge-sr" title="Child/Infant Cot">👶 Cot</span>');
                          if (sr.notes) tags.push(`<span class="badge-sr" title="${sr.notes}">📝 ${sr.notes.length > 18 ? sr.notes.substring(0, 16) + '...' : sr.notes}</span>`);
                          return tags.length > 0 ? `<div style="display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.3rem;">${tags.join('')}</div>` : '';
                        })()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                      <span class="badge badge-${c.packageType}">${c.packageType}</span>
                      ${group ? `<span style="font-size: 0.75rem; color: var(--primary); font-weight: 500;">Group: ${group.name}</span>` : '<span style="font-size: 0.75rem; color: var(--text-light);">No Group</span>'}
                    </div>
                  </td>
                  <td>
                    <div class="customer-info-detail">
                      <span style="font-weight: 500;">${c.departureDate || 'Not set'}</span>
                    </div>
                  </td>
                  <td>
                    <div class="customer-info-detail">
                      <span style="font-weight: 600;">LKR ${c.price.toLocaleString()}</span>
                      <span style="font-size: 0.75rem; color: ${unpaid <= 0 ? 'var(--status-active)' : 'var(--text-muted)'}; font-weight: 500;">
                        ${unpaid <= 0 ? 'Paid' : `Due: LKR ${unpaid.toLocaleString()}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="document-checklist">
                      <span class="doc-tag ${c.documents?.passport ? 'verified' : ''}" title="Passport">Pass</span>
                      <span class="doc-tag ${c.documents?.photo ? 'verified' : ''}" title="Photo">Photo</span>
                      <span class="doc-tag ${c.documents?.visa ? 'verified' : ''}" title="Visa">Visa</span>
                      <span class="doc-tag ${c.documents?.vaccination ? 'verified' : ''}" title="Vaccination">Vacc</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-${c.status || 'active'}">${c.status || 'active'}</span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.5rem;">
                      <button class="btn btn-secondary btn-edit-customer" data-id="${c.id}" style="padding: 0.4rem 0.75rem; font-size: 0.75rem;">Edit</button>
                      ${c.status !== 'cancelled' ? `
                        <button class="btn btn-danger btn-cancel-booking" data-id="${c.id}" style="padding: 0.4rem 0.75rem; font-size: 0.75rem;">Cancel</button>
                      ` : `
                        <button class="btn btn-secondary btn-reactivate-booking" data-id="${c.id}" style="padding: 0.4rem 0.75rem; font-size: 0.75rem; color: var(--status-active);">Activate</button>
                      `}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    // Search
    const searchInput = container.querySelector('#customer-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        this.render(container);
      });
    }

    // Filter
    const filterSelect = container.querySelector('#customer-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        this.render(container);
      });
    }

    // Add Customer Trigger
    const addBtn = container.querySelector('#btn-add-customer');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openCustomerModal(container);
      });
    }

    // Edit Customer Trigger
    const editBtns = container.querySelectorAll('.btn-edit-customer');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const customer = customerList.find(c => c.id === id);
        if (customer) {
          this.openCustomerModal(container, customer);
        }
      });
    });

    // Cancel Booking Trigger
    const cancelBtns = container.querySelectorAll('.btn-cancel-booking');
    cancelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openCancelModal(container, id);
      });
    });

    // Reactivate Booking Trigger
    const reactivateBtns = container.querySelectorAll('.btn-reactivate-booking');
    reactivateBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const customer = customerList.find(c => c.id === id);
        if (customer) {
          customer.status = 'active';
          customer.cancellationReason = '';
          await saveCustomer(customer);
          window.showNotification('Booking reactivated successfully!', 'success');
          this.render(container);
        }
      });
    });
  },

  // Modal: Create/Edit Customer Form
  openCustomerModal(container, customer = null) {
    const isEdit = !!customer;
    
    // Create modal element
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'customer-modal';
    
    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Edit Customer Details' : 'Register New Customer'}</h3>
          <button class="modal-close" id="btn-close-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="customer-form">
          <div class="modal-body">
            <div class="form-group">
              <label for="c-name">Full Name *</label>
              <input type="text" id="c-name" class="form-control" value="${customer?.name || ''}" required placeholder="Mohammed Irfan">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="c-phone">Phone Number *</label>
                <input type="tel" id="c-phone" class="form-control" value="${customer?.phone || ''}" required placeholder="+94 77 123 4567">
              </div>
              <div class="form-group">
                <label for="c-email">Email Address</label>
                <input type="email" id="c-email" class="form-control" value="${customer?.email || ''}" placeholder="irfan@example.com">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="c-package">Package Type *</label>
                <select id="c-package" class="form-control" required>
                  <option value="hajj" ${customer?.packageType === 'hajj' ? 'selected' : ''}>Hajj Package</option>
                  <option value="umrah" ${customer?.packageType === 'umrah' ? 'selected' : '' || !customer}>Umrah Package</option>
                </select>
              </div>
              <div class="form-group">
                <label for="c-group">Assign Travel Group</label>
                <select id="c-group" class="form-control">
                  <option value="">-- No Group assigned --</option>
                  ${groupList.map(g => `
                    <option value="${g.id}" ${customer?.groupId === g.id ? 'selected' : ''}>${g.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="c-price">Total Price (LKR) *</label>
                <input type="number" id="c-price" class="form-control" value="${customer?.price || ''}" min="0" required placeholder="850000">
              </div>
              <div class="form-group">
                <label for="c-paid">Amount Paid (LKR) *</label>
                <input type="number" id="c-paid" class="form-control" value="${customer?.paid || 0}" min="0" required placeholder="200000">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="c-depdate">Departure Date</label>
                <input type="date" id="c-depdate" class="form-control" value="${customer?.departureDate || ''}">
              </div>
              <div class="form-group">
                <label for="c-status">Status</label>
                <select id="c-status" class="form-control">
                  <option value="active" ${customer?.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="completed" ${customer?.status === 'completed' ? 'selected' : ''}>Completed</option>
                  <option value="cancelled" ${customer?.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </div>
            </div>

            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">Document Status</label>
            <div class="doc-form-grid">
              <label class="doc-form-checkbox">
                <input type="checkbox" id="doc-passport" ${customer?.documents?.passport ? 'checked' : ''}> Passport Submitted
              </label>
              <label class="doc-form-checkbox">
                <input type="checkbox" id="doc-photo" ${customer?.documents?.photo ? 'checked' : ''}> Photos Submitted
              </label>
              <label class="doc-form-checkbox">
                <input type="checkbox" id="doc-visa" ${customer?.documents?.visa ? 'checked' : ''}> Visa Approved
              </label>
              <label class="doc-form-checkbox">
                <input type="checkbox" id="doc-vaccination" ${customer?.documents?.vaccination ? 'checked' : ''}> Vaccination Complete
              </label>
            </div>

            <!-- Special Requests Section -->
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-top: 1rem; margin-bottom: 0.5rem;">
              Special Requests & Pilgrim Accessibility
            </label>
            <div class="doc-form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
              <label class="doc-form-checkbox">
                <input type="checkbox" id="sr-wheelchair" ${customer?.specialRequests?.wheelchair ? 'checked' : ''}> ♿ Wheelchair Required
              </label>
              <label class="doc-form-checkbox">
                <input type="checkbox" id="sr-diet" ${customer?.specialRequests?.diet ? 'checked' : ''}> 🥗 Diabetic / Special Diet
              </label>
              <label class="doc-form-checkbox">
                <input type="checkbox" id="sr-elderly" ${customer?.specialRequests?.elderly ? 'checked' : ''}> 🧓 Senior Citizen Care
              </label>
              <label class="doc-form-checkbox">
                <input type="checkbox" id="sr-groundfloor" ${customer?.specialRequests?.groundFloor ? 'checked' : ''}> 🛏️ Low / Ground Floor Room
              </label>
              <label class="doc-form-checkbox">
                <input type="checkbox" id="sr-cot" ${customer?.specialRequests?.cot ? 'checked' : ''}> 👶 Child / Infant Cot
              </label>
            </div>
            <div class="form-group" style="margin-top: 0.75rem;">
              <label for="sr-notes" style="font-size: 0.8rem;">Additional Special Instructions / Medical Notes</label>
              <input type="text" id="sr-notes" class="form-control" value="${customer?.specialRequests?.notes || ''}" placeholder="e.g. Needs assistance boarding flight, allergic to penicillin">
            </div>
            
            ${customer?.cancellationReason ? `
              <div class="form-group">
                <label>Cancellation Reason</label>
                <div style="background-color: var(--status-cancelled-bg); color: var(--status-cancelled); padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 550;">
                  ${customer.cancellationReason}
                </div>
              </div>
            ` : ''}

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Register Customer'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Event listeners inside modal
    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);

    // Submit handler
    modalOverlay.querySelector('#customer-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: modalOverlay.querySelector('#c-name').value.trim(),
        phone: modalOverlay.querySelector('#c-phone').value.trim(),
        email: modalOverlay.querySelector('#c-email').value.trim(),
        packageType: modalOverlay.querySelector('#c-package').value,
        groupId: modalOverlay.querySelector('#c-group').value || null,
        price: parseFloat(modalOverlay.querySelector('#c-price').value),
        paid: parseFloat(modalOverlay.querySelector('#c-paid').value),
        departureDate: modalOverlay.querySelector('#c-depdate').value || null,
        status: modalOverlay.querySelector('#c-status').value,
        documents: {
          passport: modalOverlay.querySelector('#doc-passport').checked,
          photo: modalOverlay.querySelector('#doc-photo').checked,
          visa: modalOverlay.querySelector('#doc-visa').checked,
          vaccination: modalOverlay.querySelector('#doc-vaccination').checked
        },
        specialRequests: {
          wheelchair: modalOverlay.querySelector('#sr-wheelchair').checked,
          diet: modalOverlay.querySelector('#sr-diet').checked,
          elderly: modalOverlay.querySelector('#sr-elderly').checked,
          groundFloor: modalOverlay.querySelector('#sr-groundfloor').checked,
          cot: modalOverlay.querySelector('#sr-cot').checked,
          notes: modalOverlay.querySelector('#sr-notes').value.trim()
        }
      };

      if (isEdit) {
        payload.id = customer.id;
        payload.cancellationReason = customer.cancellationReason || '';
      }

      try {
        await saveCustomer(payload);
        window.showNotification(isEdit ? 'Customer updated successfully!' : 'Customer registered successfully!', 'success');
        closeModal();
        this.render(container);
      } catch (err) {
        window.showNotification('Error saving customer: ' + err.message, 'error');
      }
    });
  },

  // Modal: Cancel Booking Reason Input
  openCancelModal(container, customerId) {
    const customer = customerList.find(c => c.id === customerId);
    if (!customer) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'cancel-modal';

    modalOverlay.innerHTML = `
      <div class="modal-content" style="width: 420px;">
        <div class="modal-header">
          <h3>Cancel Booking</h3>
          <button class="modal-close" id="btn-close-cancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="cancel-form">
          <div class="modal-body">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
              Are you sure you want to cancel the booking for <strong>${customer.name}</strong>? Please provide a reason below.
            </p>
            <div class="form-group">
              <label for="cancel-reason">Cancellation Reason *</label>
              <textarea id="cancel-reason" class="form-control" required placeholder="Customer requested cancellation due to medical emergencies/visa delay. Refund of LKR 150,000 processed."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-abort-cancel">Close</button>
            <button type="submit" class="btn btn-danger">Confirm Cancellation</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-cancel').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-abort-cancel').addEventListener('click', closeModal);

    modalOverlay.querySelector('#cancel-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const reason = modalOverlay.querySelector('#cancel-reason').value.trim();

      try {
        customer.status = 'cancelled';
        customer.cancellationReason = reason;
        await saveCustomer(customer);
        window.showNotification(`Booking for ${customer.name} cancelled.`, 'warning');
        closeModal();
        this.render(container);
      } catch (err) {
        window.showNotification('Error: ' + err.message, 'error');
      }
    });
  }
};
