// ----------------------------------------------------
// Amja Travels CRM - Itinerary Planner (itinerary.js)
// ----------------------------------------------------

import { 
  getGroups, 
  saveGroup, 
  getCustomers 
} from '../db.js';

let groupList = [];
let customerList = [];
let selectedGroupId = null;

export default {
  async render(container) {
    groupList = await getGroups();
    customerList = await getCustomers();

    if (groupList.length > 0 && !selectedGroupId) {
      selectedGroupId = groupList[0].id;
    }

    const selectedGroup = groupList.find(g => g.id === selectedGroupId) || groupList[0] || null;

    container.innerHTML = `
      <div class="itinerary-container">
        <!-- Left Side: Group List Selector -->
        <div class="itinerary-groups-list">
          <h3 style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.85rem; letter-spacing: 0.05em;">
            Select Tour Cohort
          </h3>
          ${groupList.length === 0 ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 2rem 0;">
              No groups available. Please create a group first.
            </div>
          ` : groupList.map(g => {
            const isSelected = selectedGroup && g.id === selectedGroup.id;
            const count = customerList.filter(c => c.groupId === g.id && c.status !== 'cancelled').length;
            const typeBadge = g.type === 'umrah' ? 'badge-umrah' : 'badge-hajj';
            return `
              <div class="group-selector-item ${isSelected ? 'selected' : ''}" data-id="${g.id}">
                <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                  <h4 style="font-size: 0.88rem; font-weight: 700; margin: 0; color: ${isSelected ? 'var(--primary)' : 'var(--text-main)'};">${g.name}</h4>
                  <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 2px;">
                    <span class="badge ${typeBadge}" style="font-size: 0.62rem; padding: 1px 5px; text-transform: uppercase;">${g.type || 'Hajj'}</span>
                    <span style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${g.departureDate || 'Date TBD'}</span>
                  </div>
                </div>
                <span class="badge" style="background-color: ${isSelected ? 'var(--primary)' : '#f1f5f9'}; color: ${isSelected ? 'white' : 'var(--text-main)'}; font-size: 0.7rem; font-weight: 600;">
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
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--primary); margin: 0;">${selectedGroup.name} Itinerary</h2>
                  <span class="badge ${selectedGroup.type === 'umrah' ? 'badge-umrah' : 'badge-hajj'}" style="font-size: 0.7rem; text-transform: uppercase;">
                    ${selectedGroup.type || 'hajj'} Package
                  </span>
                </div>
                <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Departure: <strong>${selectedGroup.departureDate || 'N/A'}</strong> &bull; Arrival: <strong>${selectedGroup.arrivalDate || 'N/A'}</strong> &bull; Leader: <strong>${selectedGroup.guide || 'Sheikh'}</strong>
                </p>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-primary" id="btn-print-itinerary" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print Timetable Leaflet
                </button>
              </div>
            </div>

            <div class="timeline">
              ${this.generateItineraryDaysList(selectedGroup)}
            </div>
          `}
        </div>
      </div>
    `;

    this.bindEvents(container, selectedGroup);
  },

  // Helper: Generates vertical timeline item days based on dates or configured itinerary
  generateItineraryDaysList(group) {
    const itinerary = group.itinerary || [];
    
    // Calculate total days from dates if present
    let dayCount = itinerary.length;
    let start = group.departureDate ? new Date(group.departureDate) : null;
    let end = group.arrivalDate ? new Date(group.arrivalDate) : null;

    if (start && end) {
      const calcDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (!isNaN(calcDays) && calcDays > 0 && calcDays <= 60) {
        dayCount = Math.max(dayCount, calcDays);
      }
    }

    if (dayCount === 0) {
      return `
        <div style="padding: 3rem 1rem; text-align: center; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px;">
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0;">
            No itinerary schedule generated yet for <strong>${group.name}</strong>. Set departure and return dates on the Tour Cohort to generate daily slots.
          </p>
        </div>
      `;
    }

    const timelineHtml = [];

    for (let i = 0; i < dayCount; i++) {
      let dateString = '';
      if (start) {
        const currentDayDate = new Date(start);
        currentDayDate.setDate(start.getDate() + i);
        dateString = currentDayDate.toISOString().substring(0, 10);
      }

      // Find saved day config, or fallback to default
      let dayData = itinerary.find(d => d.dayNum === i + 1 || (dateString && d.date === dateString));
      if (!dayData) {
        dayData = {
          dayNum: i + 1,
          date: dateString,
          location: 'mecca',
          activity: 'Guided group prayers, Tawaf, and spiritual activities.',
          note: '',
          timetable: []
        };
      }

      // Location Label Styling
      let locationBadgeClass = 'badge-hajj';
      if (dayData.location === 'mecca') locationBadgeClass = 'badge-active';
      if (dayData.location === 'medina') locationBadgeClass = 'badge-umrah';
      if (dayData.location === 'mina') locationBadgeClass = 'badge-completed';
      if (dayData.location === 'arafat') locationBadgeClass = 'badge-hajj';

      timelineHtml.push(`
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <div>
                <span class="timeline-day">Day ${dayData.dayNum}</span>
                <span class="timeline-date">(${dayData.date || dateString || 'Date TBD'})</span>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="badge ${locationBadgeClass}" style="font-size: 0.65rem; text-transform: uppercase;">
                  ${dayData.location}
                </span>
                <button class="btn btn-secondary btn-auto-schedule" data-day="${dayData.dayNum}" data-date="${dayData.date || dateString}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;" title="Auto-fill prayer & activity slots">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  Auto-Schedule
                </button>
                <button class="btn btn-secondary btn-edit-day" data-day="${dayData.dayNum}" data-date="${dayData.date || dateString}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px;">
                  Edit Plan
                </button>
              </div>
            </div>
            <p class="timeline-desc">${dayData.activity}</p>
            ${dayData.timetable && dayData.timetable.length > 0 ? `
              <div class="timetable-preview" style="margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.3rem;">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.025em;">Daily Hourly Timetable:</span>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                  ${dayData.timetable.map(slot => `
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                      <span class="badge" style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); font-family: monospace; font-size: 0.7rem; padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600;">${slot.time}</span>
                      <span style="color: var(--text-main);">${slot.activity}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
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

  bindEvents(container, selectedGroup) {
    // Group Selector item click
    const groupItems = container.querySelectorAll('.group-selector-item');
    groupItems.forEach(item => {
      item.addEventListener('click', () => {
        selectedGroupId = item.getAttribute('data-id');
        this.render(container);
      });
    });

    // Print Timetable Leaflet
    const btnPrint = container.querySelector('#btn-print-itinerary');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        if (selectedGroup) this.openPrintItineraryModal(selectedGroup);
      });
    }

    // Edit Day Plan Trigger
    const editDayBtns = container.querySelectorAll('.btn-edit-day');
    editDayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dayNum = parseInt(btn.getAttribute('data-day'));
        const dateStr = btn.getAttribute('data-date');
        if (selectedGroup) this.openEditDayModal(container, selectedGroup, dayNum, dateStr);
      });
    });

    // Auto-Schedule Day Trigger
    const autoBtns = container.querySelectorAll('.btn-auto-schedule');
    autoBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const dayNum = parseInt(btn.getAttribute('data-day'));
        const dateStr = btn.getAttribute('data-date');
        if (!selectedGroup) return;

        let itinerary = selectedGroup.itinerary ? [...selectedGroup.itinerary] : [];
        let dayIndex = itinerary.findIndex(d => d.dayNum === dayNum);
        
        let existingDay = dayIndex !== -1 ? itinerary[dayIndex] : {
          dayNum,
          date: dateStr,
          location: selectedGroup.type === 'umrah' ? (dayNum <= 7 ? 'mecca' : 'medina') : 'mecca',
          activity: 'Guided group prayers, Tawaf, and spiritual activities.',
          note: ''
        };

        const defaultSlots = [
          { time: '04:30 AM', activity: `Fajr prayer at ${existingDay.location === 'medina' ? 'Masjid an-Nabawi' : 'Masjid al-Haram'}` },
          { time: '07:30 AM', activity: 'Buffet breakfast at hotel restaurant' },
          { time: '09:00 AM', activity: existingDay.activity.length > 50 ? existingDay.activity.substring(0, 50) + '...' : existingDay.activity },
          { time: '01:00 PM', activity: 'Dhuhr prayer and lunch break' },
          { time: '04:15 PM', activity: 'Asr prayer and spiritual recitation circle' },
          { time: '06:30 PM', activity: 'Maghrib prayer and evening Dua' },
          { time: '08:00 PM', activity: 'Isha prayer and hotel dinner buffet' }
        ];

        existingDay.timetable = defaultSlots;

        if (dayIndex !== -1) {
          itinerary[dayIndex] = existingDay;
        } else {
          itinerary.push(existingDay);
        }

        selectedGroup.itinerary = itinerary;
        await saveGroup(selectedGroup);
        window.showNotification(`Auto-generated schedule for Day ${dayNum}!`, 'success');
        this.render(container);
      });
    });
  },

  // Modal: Edit Day Plan & Hourly Timetable (Appended to document.body)
  openEditDayModal(container, selectedGroup, dayNum, dateStr) {
    const itinerary = selectedGroup.itinerary || [];
    const dayData = itinerary.find(d => d.dayNum === dayNum) || {
      dayNum,
      date: dateStr || '',
      location: 'mecca',
      activity: '',
      note: '',
      timetable: []
    };

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'edit-day-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="modal-content" style="max-width: 540px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0;">Edit Itinerary: Day ${dayNum}</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${selectedGroup.name}</span>
          </div>
          <button class="modal-close" id="btn-close-day-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="form-edit-day">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Location / City *</label>
                <select id="edit-day-location" class="form-control">
                  <option value="mecca" ${dayData.location === 'mecca' ? 'selected' : ''}>Makkah Al-Mukarramah</option>
                  <option value="medina" ${dayData.location === 'medina' ? 'selected' : ''}>Madinah Al-Munawwarah</option>
                  <option value="travel" ${dayData.location === 'travel' ? 'selected' : ''}>Travel / En Route / Airport</option>
                  <option value="mina" ${dayData.location === 'mina' ? 'selected' : ''}>Mina / Tent City</option>
                  <option value="arafat" ${dayData.location === 'arafat' ? 'selected' : ''}>Arafat & Muzdalifah</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date</label>
                <input type="date" id="edit-day-date" class="form-control" value="${dayData.date || dateStr || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label>Primary Day Focus / Activities *</label>
              <textarea id="edit-day-activity" class="form-control" rows="3" required placeholder="Describe guided Tawaf, Ziyarat visits, lecture topics...">${dayData.activity || ''}</textarea>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <label>Special Instructions / Tips for Pilgrims</label>
              <input type="text" id="edit-day-note" class="form-control" value="${dayData.note || ''}" placeholder="e.g. Wear comfortable walking sandals, bring Zamzam bottle" />
            </div>

            <!-- Timetable Slots Editor -->
            <div style="margin-top: 1.25rem; border-top: 1px solid var(--border-color); padding-top: 0.85rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label style="font-weight: 700; font-size: 0.8125rem; color: var(--text-main); margin: 0;">Hourly Prayer & Activity Timetable</label>
                <button type="button" class="btn btn-secondary" id="btn-add-time-slot" style="font-size: 0.72rem; padding: 2px 8px;">+ Add Slot</button>
              </div>
              <div id="timetable-slots-container" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto; padding-right: 4px;">
                ${(dayData.timetable || []).map((slot, sIdx) => `
                  <div class="time-slot-row" style="display: flex; gap: 0.4rem; align-items: center;">
                    <input type="text" class="form-control slot-time" value="${slot.time}" placeholder="04:30 AM" style="width: 95px; font-family: monospace; font-size: 0.75rem;" />
                    <input type="text" class="form-control slot-activity" value="${slot.activity}" placeholder="Fajr prayer at Haram" style="flex: 1; font-size: 0.78rem;" />
                    <button type="button" class="btn btn-secondary btn-remove-slot" style="padding: 2px 7px; color: #dc2626; font-size: 0.72rem;">✕</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-day-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Day Schedule</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-day-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-day-modal').addEventListener('click', closeModal);

    // Add slot button
    modalOverlay.querySelector('#btn-add-time-slot').addEventListener('click', () => {
      const container = modalOverlay.querySelector('#timetable-slots-container');
      const row = document.createElement('div');
      row.className = 'time-slot-row';
      row.style.cssText = 'display: flex; gap: 0.4rem; align-items: center;';
      row.innerHTML = `
        <input type="text" class="form-control slot-time" placeholder="10:00 AM" style="width: 95px; font-family: monospace; font-size: 0.75rem;" />
        <input type="text" class="form-control slot-activity" placeholder="Activity details" style="flex: 1; font-size: 0.78rem;" />
        <button type="button" class="btn btn-secondary btn-remove-slot" style="padding: 2px 7px; color: #dc2626; font-size: 0.72rem;">✕</button>
      `;
      row.querySelector('.btn-remove-slot').addEventListener('click', () => row.remove());
      container.appendChild(row);
    });

    // Remove slot handlers
    modalOverlay.querySelectorAll('.btn-remove-slot').forEach(btn => {
      btn.addEventListener('click', (e) => e.target.closest('.time-slot-row').remove());
    });

    // Save Form
    modalOverlay.querySelector('#form-edit-day').addEventListener('submit', async (e) => {
      e.preventDefault();
      const location = modalOverlay.querySelector('#edit-day-location').value;
      const date = modalOverlay.querySelector('#edit-day-date').value;
      const activity = modalOverlay.querySelector('#edit-day-activity').value;
      const note = modalOverlay.querySelector('#edit-day-note').value;

      const slots = [];
      modalOverlay.querySelectorAll('.time-slot-row').forEach(row => {
        const time = row.querySelector('.slot-time').value.trim();
        const act = row.querySelector('.slot-activity').value.trim();
        if (time && act) {
          slots.push({ time, activity: act });
        }
      });

      let updatedItinerary = selectedGroup.itinerary ? [...selectedGroup.itinerary] : [];
      let dayIndex = updatedItinerary.findIndex(d => d.dayNum === dayNum);

      const dayObj = {
        dayNum,
        date,
        location,
        activity,
        note,
        timetable: slots
      };

      if (dayIndex !== -1) {
        updatedItinerary[dayIndex] = dayObj;
      } else {
        updatedItinerary.push(dayObj);
      }

      // Sort by dayNum
      updatedItinerary.sort((a, b) => a.dayNum - b.dayNum);

      selectedGroup.itinerary = updatedItinerary;
      await saveGroup(selectedGroup);
      window.showNotification(`Day ${dayNum} schedule saved!`, 'success');
      closeModal();
      this.render(container);
    });
  },

  // Direct In-page Print Leaflet
  openPrintItineraryModal(selectedGroup) {
    const itinerary = selectedGroup.itinerary || [];
    const members = customerList.filter(c => c.groupId === selectedGroup.id && c.status !== 'cancelled');

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedGroup.name} - Tour Timetable</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; }
          .subtitle { font-size: 11px; color: #6b7280; margin-top: 3px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; background: #f9fafb; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.25rem; font-size: 11px; border: 1px solid #e5e7eb; }
          .meta-label { color: #6b7280; font-size: 10px; text-transform: uppercase; font-weight: 600; }
          .meta-val { font-weight: 700; color: #111827; margin-top: 2px; }
          .day-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.85rem; margin-bottom: 0.85rem; page-break-inside: avoid; }
          .day-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e5e7eb; padding-bottom: 0.4rem; margin-bottom: 0.4rem; }
          .day-title { font-size: 13px; font-weight: 700; color: #065f46; }
          .day-loc { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 7px; background: #ecfdf5; color: #065f46; border-radius: 4px; }
          .day-act { font-size: 11px; margin: 0 0 0.4rem 0; }
          .tt-table { width: 100%; border-collapse: collapse; margin-top: 0.4rem; font-size: 11px; }
          .tt-table th { text-align: left; background: #f9fafb; padding: 4px 6px; font-size: 10px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
          .tt-table td { padding: 4px 6px; border-bottom: 1px solid #f3f4f6; }
          .tt-time { width: 85px; font-weight: 700; font-family: monospace; color: #065f46; }
          .footer { margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 0.75rem; font-size: 10px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS &bull; DAILY TOUR TIMETABLE</h1>
            <div class="subtitle">Pilgrimage Operations & Daily Schedule Leaflet</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 700; color: #065f46;">${selectedGroup.name}</div>
            <div class="subtitle">${selectedGroup.type ? selectedGroup.type.toUpperCase() : 'UMRAH'} PACKAGE</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <span class="meta-label">Departure</span>
            <div class="meta-val">${selectedGroup.departureDate || 'TBD'}</div>
          </div>
          <div>
            <span class="meta-label">Return Date</span>
            <div class="meta-val">${selectedGroup.arrivalDate || 'TBD'}</div>
          </div>
          <div>
            <span class="meta-label">Tour Leader / Guide</span>
            <div class="meta-val">${selectedGroup.guide || 'Assigned Sheikh'}</div>
          </div>
          <div>
            <span class="meta-label">Pilgrims in Group</span>
            <div class="meta-val">${members.length} Enrolled</div>
          </div>
        </div>

        <div>
          ${itinerary.map(d => `
            <div class="day-box">
              <div class="day-header">
                <span class="day-title">Day ${d.dayNum} ${d.date ? `(${d.date})` : ''}</span>
                <span class="day-loc">${d.location}</span>
              </div>
              <p class="day-act">${d.activity}</p>
              ${d.timetable && d.timetable.length > 0 ? `
                <table class="tt-table">
                  <thead>
                    <tr>
                      <th style="width: 90px;">Time</th>
                      <th>Scheduled Event / Prayer Ritual</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${d.timetable.map(slot => `
                      <tr>
                        <td class="tt-time">${slot.time}</td>
                        <td>${slot.activity}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
              ${d.note ? `<div style="font-size: 10px; color: #6b7280; margin-top: 4px; font-style: italic;">* ${d.note}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          Amja Travels (Pvt) Ltd &bull; 24/7 Pilgrim Assistance &bull; Hotline: +94 11 234 5678 / KSA: +966 50 123 4567
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printHtml);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  }
};
