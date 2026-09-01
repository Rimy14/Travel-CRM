// ----------------------------------------------------
// Amja Travels CRM - Hotels & Room Allocator (hotels.js)
// ----------------------------------------------------

import { 
  getHotels, 
  getRoomAllocations, 
  saveRoomAllocation, 
  deleteRoomAllocation,
  getCustomers,
  getGroups 
} from '../db.js';

let activeCityFilter = 'all'; // 'all', 'makkah', 'medina'
let selectedCohortFilter = 'all';

export default {
  async render(container) {
    const hotels = await getHotels();
    const allocations = await getRoomAllocations();
    const customers = await getCustomers();
    const groups = await getGroups();

    const activePilgrims = customers.filter(c => c.status !== 'cancelled');

    // Filter hotels by city
    const filteredHotels = hotels.filter(h => {
      if (activeCityFilter === 'all') return true;
      return h.city.toLowerCase() === activeCityFilter.toLowerCase();
    });

    // Compute occupancy
    let totalBeds = 0;
    let occupiedBeds = 0;
    hotels.forEach(h => {
      (h.rooms || []).forEach(r => {
        totalBeds += r.capacity;
      });
    });
    occupiedBeds = allocations.length;
    const vacancy = totalBeds - occupiedBeds;
    const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    container.innerHTML = `
      <!-- TOP HOTEL METRICS -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Contracted Hotels</span>
            <h3 class="stat-number">${hotels.length} Properties</h3>
            <div class="stat-sub">Makkah & Madinah Luxury Contracts</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Bed Occupancy</span>
            <h3 class="stat-number" style="color: #059669;">${occupiedBeds} / ${totalBeds} Beds</h3>
            <div class="stat-sub">${occupancyPercent}% Reserved Across Cohorts</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Vacant Bed Slots</span>
            <h3 class="stat-number" style="color: #d97706;">${vacancy} Beds</h3>
            <div class="stat-sub">Available for new pilgrim bookings</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Pilgrims to Place</span>
            <h3 class="stat-number" style="color: ${activePilgrims.length - occupiedBeds > 0 ? '#b45309' : '#059669'};">
              ${Math.max(0, activePilgrims.length - occupiedBeds)} Unassigned
            </h3>
            <div class="stat-sub">Requiring room allocation</div>
          </div>
        </div>

      </div>

      <!-- FILTER & ACTIONS BAR -->
      <div class="filter-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <!-- City Tabs -->
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="segmented-control" style="background: #f1f5f9; padding: 3px; border-radius: 6px; display: inline-flex; gap: 2px;">
              <button class="btn-seg ${activeCityFilter === 'all' ? 'active' : ''}" data-city="all">All Cities (${hotels.length})</button>
              <button class="btn-seg ${activeCityFilter === 'makkah' ? 'active' : ''}" data-city="makkah">Makkah Al-Mukarramah</button>
              <button class="btn-seg ${activeCityFilter === 'medina' ? 'active' : ''}" data-city="medina">Madinah Al-Munawwarah</button>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-print-rooming-list" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Saudi Hotel Rooming Manifest
            </button>
          </div>

        </div>
      </div>

      <!-- HOTEL PROPERTIES & ROOM ALLOCATION GRID -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${filteredHotels.map(hotel => {
          const hotelAllocs = allocations.filter(a => a.hotelId === hotel.id);
          const hotelBeds = (hotel.rooms || []).reduce((sum, r) => sum + r.capacity, 0);
          const hotelOccupied = hotelAllocs.length;

          return `
            <div class="card" style="margin-bottom: 0;">
              
              <!-- Hotel Header -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0;">${hotel.name}</h2>
                    <span class="badge ${hotel.city.toLowerCase() === 'makkah' ? 'badge-active' : 'badge-umrah'}" style="font-size: 0.7rem; text-transform: capitalize;">
                      ${hotel.city}
                    </span>
                    <span style="font-size: 0.75rem; color: #d97706; font-weight: 600;">★ ${hotel.stars}-Star</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; display: flex; gap: 1rem; flex-wrap: wrap;">
                    <span>📍 <strong>Proximity:</strong> ${hotel.distanceToHaram}</span>
                    <span>🏨 <strong>Address:</strong> ${hotel.address}</span>
                    <span>📞 <strong>Reception:</strong> ${hotel.phone || 'N/A'}</span>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 0.8125rem; font-weight: 600; color: var(--text-main);">
                    Occupancy: <span style="color: #065f46;">${hotelOccupied} / ${hotelBeds} Beds</span>
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">
                    ${hotel.rooms?.length || 0} Rooms configured
                  </div>
                </div>
              </div>

              <!-- Rooms Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                ${(hotel.rooms || []).map(room => {
                  const roomAllocs = hotelAllocs.filter(a => a.roomId === room.id);
                  const isFull = roomAllocs.length >= room.capacity;

                  return `
                    <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        
                        <!-- Room Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                          <div>
                            <strong style="font-size: 0.9rem; color: var(--text-main);">Room ${room.roomNumber}</strong>
                            <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 4px;">(${room.floor})</span>
                          </div>
                          <span class="badge" style="background: ${isFull ? '#fee2e2' : '#ecfdf5'}; color: ${isFull ? '#991b1b' : '#065f46'}; border: 1px solid ${isFull ? '#fecaca' : '#a7f3d0'}; font-size: 0.68rem;">
                            ${room.roomType} (${roomAllocs.length}/${room.capacity} Beds)
                          </span>
                        </div>

                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.6rem;">
                          View: <strong>${room.view || 'Standard'}</strong>
                        </div>

                        <!-- Bed Slot Allocation List -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem;">
                          ${Array.from({ length: room.capacity }).map((_, slotIdx) => {
                            const alloc = roomAllocs[slotIdx];
                            if (alloc) {
                              const cust = customers.find(c => c.id === alloc.customerId);
                              return `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px solid #d1fae5; padding: 4px 8px; border-radius: 4px; font-size: 0.78rem;">
                                  <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #059669;"></span>
                                    <strong style="color: #065f46;">${alloc.customerName}</strong>
                                    ${cust && cust.packageType ? `<span class="badge badge-${cust.packageType}" style="font-size: 0.6rem; padding: 1px 4px;">${cust.packageType}</span>` : ''}
                                  </div>
                                  <button class="btn-remove-alloc" data-alloc-id="${alloc.id}" style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 11px; padding: 0 4px;" title="Unassign Bed">✕</button>
                                </div>
                              `;
                            } else {
                              return `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px dashed #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--text-muted);">
                                  <span>Bed ${slotIdx + 1}: Vacant</span>
                                  <button class="btn-assign-bed" data-hotel-id="${hotel.id}" data-hotel-name="${hotel.name}" data-room-id="${room.id}" data-room-num="${room.roomNumber}" data-slot="${slotIdx + 1}" style="background: #065f46; color: white; border: none; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; cursor: pointer;">
                                    + Assign
                                  </button>
                                </div>
                              `;
                            }
                          }).join('')}
                        </div>
                      </div>

                    </div>
                  `;
                }).join('')}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindEvents(container, hotels, allocations, customers, groups);
  },

  bindEvents(container, hotels, allocations, customers, groups) {
    // City filter buttons
    container.querySelectorAll('[data-city]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCityFilter = e.target.getAttribute('data-city');
        this.render(container);
      });
    });

    // Unassign bed button
    container.querySelectorAll('.btn-remove-alloc').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const allocId = e.target.getAttribute('data-alloc-id');
        if (confirm('Unassign this pilgrim from the room bed?')) {
          await deleteRoomAllocation(allocId);
          window.showNotification('Pilgrim removed from room.', 'info');
          this.render(container);
        }
      });
    });

    // Assign bed button
    container.querySelectorAll('.btn-assign-bed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hotelId = e.target.getAttribute('data-hotel-id');
        const hotelName = e.target.getAttribute('data-hotel-name');
        const roomId = e.target.getAttribute('data-room-id');
        const roomNum = e.target.getAttribute('data-room-num');
        const slot = e.target.getAttribute('data-slot');

        this.openAssignBedModal(container, hotelId, hotelName, roomId, roomNum, slot, customers, allocations);
      });
    });

    // Print Manifest
    const btnPrint = container.querySelector('#btn-print-rooming-list');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.printRoomingList(hotels, allocations, customers, groups);
      });
    }
  },

  // Modal: Assign Pilgrim to Room (Appended to document.body)
  openAssignBedModal(container, hotelId, hotelName, roomId, roomNum, slot, customers, allocations) {
    const activePilgrims = customers.filter(c => c.status !== 'cancelled');

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'assign-room-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Assign Pilgrim to Room</h3>
          <button class="modal-close" id="btn-close-assign-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="form-assign-modal">
          <div class="modal-body">
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 1rem; font-size: 0.8125rem;">
              <div>Hotel: <strong>${hotelName}</strong></div>
              <div>Room: <strong>Room ${roomNum}</strong> &bull; Bed Slot: <strong>Bed #${slot}</strong></div>
            </div>

            <div class="form-group">
              <label>Select Pilgrim Traveler *</label>
              <select id="modal-pilgrim-select" class="form-control" required>
                <option value="">-- Choose unassigned pilgrim --</option>
                ${activePilgrims.map(p => {
                  const isAllocated = allocations.some(a => a.customerId === p.id);
                  return `<option value="${p.id}" data-name="${p.name}">
                    ${p.name} (${p.packageType.toUpperCase()}) ${isAllocated ? '⚠️ (Already in another room)' : '✓ Available'}
                  </option>`;
                }).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Special Rooming Note / Requests</label>
              <input type="text" id="modal-assign-notes" class="form-control" placeholder="e.g. Near elevator, Family sharing preference" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-assign-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Allocation</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-assign-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-assign-modal').addEventListener('click', closeModal);

    modalOverlay.querySelector('#form-assign-modal').addEventListener('submit', async (e) => {
      e.preventDefault();
      const select = modalOverlay.querySelector('#modal-pilgrim-select');
      const customerId = select.value;
      const customerName = select.options[select.selectedIndex].getAttribute('data-name');
      const notes = modalOverlay.querySelector('#modal-assign-notes').value;

      if (!customerId) {
        alert('Please select a pilgrim to assign.');
        return;
      }

      await saveRoomAllocation({
        hotelId,
        roomId,
        bedSlot: slot,
        customerId,
        customerName,
        notes
      });

      window.showNotification(`Assigned ${customerName} successfully!`, 'success');
      closeModal();
      this.render(container);
    });
  },

  // Direct In-page Print for Saudi Hotel Rooming Manifest
  printRoomingList(hotels, allocations, customers, groups) {
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amja Travels - Saudi Hotel Rooming Manifest</title>
        <style>
          @page { size: landscape; margin: 10mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.4; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 800; color: #065f46; margin: 0; }
          .sub { font-size: 10px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 1.5rem; }
          th { background: #f1f5f9; text-align: left; padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #334155; text-transform: uppercase; font-size: 10px; }
          td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: top; }
          .footer { margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 0.5rem; font-size: 9px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS &bull; SAUDI HOTEL ROOMING MANIFEST</h1>
            <div class="sub">Official Pilgrimage Hotel Reception & Check-in Manifest &bull; Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: #065f46;">Makkah & Madinah Contracts</div>
            <div class="sub">Total Allocations: ${allocations.length} Pilgrims</div>
          </div>
        </div>

        ${hotels.map(hotel => {
          const hotelAllocs = allocations.filter(a => a.hotelId === hotel.id);
          return `
            <div style="margin-bottom: 1.5rem; page-break-inside: avoid;">
              <div style="background: #065f46; color: white; padding: 6px 10px; font-weight: 700; font-size: 12px; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between;">
                <span>${hotel.name} (${hotel.city.toUpperCase()}) &bull; ${hotel.stars}★</span>
                <span>Proximity: ${hotel.distanceToHaram} &bull; Reception: ${hotel.phone || 'N/A'}</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 70px;">Room #</th>
                    <th style="width: 90px;">Floor / Type</th>
                    <th style="width: 50px;">Bed #</th>
                    <th>Pilgrim Full Name</th>
                    <th>Passport / Contact</th>
                    <th>Special Rooming Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${(hotel.rooms || []).map(room => {
                    const roomAllocs = hotelAllocs.filter(a => a.roomId === room.id);
                    return Array.from({ length: room.capacity }).map((_, slotIdx) => {
                      const alloc = roomAllocs[slotIdx];
                      const cust = alloc ? customers.find(c => c.id === alloc.customerId) : null;
                      return `
                        <tr>
                          ${slotIdx === 0 ? `<td rowspan="${room.capacity}" style="font-weight: 700; background: #fafafa;">${room.roomNumber}</td>` : ''}
                          ${slotIdx === 0 ? `<td rowspan="${room.capacity}" style="background: #fafafa;">${room.floor}<br><span style="color: #64748b; font-size: 9px;">${room.roomType}</span></td>` : ''}
                          <td style="text-align: center; font-family: monospace;">#${slotIdx + 1}</td>
                          <td><strong>${alloc ? alloc.customerName : '<span style="color: #94a3b8; font-style: italic;">Vacant Bed</span>'}</strong></td>
                          <td style="font-family: monospace; font-size: 10px;">${cust ? cust.phone : '-'}</td>
                          <td style="font-size: 10px; color: #475569;">${alloc ? (alloc.notes || '-') : '-'}</td>
                        </tr>
                      `;
                    }).join('');
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        }).join('')}

        <div class="footer">
          Amja Travels (Pvt) Ltd &bull; 24/7 Hotel Operations Coordination &bull; Hotline: +94 11 234 5678 / KSA: +966 50 123 4567
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
