// ----------------------------------------------------
// Amja Travels CRM - Groups & Itinerary Planner (groups.js)
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
let activeTab = 'directory'; // 'directory' or 'itinerary'
let selectedGroupId = null;

export default {
  async render(container) {
    groupList = await getGroups();
    customerList = await getCustomers();

    if (groupList.length > 0 && !selectedGroupId) {
      selectedGroupId = groupList[0].id;
    }

    container.innerHTML = `
      <!-- Sub Navigation Tabs -->
      <div style="display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem; gap: 1rem;">
        <button class="btn btn-secondary ${activeTab === 'directory' ? 'btn-primary' : ''}" id="tab-group-directory" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.75rem 1.5rem;">
          Tour Groups Directory
        </button>
        <button class="btn btn-secondary ${activeTab === 'itinerary' ? 'btn-primary' : ''}" id="tab-group-itinerary" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.75rem 1.5rem;">
          Day-wise Itinerary Planner
        </button>
      </div>

      <!-- TAB 1: DIRECTORY -->
      ${activeTab === 'directory' ? this.renderDirectory() : this.renderItinerary()}
    `;

    this.bindEvents(container);
  },

  renderDirectory() {
    return `
      <div class="view-header-actions" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">Travel Groups</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Create travel cohorts, set tour pricing, assign members, and manage dates.</p>
        </div>
        <button class="btn btn-primary" id="btn-create-group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Group
        </button>
      </div>

      <div class="groups-grid">
        ${groupList.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">
            No travel groups have been created yet. Set up your first group to start planning itineraries.
          </div>
        ` : groupList.map(g => {
          const members = customerList.filter(c => c.groupId === g.id && c.status !== 'cancelled');
          const totalRevenue = members.reduce((sum, c) => sum + c.price, 0);

          return `
            <div class="group-card">
              <div class="group-card-header">
                <div class="group-title">
                  <h3>${g.name}</h3>
                  <span>Leader: <strong>${g.guide || 'Not Assigned'}</strong></span>
                </div>
                <span class="badge badge-hajj" style="font-size: 0.7rem;">
                  LKR ${g.basePrice ? g.basePrice.toLocaleString() : 0} / Pax
                </span>
              </div>

              <div class="group-dates">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span><strong>${g.departureDate || 'N/A'}</strong> to <strong>${g.arrivalDate || 'N/A'}</strong></span>
              </div>

              <div class="group-meta-stats">
                <div class="meta-stat">
                  <span>Travelers</span>
                  <span>${members.length} Active</span>
                </div>
                <div class="meta-stat">
                  <span>Group Revenue</span>
                  <span style="color: var(--primary);">LKR ${totalRevenue.toLocaleString()}</span>
                </div>
                <div class="meta-stat" style="margin-top: 0.5rem;">
                  <span>Base Package Price</span>
                  <span>LKR ${g.basePrice ? g.basePrice.toLocaleString() : 0}</span>
                </div>
                <div class="meta-stat" style="margin-top: 0.5rem;">
                  <span>Meal Price / Day</span>
                  <span>LKR ${g.mealPrice ? g.mealPrice.toLocaleString() : 0}</span>
                </div>
              </div>

              <div class="group-card-footer">
                <div style="display: flex; gap: 0.35rem; width: 100%;">
                  <button class="btn btn-secondary btn-edit-group" data-id="${g.id}" style="flex: 1; padding: 0.5rem; font-size: 0.8rem;">Edit Group</button>
                  <button class="btn btn-secondary btn-plan-itinerary" data-id="${g.id}" style="flex: 1.5; padding: 0.5rem; font-size: 0.8rem; background-color: var(--primary-light); color: var(--primary);">Plan Itinerary</button>
                  <button class="btn btn-danger btn-delete-group" data-id="${g.id}" style="padding: 0.5rem; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderItinerary() {
    const selectedGroup = groupList.find(g => g.id === selectedGroupId);

    return `
      <div class="itinerary-container">
        <!-- Left Side: Group List Selector -->
        <div class="itinerary-groups-list">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.05em;">Select Group</h3>
          ${groupList.length === 0 ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 2rem 0;">
              No groups available.
            </div>
          ` : groupList.map(g => {
            const isSelected = g.id === selectedGroupId;
            const count = customerList.filter(c => c.groupId === g.id && c.status !== 'cancelled').length;
            return `
              <div class="group-selector-item ${isSelected ? 'selected' : ''}" data-id="${g.id}">
                <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                  <h4 style="font-size: 0.9rem; font-weight: 700; margin: 0;">${g.name}</h4>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${g.departureDate || 'N/A'}</span>
                </div>
                <span class="badge" style="background-color: ${isSelected ? 'var(--primary)' : 'var(--border-color)'}; color: ${isSelected ? 'white' : 'var(--text-main)'}; font-size: 0.7rem;">
                  ${count} Pax
                </span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Right Side: Itinerary Planner -->
        <div class="itinerary-planner-content">
          ${!selectedGroup ? `
            <div style="text-align: center; color: var(--text-muted); padding: 5rem 0;">
              Please select or create a group to begin managing day-wise plans.
            </div>
          ` : `
            <div class="itinerary-header">
              <div>
                <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${selectedGroup.name} Itinerary</h2>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                  Departure: <strong>${selectedGroup.departureDate || 'N/A'}</strong> | Arrival: <strong>${selectedGroup.arrivalDate || 'N/A'}</strong>
                </p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Tour Leader</span>
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">${selectedGroup.guide || 'None'}</div>
              </div>
            </div>

            <div class="timeline">
              ${this.generateItineraryDaysList(selectedGroup)}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // Helper: Generates vertical timeline item days based on dates
  generateItineraryDaysList(group) {
    if (!group.departureDate || !group.arrivalDate) {
      return `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Please set Departure and Arrival dates for this group to generate daily planner slots.</div>`;
    }

    const start = new Date(group.departureDate);
    const end = new Date(group.arrivalDate);
    const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (isNaN(dayCount) || dayCount <= 0 || dayCount > 60) {
      return `<div style="padding: 2rem; text-align: center; color: var(--status-cancelled); font-size: 0.85rem;">Invalid dates entered. Departure must be before Arrival date.</div>`;
    }

    // Ensure itinerary array is populated
    const itinerary = group.itinerary || [];
    const timelineHtml = [];

    for (let i = 0; i < dayCount; i++) {
      const currentDayDate = new Date(start);
      currentDayDate.setDate(start.getDate() + i);
      const dateString = currentDayDate.toISOString().substring(0, 10);
      
      // Find saved day config, or fallback to default
      let dayData = itinerary.find(d => d.dayNum === i + 1 || d.date === dateString);
      if (!dayData) {
        dayData = {
          dayNum: i + 1,
          date: dateString,
          location: 'travel',
          activity: 'Travel details not defined. Click Edit to customize this day.',
          note: ''
        };
      }

      // Location Label Styling
      let locationBadgeClass = 'badge-hajj';
      if (dayData.location === 'mecca') locationBadgeClass = 'badge-active';
      if (dayData.location === 'medina') locationBadgeClass = 'badge-umrah';
      if (dayData.location === 'mina') locationBadgeClass = 'badge-completed';

      timelineHtml.push(`
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <div>
                <span class="timeline-day">Day ${dayData.dayNum}</span>
                <span class="timeline-date">(${dateString})</span>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="badge ${locationBadgeClass}" style="font-size: 0.65rem; text-transform: uppercase;">
                  ${dayData.location}
                </span>
                <button class="btn btn-secondary btn-edit-day" data-day="${dayData.dayNum}" data-date="${dateString}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; border-radius: 4px;">
                  Edit Plan
                </button>
              </div>
            </div>
            <p class="timeline-desc">${dayData.activity}</p>
            ${dayData.note ? `
              <div style="font-size: 0.75rem; color: var(--text-muted); padding-top: 0.35rem; border-top: 1px dashed var(--border-color); display: flex; align-items: center; gap: 0.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Note: ${dayData.note}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `);
    }

    return timelineHtml.join('');
  },

  bindEvents(container) {
    // Tabs Toggles
    const dirTab = container.querySelector('#tab-group-directory');
    if (dirTab) {
      dirTab.addEventListener('click', () => {
        activeTab = 'directory';
        this.render(container);
      });
    }

    const itinTab = container.querySelector('#tab-group-itinerary');
    if (itinTab) {
      itinTab.addEventListener('click', () => {
        activeTab = 'itinerary';
        this.render(container);
      });
    }

    // Group Selector trigger
    const groupItems = container.querySelectorAll('.group-selector-item');
    groupItems.forEach(item => {
      item.addEventListener('click', () => {
        selectedGroupId = item.getAttribute('data-id');
        this.render(container);
      });
    });

    // Create Group Trigger
    const createBtn = container.querySelector('#btn-create-group');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.openGroupModal(container);
      });
    }

    // Edit Group Trigger
    const editBtns = container.querySelectorAll('.btn-edit-group');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const group = groupList.find(g => g.id === id);
        if (group) this.openGroupModal(container, group);
      });
    });

    // Delete Group Trigger
    const deleteBtns = container.querySelectorAll('.btn-delete-group');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this group? All assigned customers will be unassigned.')) {
          try {
            // Unassign customers first
            const members = customerList.filter(c => c.groupId === id);
            for (const customer of members) {
              customer.groupId = null;
              await saveCustomer(customer);
            }

            await deleteGroup(id);
            window.showNotification('Group deleted successfully!', 'warning');
            if (selectedGroupId === id) selectedGroupId = null;
            this.render(container);
          } catch (err) {
            window.showNotification('Error deleting group: ' + err.message, 'error');
          }
        }
      });
    });

    // Quick plan itinerary button in cards
    const planBtns = container.querySelectorAll('.btn-plan-itinerary');
    planBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedGroupId = btn.getAttribute('data-id');
        activeTab = 'itinerary';
        this.render(container);
      });
    });

    // Edit Day Plan trigger
    const editDayBtns = container.querySelectorAll('.btn-edit-day');
    editDayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dayNum = parseInt(btn.getAttribute('data-day'));
        const date = btn.getAttribute('data-date');
        this.openDayPlanModal(container, dayNum, date);
      });
    });
  },

  // Modal: Create or Edit Travel Group
  openGroupModal(container, group = null) {
    const isEdit = !!group;
    const assignedMemberIds = isEdit ? customerList.filter(c => c.groupId === group.id).map(c => c.id) : [];

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'group-modal';

    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Edit Tour Group' : 'Create Travel Group'}</h3>
          <button class="modal-close" id="btn-close-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="group-form">
          <div class="modal-body">
            <div class="form-group">
              <label for="g-name">Group / Tour Name *</label>
              <input type="text" id="g-name" class="form-control" value="${group?.name || ''}" required placeholder="Hajj Cohort - Sept 2026">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="g-depdate">Departure Date *</label>
                <input type="date" id="g-depdate" class="form-control" value="${group?.departureDate || ''}" required>
              </div>
              <div class="form-group">
                <label for="g-arrdate">Arrival Date *</label>
                <input type="date" id="g-arrdate" class="form-control" value="${group?.arrivalDate || ''}" required>
              </div>
            </div>

            <div class="form-group">
              <label for="g-guide">Tour Leader / Guide Name</label>
              <input type="text" id="g-guide" class="form-control" value="${group?.guide || ''}" placeholder="Sheikh Rizwan Al-Moulana">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="g-baseprice">Package Price per Person (LKR)</label>
                <input type="number" id="g-baseprice" class="form-control" value="${group?.basePrice || ''}" min="0" placeholder="850000">
              </div>
              <div class="form-group">
                <label for="g-mealprice">Meal Price per Person / Day (LKR)</label>
                <input type="number" id="g-mealprice" class="form-control" value="${group?.mealPrice || ''}" min="0" placeholder="3500">
              </div>
            </div>

            <!-- Group Assignment Checklist -->
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">Assign Customers</label>
            <div class="assignment-checklist-grid">
              ${customerList.length === 0 ? `
                <div style="font-size: 0.8rem; color: var(--text-light); text-align: center; grid-column: 1 / -1; padding: 1rem 0;">
                  No customers registered in system.
                </div>
              ` : customerList.map(c => {
                const isChecked = assignedMemberIds.includes(c.id);
                // Highlight if already assigned to another group
                const otherGroup = !isChecked && c.groupId ? groupList.find(g => g.id === c.groupId) : null;
                const statusLabel = otherGroup ? `(in ${otherGroup.name})` : '';

                return `
                  <label class="assignment-item" style="color: ${otherGroup ? 'var(--text-light)' : 'var(--text-main)'};">
                    <input type="checkbox" class="chk-member" data-id="${c.id}" ${isChecked ? 'checked' : ''}>
                    <span>${c.name} ${statusLabel}</span>
                  </label>
                `;
              }).join('')}
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Group'}</button>
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

    modalOverlay.querySelector('#group-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const depDate = modalOverlay.querySelector('#g-depdate').value;
      const arrDate = modalOverlay.querySelector('#g-arrdate').value;

      if (new Date(depDate) > new Date(arrDate)) {
        window.showNotification('Departure date must be before arrival date.', 'error');
        return;
      }

      const payload = {
        name: modalOverlay.querySelector('#g-name').value.trim(),
        departureDate: depDate,
        arrivalDate: arrDate,
        guide: modalOverlay.querySelector('#g-guide').value.trim(),
        basePrice: parseFloat(modalOverlay.querySelector('#g-baseprice').value) || 0,
        mealPrice: parseFloat(modalOverlay.querySelector('#g-mealprice').value) || 0,
        itinerary: group?.itinerary || []
      };

      if (isEdit) payload.id = group.id;

      try {
        // Save/create group to database to obtain reference ID
        // (Wait: saveGroup returns immediately in LocalStorage, or pushes to firestore. 
        // We'll write to db and query the list or obtain back details)
        
        // Let's first save the group
        // If it's a new group, we generate a temp ID to links members or let DB do it.
        // Wait, for Firestore, `addDoc` generates the ID. In db.js, `saveGroup` updates or creates.
        // Let's modify db.js to return the saved ID or object if needed, but since it updates cache, we can find the group by name & timestamp.
        // A simpler way: we save the group, re-load groups from DB, find our group, and then update customer relations.
        // Let's do that!
        
        await saveGroup(payload);
        
        // Reload groupList to find the saved group (either existing or new one)
        const updatedGroups = await getGroups();
        let targetGroup = null;
        if (isEdit) {
          targetGroup = updatedGroups.find(g => g.id === group.id);
        } else {
          // Sort by createdAt descending and get first match
          const sorted = [...updatedGroups].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
          targetGroup = sorted[0];
        }

        if (targetGroup) {
          // Sync customer group assignments
          const selectedChks = modalOverlay.querySelectorAll('.chk-member:checked');
          const selectedCustIds = Array.from(selectedChks).map(el => el.getAttribute('data-id'));

          // Unassign customers that were unchecked
          const previouslyAssigned = customerList.filter(c => c.groupId === targetGroup.id);
          for (const c of previouslyAssigned) {
            if (!selectedCustIds.includes(c.id)) {
              c.groupId = null;
              await saveCustomer(c);
            }
          }

          // Assign newly checked customers
          for (const cid of selectedCustIds) {
            const customer = customerList.find(c => c.id === cid);
            if (customer && customer.groupId !== targetGroup.id) {
              customer.groupId = targetGroup.id;
              // If group base price exists, we can optionally populate customer base price if they don't have one,
              // but keeping customer price custom is safer.
              await saveCustomer(customer);
            }
          }
        }

        window.showNotification(isEdit ? 'Group details updated!' : 'Group cohort created!', 'success');
        closeModal();
        this.render(container);
      } catch (err) {
        window.showNotification('Error saving group: ' + err.message, 'error');
      }
    });
  },

  // Modal: Edit Itinerary Day Activity Plan
  openDayPlanModal(container, dayNum, date) {
    const selectedGroup = groupList.find(g => g.id === selectedGroupId);
    if (!selectedGroup) return;

    const itinerary = selectedGroup.itinerary || [];
    const dayData = itinerary.find(d => d.dayNum === dayNum) || {
      dayNum: dayNum,
      date: date,
      location: 'travel',
      activity: '',
      note: ''
    };

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'day-plan-modal';

    modalOverlay.innerHTML = `
      <div class="modal-content" style="width: 480px;">
        <div class="modal-header">
          <h3>Edit Day ${dayNum} Plan (${date})</h3>
          <button class="modal-close" id="btn-close-day">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="day-plan-form">
          <div class="modal-body">
            <div class="form-group">
              <label for="day-location">Current Location *</label>
              <select id="day-location" class="form-control" required>
                <option value="travel" ${dayData.location === 'travel' ? 'selected' : ''}>Travel / In-Transit</option>
                <option value="mecca" ${dayData.location === 'mecca' ? 'selected' : ''}>Mecca (Makkah)</option>
                <option value="medina" ${dayData.location === 'medina' ? 'selected' : ''}>Medina (Madinah)</option>
                <option value="mina" ${dayData.location === 'mina' ? 'selected' : ''}>Mina Tents</option>
                <option value="arafat" ${dayData.location === 'arafat' ? 'selected' : ''}>Arafat / Muzdalifah</option>
                <option value="other" ${dayData.location === 'other' ? 'selected' : ''}>Other / Excursion</option>
              </select>
            </div>

            <div class="form-group">
              <label for="day-activity">Day's Activity Schedule *</label>
              <textarea id="day-activity" class="form-control" required placeholder="Perform Umrah rituals. Tawaaf & Sa'ee. Rest at Hotel. Guided sessions after Isha." style="min-height: 120px;">${dayData.activity.includes('details not defined') ? '' : dayData.activity}</textarea>
            </div>

            <div class="form-group">
              <label for="day-note">Special Instructions / Meal Notes</label>
              <input type="text" id="day-note" class="form-control" value="${dayData.note || ''}" placeholder="Catering provides dinner at hotel lobby at 8 PM. Prepare ihram.">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-day">Close</button>
            <button type="submit" class="btn btn-primary">Save Daily Schedule</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-day').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-day').addEventListener('click', closeModal);

    modalOverlay.querySelector('#day-plan-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const newDayConfig = {
        dayNum: dayNum,
        date: date,
        location: modalOverlay.querySelector('#day-location').value,
        activity: modalOverlay.querySelector('#day-activity').value.trim(),
        note: modalOverlay.querySelector('#day-note').value.trim()
      };

      // Merge into itinerary array
      const currentItinerary = [...(selectedGroup.itinerary || [])];
      const matchIdx = currentItinerary.findIndex(d => d.dayNum === dayNum);
      
      if (matchIdx !== -1) {
        currentItinerary[matchIdx] = newDayConfig;
      } else {
        currentItinerary.push(newDayConfig);
      }

      // Sort by dayNum ascending
      currentItinerary.sort((a, b) => a.dayNum - b.dayNum);

      selectedGroup.itinerary = currentItinerary;

      try {
        await saveGroup(selectedGroup);
        window.showNotification(`Day ${dayNum} itinerary updated successfully!`, 'success');
        closeModal();
        this.render(container);
      } catch (err) {
        window.showNotification('Error saving day plan: ' + err.message, 'error');
      }
    });
  }
};
