// ----------------------------------------------------
// Amja Travels CRM - Tour Cohorts Management (groups.js)
// ----------------------------------------------------

import { 
  getGroups, 
  saveGroup, 
  deleteGroup, 
  getCustomers, 
  saveCustomer 
} from '../db.js';

let groupList = [];
let customerList = [];

export default {
  async render(container) {
    groupList = await getGroups();
    customerList = await getCustomers();

    // Aggregate statistics
    const totalGroups = groupList.length;
    const hajjGroups = groupList.filter(g => g.type === 'hajj').length;
    const umrahGroups = groupList.filter(g => g.type === 'umrah').length;
    
    let totalTargetCap = 0;
    let totalEnrolled = 0;
    groupList.forEach(g => {
      totalTargetCap += (g.capacity || 20);
      const members = customerList.filter(c => c.groupId === g.id && c.status !== 'cancelled');
      totalEnrolled += members.length;
    });

    container.innerHTML = `
      <!-- TOP COHORTS KPIS -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Active Tour Cohorts</span>
            <h3 class="stat-number">${totalGroups} Groups</h3>
            <div class="stat-sub">${hajjGroups} Hajj &bull; ${umrahGroups} Umrah</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Total Enrolled Pilgrims</span>
            <h3 class="stat-number" style="color: #059669;">${totalEnrolled} Pax</h3>
            <div class="stat-sub">${totalTargetCap > 0 ? Math.round((totalEnrolled / totalTargetCap) * 100) : 0}% Target Occupancy</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Available Seats</span>
            <h3 class="stat-number" style="color: #d97706;">${Math.max(0, totalTargetCap - totalEnrolled)} Seats</h3>
            <div class="stat-sub">Across active cohorts</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Itineraries Configured</span>
            <h3 class="stat-number">${groupList.filter(g => (g.itinerary || []).length > 0).length} Ready</h3>
            <div class="stat-sub">Daily schedules active</div>
          </div>
        </div>

      </div>

      <!-- FILTER & ACTIONS TOOLBAR -->
      <div class="filter-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">
            Tour Cohorts & Departure Packages
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-goto-itinerary-tab" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
              Open Itinerary Planner
            </button>
            <button class="btn btn-primary" id="btn-create-group" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Create Tour Cohort
            </button>
          </div>

        </div>
      </div>

      <!-- GROUP CARDS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
        ${groupList.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
            <h3>No Tour Cohorts Established Yet</h3>
            <p>Click "+ Create Tour Cohort" to establish your first Hajj or Umrah departure group.</p>
          </div>
        ` : groupList.map(group => {
          const members = customerList.filter(c => c.groupId === group.id && c.status !== 'cancelled');
          const targetCapacity = group.capacity || 20;
          const occupancyPercent = Math.min(100, Math.round((members.length / targetCapacity) * 100));
          const itineraryDays = (group.itinerary || []).length;
          const totalRev = members.reduce((s, c) => s + (c.price || 0), 0);

          return `
            <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                
                <!-- Group Card Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">
                  <div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0 0 2px 0;">${group.name}</h3>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                      Leader: <strong>${group.guide || 'Assigned Sheikh'}</strong>
                    </div>
                  </div>
                  <span class="badge ${group.type === 'umrah' ? 'badge-umrah' : 'badge-hajj'}">
                    ${(group.type || 'hajj').toUpperCase()}
                  </span>
                </div>

                <!-- Group Meta Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; background: #f8fafc; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 0.85rem; font-size: 0.78rem;">
                  <div>
                    <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase;">Departure</span>
                    <div style="font-weight: 600; color: var(--text-main);">${group.departureDate || 'TBD'}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase;">Return Date</span>
                    <div style="font-weight: 600; color: var(--text-main);">${group.arrivalDate || 'TBD'}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase;">Package Price</span>
                    <div style="font-weight: 700; color: #065f46; font-family: monospace;">LKR ${(group.basePrice || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase;">Group Revenue</span>
                    <div style="font-weight: 700; color: #059669; font-family: monospace;">LKR ${totalRev.toLocaleString()}</div>
                  </div>
                </div>

                <!-- Capacity Progress Bar -->
                <div style="margin-bottom: 0.85rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.3rem;">
                    <span style="color: var(--text-muted); font-weight: 550;">Enrollment Capacity:</span>
                    <span style="font-weight: 700; color: #065f46;">${members.length} / ${targetCapacity} Pax (${occupancyPercent}%)</span>
                  </div>
                  <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${occupancyPercent}%; background: ${occupancyPercent >= 80 ? '#059669' : '#3b82f6'}; border-radius: 3px;"></div>
                  </div>
                </div>

                <!-- Enrolled Pilgrims List -->
                <div style="margin-bottom: 0.85rem;">
                  <div style="font-size: 0.72rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.03em;">
                    Enrolled Travelers (${members.length}):
                  </div>
                  ${members.length === 0 ? `
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No pilgrims assigned to this cohort yet.</div>
                  ` : `
                    <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                      ${members.map(m => `
                        <span class="badge" style="background: #ffffff; border: 1px solid #cbd5e1; font-size: 0.72rem;">
                          ${m.name}
                        </span>
                      `).join('')}
                    </div>
                  `}
                </div>

              </div>

              <!-- Card Action Buttons -->
              <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                <button class="btn btn-secondary btn-plan-itinerary" data-group-id="${group.id}" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px; color: #065f46; font-weight: 600;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                  ${itineraryDays > 0 ? `Itinerary (${itineraryDays} Days)` : 'Build Itinerary'} ➔
                </button>

                <div style="display: flex; gap: 0.35rem;">
                  <button class="btn btn-secondary btn-edit-group" data-id="${group.id}" style="font-size: 0.72rem; padding: 3px 8px;">Edit</button>
                  <button class="btn btn-secondary btn-delete-group" data-id="${group.id}" style="font-size: 0.72rem; padding: 3px 8px; color: #dc2626;">Delete</button>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    // Quick link to itinerary planner tab
    const gotoItinerary = container.querySelector('#btn-goto-itinerary-tab');
    if (gotoItinerary) {
      gotoItinerary.addEventListener('click', () => {
        const itinTab = document.querySelector('[data-view="itinerary"]');
        if (itinTab) itinTab.click();
      });
    }

    container.querySelectorAll('.btn-plan-itinerary').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itinTab = document.querySelector('[data-view="itinerary"]');
        if (itinTab) itinTab.click();
      });
    });

    // Create Group Modal Trigger
    const btnCreateGroup = container.querySelector('#btn-create-group');
    if (btnCreateGroup) {
      btnCreateGroup.addEventListener('click', () => {
        this.openGroupModal(container);
      });
    }

    // Edit Group Trigger
    container.querySelectorAll('.btn-edit-group').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const groupId = e.currentTarget.getAttribute('data-id');
        const group = groupList.find(g => g.id === groupId);
        if (group) this.openGroupModal(container, group);
      });
    });

    // Delete Group Trigger
    container.querySelectorAll('.btn-delete-group').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const groupId = e.currentTarget.getAttribute('data-id');
        if (confirm('Delete this tour cohort? Enrolled pilgrims will be unassigned.')) {
          await deleteGroup(groupId);
          window.showNotification('Tour cohort deleted.', 'info');
          this.render(container);
        }
      });
    });
  },

  // Modal: Create / Edit Group (Appended directly to document.body)
  openGroupModal(container, group = null) {
    const isEdit = !!group;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'group-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Edit Tour Cohort' : 'Create Tour Cohort'}</h3>
          <button class="modal-close" id="btn-close-group-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="form-group-modal">
          <div class="modal-body">
            <div class="form-group">
              <label>Cohort / Group Name *</label>
              <input type="text" id="g-name" class="form-control" value="${group?.name || ''}" required placeholder="e.g. Amja 14-Day Classic Umrah Group" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Package Type *</label>
                <select id="g-type" class="form-control" required>
                  <option value="umrah" ${group?.type === 'umrah' ? 'selected' : ''}>Umrah Pilgrimage</option>
                  <option value="hajj" ${group?.type === 'hajj' ? 'selected' : ''}>Hajj Pilgrimage</option>
                </select>
              </div>
              <div class="form-group">
                <label>Target Capacity (Pax) *</label>
                <input type="number" id="g-capacity" class="form-control" value="${group?.capacity || 20}" required min="1" max="500" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Departure Date</label>
                <input type="date" id="g-departure" class="form-control" value="${group?.departureDate || ''}" />
              </div>
              <div class="form-group">
                <label>Return Date</label>
                <input type="date" id="g-arrival" class="form-control" value="${group?.arrivalDate || ''}" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Base Price per Pilgrim (LKR) *</label>
                <input type="number" id="g-price" class="form-control" value="${group?.basePrice || ''}" required min="0" step="1000" placeholder="e.g. 400000" />
              </div>
              <div class="form-group">
                <label>Tour Leader / Sheikh</label>
                <input type="text" id="g-guide" class="form-control" value="${group?.guide || ''}" placeholder="e.g. Sheikh Abdul Rahman" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-group-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Tour Cohort'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-group-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-group-modal').addEventListener('click', closeModal);

    modalOverlay.querySelector('#form-group-modal').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = modalOverlay.querySelector('#g-name').value;
      const type = modalOverlay.querySelector('#g-type').value;
      const capacity = Number(modalOverlay.querySelector('#g-capacity').value);
      const departureDate = modalOverlay.querySelector('#g-departure').value;
      const arrivalDate = modalOverlay.querySelector('#g-arrival').value;
      const basePrice = Number(modalOverlay.querySelector('#g-price').value);
      const guide = modalOverlay.querySelector('#g-guide').value;

      await saveGroup({
        id: group?.id || undefined,
        name,
        type,
        capacity,
        departureDate,
        arrivalDate,
        basePrice,
        guide,
        itinerary: group ? group.itinerary : []
      });

      window.showNotification(`Tour cohort ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
      closeModal();
      this.render(container);
    });
  }
};
