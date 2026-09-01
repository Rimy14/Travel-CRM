// ----------------------------------------------------
// Amja Travels CRM - Hotels & Room Allocation (hotels.js)
// ----------------------------------------------------

import { 
  getHotels, 
  saveHotel, 
  deleteHotel,
  getRoomAllocations,
  saveRoomAllocation,
  deleteRoomAllocation,
  getCustomers,
  getGroups
} from '../db.js';

let activeCityFilter = 'all'; // 'all', 'Makkah', 'Madinah'
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
      if (activeCityFilter !== 'all' && h.city !== activeCityFilter) return false;
      return true;
    });

    // Calculate rooming statistics
    let totalRooms = 0;
    let totalBeds = 0;
    hotels.forEach(h => {
      (h.rooms || []).forEach(r => {
        totalRooms++;
        totalBeds += (r.capacity || 0);
      });
    });

    const allocatedCount = allocations.length;
    const unallocatedCount = Math.max(0, activePilgrims.length - allocatedCount);

    container.innerHTML = `
      <!-- TOP SUMMARY KPI METRICS -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Partnered Hotels</span>
            <h3 class="stat-number">${hotels.length} Properties</h3>
            <div class="stat-sub">Makkah & Madinah contracts</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Total Bed Capacity</span>
            <h3 class="stat-number">${totalBeds} Beds</h3>
            <div class="stat-sub">${totalRooms} Configured Rooms</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Allocated Pilgrims</span>
            <h3 class="stat-number" style="color: #059669;">${allocatedCount} Assigned</h3>
            <div class="stat-sub">${Math.round((allocatedCount / (activePilgrims.length || 1)) * 100)}% Rooming Rate</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Pending Rooming</span>
            <h3 class="stat-number" style="color: ${unallocatedCount > 0 ? '#b45309' : '#059669'};">${unallocatedCount} Pilgrims</h3>
            <div class="stat-sub">Require room assignment</div>
          </div>
        </div>

      </div>

      <!-- CONTROLS & FILTER TOOLBAR -->
      <div class="filter-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <!-- City Segmented Control -->
            <div class="segmented-control" style="background: #f1f5f9; padding: 3px; border-radius: 6px; display: inline-flex; gap: 2px;">
              <button class="btn-seg ${activeCityFilter === 'all' ? 'active' : ''}" data-city="all">All Cities</button>
              <button class="btn-seg ${activeCityFilter === 'Makkah' ? 'active' : ''}" data-city="Makkah">Makkah Al-Mukarramah</button>
              <button class="btn-seg ${activeCityFilter === 'Madinah' ? 'active' : ''}" data-city="Madinah">Madinah Al-Munawwarah</button>
            </div>

            <!-- Cohort Selector -->
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem;">
              <span style="color: var(--text-muted); font-weight: 500;">Filter Cohort:</span>
              <select id="filter-cohort-select" style="padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.8125rem;">
                <option value="all">All Tour Cohorts</option>
                ${groups.map(g => `<option value="${g.id}" ${selectedCohortFilter === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-print-rooming" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Hotel Rooming List
            </button>
            <button class="btn btn-primary" id="btn-add-hotel" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Add Hotel Property
            </button>
          </div>

        </div>
      </div>

      <!-- HOTELS AND ROOM GRIDS -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${filteredHotels.length === 0 ? `
          <div class="card" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            No hotel properties found for this filter. Click "+ Add Hotel Property" to register hotel contracts.
          </div>
        ` : filteredHotels.map(hotel => {
          const hotelRooms = hotel.rooms || [];
          const hotelAllocations = allocations.filter(a => a.hotelId === hotel.id);
          const totalHotelBeds = hotelRooms.reduce((s, r) => s + (r.capacity || 0), 0);
          const occupiedHotelBeds = hotelAllocations.length;

          return `
            <div class="card" style="margin-bottom: 0;">
              
              <!-- Hotel Header -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.25rem;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
                    <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0;">${hotel.name}</h2>
                    <span class="badge ${hotel.city === 'Makkah' ? 'badge-hajj' : 'badge-umrah'}">${hotel.city}</span>
                    <span style="font-size: 0.75rem; color: #d97706; font-weight: 600;">★ ${hotel.stars}-Star</span>
                  </div>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); display: flex; gap: 1.25rem; flex-wrap: wrap;">
                    <span>📍 <strong>Proximity:</strong> ${hotel.distanceHaram}</span>
                    <span>🏢 <strong>Address:</strong> ${hotel.address}</span>
                    <span>📞 <strong>Reception:</strong> ${hotel.contact}</span>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 0.8125rem; font-weight: 600; color: var(--text-main);">
                    Occupancy: <span style="color: #065f46;">${occupiedHotelBeds} / ${totalHotelBeds} Beds</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    ${hotelRooms.length} Rooms configured
                  </div>
                </div>
              </div>

              <!-- Rooms Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                ${hotelRooms.map(room => {
                  const roomAllocs = hotelAllocations.filter(a => a.roomId === room.id);
                  const isFull = roomAllocs.length >= room.capacity;
                  
                  return `
                    <div style="background: #f8fafc; border: 1px solid ${isFull ? '#cbd5e1' : '#e2e8f0'}; border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
                          <div>
                            <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">Room ${room.roomNumber}</span>
                            <span style="font-size: 0.7rem; color: var(--text-muted); margin-left: 4px;">(${room.floor})</span>
                          </div>
                          <span class="badge" style="background: #ffffff; border: 1px solid #cbd5e1; font-size: 0.68rem;">
                            ${room.type} (${roomAllocs.length}/${room.capacity} Beds)
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

      <!-- MODAL: ASSIGN PILGRIM TO ROOM -->
      <div class="modal" id="modal-assign-room" style="display: none;">
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Assign Pilgrim to Room</h3>
            <button class="modal-close" id="btn-close-assign-modal">&times;</button>
          </div>
          <form id="form-assign-room">
            <input type="hidden" id="assign-hotel-id" />
            <input type="hidden" id="assign-room-id" />
            <input type="hidden" id="assign-bed-slot" />

            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 1rem; font-size: 0.8125rem;">
              <div>Hotel: <strong id="assign-disp-hotel"></strong></div>
              <div>Room: <strong id="assign-disp-room"></strong> &bull; Bed Slot: <strong id="assign-disp-slot"></strong></div>
            </div>

            <div class="form-group">
              <label>Select Pilgrim Traveler *</label>
              <select id="assign-pilgrim-select" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color);">
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
              <input type="text" id="assign-notes" placeholder="e.g. Near elevator, Family sharing preference" />
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-assign">Cancel</button>
              <button type="submit" class="btn btn-primary">Confirm Allocation</button>
            </div>
          </form>
        </div>
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

    // Cohort filter selector
    const cohortSelect = container.querySelector('#filter-cohort-select');
    if (cohortSelect) {
      cohortSelect.addEventListener('change', (e) => {
        selectedCohortFilter = e.target.value;
        this.render(container);
      });
    }

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
    const assignModal = container.querySelector('#modal-assign-room');
    container.querySelectorAll('.btn-assign-bed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hotelId = e.target.getAttribute('data-hotel-id');
        const hotelName = e.target.getAttribute('data-hotel-name');
        const roomId = e.target.getAttribute('data-room-id');
        const roomNum = e.target.getAttribute('data-room-num');
        const slot = e.target.getAttribute('data-slot');

        container.querySelector('#assign-hotel-id').value = hotelId;
        container.querySelector('#assign-room-id').value = roomId;
        container.querySelector('#assign-bed-slot').value = slot;
        container.querySelector('#assign-disp-hotel').innerText = hotelName;
        container.querySelector('#assign-disp-room').innerText = `Room ${roomNum}`;
        container.querySelector('#assign-disp-slot').innerText = `Bed #${slot}`;

        assignModal.style.display = 'flex';
      });
    });

    // Close assign modal
    const closeAssign = () => { assignModal.style.display = 'none'; };
    container.querySelector('#btn-close-assign-modal').addEventListener('click', closeAssign);
    container.querySelector('#btn-cancel-assign').addEventListener('click', closeAssign);

    // Submit room assignment
    const assignForm = container.querySelector('#form-assign-room');
    if (assignForm) {
      assignForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hotelId = container.querySelector('#assign-hotel-id').value;
        const roomId = container.querySelector('#assign-room-id').value;
        const bedSlot = container.querySelector('#assign-bed-slot').value;
        const select = container.querySelector('#assign-pilgrim-select');
        const customerId = select.value;
        const customerName = select.options[select.selectedIndex].getAttribute('data-name');
        const notes = container.querySelector('#assign-notes').value;

        if (!customerId) {
          alert('Please select a pilgrim to assign.');
          return;
        }

        await saveRoomAllocation({
          hotelId,
          roomId,
          bedSlot,
          customerId,
          customerName,
          notes
        });

        window.showNotification(`Assigned ${customerName} successfully!`, 'success');
        closeAssign();
        this.render(container);
      });
    }

    // Print Hotel Rooming List
    const btnPrint = container.querySelector('#btn-print-rooming');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.printRoomingList(hotels, allocations, customers);
      });
    }
  },

  // Direct In-page Print for Hotel Rooming List
  printRoomingList(hotels, allocations, customers) {
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amja Travels - Official Hotel Rooming List</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.5; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; letter-spacing: -0.02em; }
          .sub { font-size: 11px; color: #64748b; margin-top: 3px; }
          .meta { font-size: 11px; color: #475569; margin-bottom: 1.25rem; background: #f8fafc; padding: 0.6rem 0.85rem; border-radius: 6px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 0.75rem; margin-bottom: 1.5rem; }
          th { background: #f8fafc; text-align: left; padding: 6px 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; }
          td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
          .hotel-title { font-size: 14px; font-weight: 700; color: #065f46; margin-top: 1.5rem; margin-bottom: 0.4rem; border-left: 4px solid #065f46; padding-left: 8px; }
          .footer { margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS</h1>
            <div class="sub">Official Pilgrimage Hotel Rooming & Reception Manifest</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Hotel Rooming List</div>
            <div class="sub">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta">
          <strong>Document Purpose:</strong> Saudi Hotel Front Desk Check-in & Key Distribution Manifest &bull; 
          <strong>Total Assigned Beds:</strong> ${allocations.length} Pilgrims
        </div>

        ${hotels.map(h => {
          const hotelAllocs = allocations.filter(a => a.hotelId === h.id);
          return `
            <div class="hotel-title">${h.name} (${h.city}) &mdash; ${h.distanceHaram}</div>
            <table>
              <thead>
                <tr>
                  <th>Room No</th>
                  <th>Floor</th>
                  <th>Room Type</th>
                  <th>Bed Slot</th>
                  <th>Pilgrim Name</th>
                  <th>Passport / ID</th>
                  <th>Special Requests</th>
                </tr>
              </thead>
              <tbody>
                ${(h.rooms || []).map(r => {
                  const roomAllocs = hotelAllocs.filter(a => a.roomId === r.id);
                  if (roomAllocs.length === 0) {
                    return `
                      <tr>
                        <td><strong>Room ${r.roomNumber}</strong></td>
                        <td>${r.floor}</td>
                        <td>${r.type}</td>
                        <td colspan="4" style="color: #94a3b8; font-style: italic;">All ${r.capacity} Beds Vacant</td>
                      </tr>
                    `;
                  }
                  return roomAllocs.map((alloc, idx) => {
                    const cust = customers.find(c => c.id === alloc.customerId);
                    const sr = cust && cust.specialRequests ? Object.keys(cust.specialRequests).filter(k => cust.specialRequests[k] === true).join(', ') : 'None';
                    return `
                      <tr>
                        <td><strong>Room ${r.roomNumber}</strong></td>
                        <td>${r.floor}</td>
                        <td>${r.type}</td>
                        <td>Bed #${alloc.bedSlot || (idx + 1)}</td>
                        <td><strong>${alloc.customerName}</strong></td>
                        <td>${cust ? cust.phone : 'N/A'}</td>
                        <td>${sr || 'None'}</td>
                      </tr>
                    `;
                  }).join('');
                }).join('')}
              </tbody>
            </table>
          `;
        }).join('')}

        <div class="footer">
          Amja Travels (Pvt) Ltd &bull; Confidential Hotel Rooming Manifest &bull; Reception Contact: +94 11 234 5678
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
