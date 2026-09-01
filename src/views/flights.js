// ----------------------------------------------------
// Amja Travels CRM - Flights & Ground Transport Logistics (flights.js)
// ----------------------------------------------------

import { 
  getFlights, 
  saveFlight, 
  deleteFlight, 
  getTransports, 
  saveTransport, 
  deleteTransport,
  getCustomers 
} from '../db.js';

let activeLogisticsTab = 'flights'; // 'flights' or 'transports'

export default {
  async render(container) {
    const flights = await getFlights();
    const transports = await getTransports();
    const customers = await getCustomers();

    const outboundFlights = flights.filter(f => f.direction === 'outbound');
    const inboundFlights = flights.filter(f => f.direction === 'inbound');

    container.innerHTML = `
      <!-- TOP LOGISTICS METRICS -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Airline Flight Bookings</span>
            <h3 class="stat-number">${flights.length} Scheduled</h3>
            <div class="stat-sub">${outboundFlights.length} Departure &bull; ${inboundFlights.length} Return</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Ground & Train Transfers</span>
            <h3 class="stat-number" style="color: #059669;">${transports.length} Manifests</h3>
            <div class="stat-sub">SAPTCO Coaches & Haramain Rail</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Standard Baggage Policy</span>
            <h3 class="stat-number">46 kg / Pax</h3>
            <div class="stat-sub">2x 23kg + 7kg Cabin + 5L Zamzam</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Logistics Status</span>
            <h3 class="stat-number" style="color: #059669;">Confirmed</h3>
            <div class="stat-sub">PNRs & Train Seats Locked</div>
          </div>
        </div>

      </div>

      <!-- FILTER & ACTIONS TOOLBAR -->
      <div class="filter-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="segmented-control" style="background: #f1f5f9; padding: 3px; border-radius: 6px; display: inline-flex; gap: 2px;">
              <button class="btn-seg ${activeLogisticsTab === 'flights' ? 'active' : ''}" data-tab="flights">Group Flights Manifest (${flights.length})</button>
              <button class="btn-seg ${activeLogisticsTab === 'transports' ? 'active' : ''}" data-tab="transports">Saudi Ground & Train (${transports.length})</button>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-print-logistics" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Logistics Itinerary Pack
            </button>
            ${activeLogisticsTab === 'flights' ? `
              <button class="btn btn-primary" id="btn-add-flight" style="display: inline-flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                + Add Flight Schedule
              </button>
            ` : `
              <button class="btn btn-primary" id="btn-add-transport" style="display: inline-flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                + Add Ground Transfer
              </button>
            `}
          </div>

        </div>
      </div>

      <!-- MAIN CONTENT TABS -->
      <div id="logistics-content-area">
        ${activeLogisticsTab === 'flights' ? `
          <!-- FLIGHTS LIST -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.25rem;">
            ${flights.length === 0 ? `
              <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">
                No flight schedules recorded yet. Click "+ Add Flight Schedule" to log group block tickets.
              </div>
            ` : flights.map(f => {
              const isOut = f.direction === 'outbound';
              return `
                <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <!-- Flight Card Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <strong style="font-size: 1rem; color: var(--text-main);">${f.airline}</strong>
                          <span class="badge" style="background: #f1f5f9; border: 1px solid #cbd5e1; font-family: monospace; font-size: 0.75rem; font-weight: 700;">${f.flightNumber}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                          Group PNR: <strong style="color: #065f46; font-family: monospace;">${f.pnr}</strong>
                        </div>
                      </div>
                      <span class="badge ${isOut ? 'badge-hajj' : 'badge-umrah'}" style="font-size: 0.68rem; text-transform: uppercase;">
                        ${isOut ? '🛫 Outbound' : '🛬 Return'}
                      </span>
                    </div>

                    <!-- Flight Route & Timing Grid -->
                    <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 0.75rem; align-items: center; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 0.85rem;">
                      <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Origin</div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">${f.origin}</div>
                        <div style="font-size: 0.72rem; color: #065f46; font-family: monospace; font-weight: 600; margin-top: 2px;">${f.depDate}</div>
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-main);">${f.depTime}</div>
                      </div>

                      <div style="text-align: center; color: #94a3b8;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        <div style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase;">Non-Stop</div>
                      </div>

                      <div style="text-align: right;">
                        <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Destination</div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">${f.destination}</div>
                        <div style="font-size: 0.72rem; color: #065f46; font-family: monospace; font-weight: 600; margin-top: 2px;">${f.arrDate}</div>
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-main);">${f.arrTime}</div>
                      </div>
                    </div>

                    <!-- Flight Meta Tags -->
                    <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.5rem;">
                      ${f.terminal ? `<div>🏛️ <strong>Terminal:</strong> ${f.terminal}</div>` : ''}
                      <div>🧳 <strong>Baggage Allowance:</strong> ${f.baggage || '2x 23kg + 7kg Cabin + 5L Zamzam'}</div>
                      ${f.notes ? `<div style="font-style: italic;">Note: ${f.notes}</div>` : ''}
                    </div>

                  </div>

                  <!-- Flight Footer -->
                  <div style="border-top: 1px solid var(--border-color); padding-top: 0.6rem; display: flex; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-delete-flight" data-id="${f.id}" style="padding: 3px 8px; font-size: 0.72rem; color: #dc2626;">
                      Remove Flight
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- GROUND TRANSPORTS TABLE -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div>
                <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">Saudi Ground Logistics & Transfers</h2>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Airport pickups, Haramain High-Speed Train bookings, and Ziyarah coaches</span>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table" style="font-size: 0.8125rem;">
                <thead>
                  <tr>
                    <th>Transfer Type</th>
                    <th>Date & Time</th>
                    <th>Route / Destination</th>
                    <th>Assigned Vehicle</th>
                    <th>Driver / Operator Contact</th>
                    <th>Status</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${transports.length === 0 ? `
                    <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">No ground transport manifests logged. Click "+ Add Ground Transfer" to record VIP coach or Haramain train bookings.</td></tr>
                  ` : transports.map(t => `
                    <tr>
                      <td>
                        <strong>${t.transferType}</strong>
                      </td>
                      <td>
                        <div style="font-weight: 600;">${t.date}</div>
                        <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">${t.pickupTime}</div>
                      </td>
                      <td>
                        <strong style="color: #065f46;">${t.route}</strong>
                      </td>
                      <td>
                        <div>${t.vehicleType || 'VIP SAPTCO Coach'}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">Plate: ${t.plateNo || 'TBD'}</div>
                      </td>
                      <td>
                        <div>${t.driverName || 'Designated Driver'}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${t.driverPhone || 'N/A'}</div>
                      </td>
                      <td>
                        <span class="badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 0.7rem;">${t.status || 'Confirmed'}</span>
                      </td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary btn-delete-trans" data-id="${t.id}" style="padding: 2px 7px; font-size: 0.7rem; color: #dc2626;">Remove</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </div>
    `;

    this.bindEvents(container, flights, transports, customers);
  },

  bindEvents(container, flights, transports, customers) {
    // Tab switching
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeLogisticsTab = e.target.getAttribute('data-tab');
        this.render(container);
      });
    });

    // Delete Flight
    container.querySelectorAll('.btn-delete-flight').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Delete this flight schedule?')) {
          await deleteFlight(id);
          window.showNotification('Flight schedule deleted.', 'info');
          this.render(container);
        }
      });
    });

    // Delete Transport
    container.querySelectorAll('.btn-delete-trans').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Delete this ground transfer?')) {
          await deleteTransport(id);
          window.showNotification('Ground transfer deleted.', 'info');
          this.render(container);
        }
      });
    });

    // Add Flight Modal
    const btnAddFlight = container.querySelector('#btn-add-flight');
    if (btnAddFlight) {
      btnAddFlight.addEventListener('click', () => {
        this.openFlightModal(container);
      });
    }

    // Add Transport Modal
    const btnAddTrans = container.querySelector('#btn-add-transport');
    if (btnAddTrans) {
      btnAddTrans.addEventListener('click', () => {
        this.openTransportModal(container);
      });
    }

    // Print Logistics Pack
    const btnPrint = container.querySelector('#btn-print-logistics');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.printLogisticsPack(flights, transports);
      });
    }
  },

  // Modal: Add Flight (Appended to document.body)
  openFlightModal(container) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'flight-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Flight Schedule</h3>
          <button class="modal-close" id="btn-close-flight-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="form-flight-modal">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Airline Name *</label>
                <input type="text" id="f-airline" class="form-control" required placeholder="e.g. SriLankan Airlines" />
              </div>
              <div class="form-group">
                <label>Flight Number *</label>
                <input type="text" id="f-number" class="form-control" required placeholder="e.g. UL 281" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Group PNR Code *</label>
                <input type="text" id="f-pnr" class="form-control" required placeholder="e.g. AMJA-9981" />
              </div>
              <div class="form-group">
                <label>Direction</label>
                <select id="f-direction" class="form-control">
                  <option value="outbound">Outbound (To Saudi Arabia)</option>
                  <option value="inbound">Inbound (Return Flight)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Origin Airport *</label>
                <input type="text" id="f-origin" class="form-control" required placeholder="e.g. Colombo (CMB)" />
              </div>
              <div class="form-group">
                <label>Destination Airport *</label>
                <input type="text" id="f-dest" class="form-control" required placeholder="e.g. Jeddah (JED)" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Departure Date & Time *</label>
                <input type="date" id="f-dep-date" class="form-control" required />
                <input type="time" id="f-dep-time" class="form-control" required style="margin-top: 4px;" />
              </div>
              <div class="form-group">
                <label>Arrival Date & Time *</label>
                <input type="date" id="f-arr-date" class="form-control" required />
                <input type="time" id="f-arr-time" class="form-control" required style="margin-top: 4px;" />
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.5rem;">
              <label>Baggage Policy</label>
              <input type="text" id="f-baggage" class="form-control" value="2x 23kg Check-in + 7kg Hand Baggage + 5L Zamzam" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-flight-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Flight Route</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-flight-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-flight-modal').addEventListener('click', closeModal);

    modalOverlay.querySelector('#form-flight-modal').addEventListener('submit', async (e) => {
      e.preventDefault();
      const airline = modalOverlay.querySelector('#f-airline').value;
      const flightNumber = modalOverlay.querySelector('#f-number').value;
      const pnr = modalOverlay.querySelector('#f-pnr').value;
      const direction = modalOverlay.querySelector('#f-direction').value;
      const origin = modalOverlay.querySelector('#f-origin').value;
      const destination = modalOverlay.querySelector('#f-dest').value;
      const depDate = modalOverlay.querySelector('#f-dep-date').value;
      const depTime = modalOverlay.querySelector('#f-dep-time').value;
      const arrDate = modalOverlay.querySelector('#f-arr-date').value;
      const arrTime = modalOverlay.querySelector('#f-arr-time').value;
      const baggage = modalOverlay.querySelector('#f-baggage').value;

      await saveFlight({
        airline,
        flightNumber,
        pnr,
        direction,
        origin,
        destination,
        depDate,
        depTime,
        arrDate,
        arrTime,
        baggage
      });

      window.showNotification('Flight route saved successfully!', 'success');
      closeModal();
      this.render(container);
    });
  },

  // Modal: Add Ground Transport (Appended to document.body)
  openTransportModal(container) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'transport-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Ground Transport Transfer</h3>
          <button class="modal-close" id="btn-close-trans-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="form-trans-modal">
          <div class="modal-body">
            <div class="form-group">
              <label>Transfer Type *</label>
              <select id="t-type" class="form-control">
                <option value="Airport Pickup Transfer">Airport Pickup Transfer</option>
                <option value="Intercity High-Speed Train">Intercity High-Speed Train (Haramain)</option>
                <option value="Historical Ziyarah Tour">Historical Ziyarah Tour</option>
                <option value="Departure Airport Drop">Departure Airport Drop</option>
              </select>
            </div>

            <div class="form-group">
              <label>Route / Destinations *</label>
              <input type="text" id="t-route" class="form-control" required placeholder="e.g. Jeddah Airport ➔ Makkah Hotel" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input type="date" id="t-date" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Pickup Time *</label>
                <input type="time" id="t-time" class="form-control" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Vehicle Model / Type</label>
                <input type="text" id="t-vehicle" class="form-control" placeholder="e.g. Luxury 50-Seater Coach" />
              </div>
              <div class="form-group">
                <label>Plate / Booking Ref</label>
                <input type="text" id="t-plate" class="form-control" placeholder="e.g. KSA-7782-HJJ" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Driver / Captain Name</label>
                <input type="text" id="t-driver" class="form-control" placeholder="e.g. Brother Tariq" />
              </div>
              <div class="form-group">
                <label>Driver Phone Number</label>
                <input type="text" id="t-phone" class="form-control" placeholder="e.g. +966 55 123 4567" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-trans-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Transfer</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-trans-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-trans-modal').addEventListener('click', closeModal);

    modalOverlay.querySelector('#form-trans-modal').addEventListener('submit', async (e) => {
      e.preventDefault();
      const transferType = modalOverlay.querySelector('#t-type').value;
      const route = modalOverlay.querySelector('#t-route').value;
      const date = modalOverlay.querySelector('#t-date').value;
      const pickupTime = modalOverlay.querySelector('#t-time').value;
      const vehicleType = modalOverlay.querySelector('#t-vehicle').value;
      const plateNo = modalOverlay.querySelector('#t-plate').value;
      const driverName = modalOverlay.querySelector('#t-driver').value;
      const driverPhone = modalOverlay.querySelector('#t-phone').value;

      await saveTransport({
        transferType,
        route,
        date,
        pickupTime,
        vehicleType,
        plateNo,
        driverName,
        driverPhone,
        status: 'Confirmed'
      });

      window.showNotification('Ground transfer saved successfully!', 'success');
      closeModal();
      this.render(container);
    });
  },

  // Direct In-page Print for Logistics Itinerary Pack
  printLogisticsPack(flights, transports) {
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amja Travels - Logistics & Ground Transport Manifest</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.4; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; }
          .sub { font-size: 11px; color: #64748b; margin-top: 3px; }
          .section-title { font-size: 14px; font-weight: 700; color: #065f46; margin: 1.25rem 0 0.5rem 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 1.25rem; }
          th { background: #f8fafc; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #334155; text-transform: uppercase; font-size: 10px; }
          td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: top; }
          .footer { margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS (PVT) LTD</h1>
            <div class="sub">Group Flight Manifest & Saudi Ground Logistics Master Sheet</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 700; color: #065f46;">TRAVEL OPERATIONS DESK</div>
            <div class="sub">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="section-title">✈️ Group Airline Flights & Block PNRs</div>
        <table>
          <thead>
            <tr>
              <th>Direction</th>
              <th>Airline & Flight #</th>
              <th>Group PNR</th>
              <th>Route (Origin ➔ Dest)</th>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Baggage Allowance</th>
            </tr>
          </thead>
          <tbody>
            ${flights.map(f => `
              <tr>
                <td><strong>${f.direction.toUpperCase()}</strong></td>
                <td>${f.airline} &bull; <strong>${f.flightNumber}</strong></td>
                <td style="font-family: monospace; font-weight: 700; color: #065f46;">${f.pnr}</td>
                <td>${f.origin} ➔ ${f.destination}</td>
                <td>${f.depDate} &bull; ${f.depTime}</td>
                <td>${f.arrDate} &bull; ${f.arrTime}</td>
                <td>${f.baggage || '2x 23kg + 7kg + 5L Zamzam'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">🚌 Saudi Ground Transfers & Haramain High-Speed Train Schedule</div>
        <table>
          <thead>
            <tr>
              <th>Transfer Purpose</th>
              <th>Date & Pickup</th>
              <th>Route & Terminals</th>
              <th>Assigned Vehicle</th>
              <th>Captain / Driver Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transports.map(t => `
              <tr>
                <td><strong>${t.transferType}</strong></td>
                <td>${t.date} &bull; <strong>${t.pickupTime}</strong></td>
                <td style="color: #065f46; font-weight: 600;">${t.route}</td>
                <td>${t.vehicleType} (Plate: ${t.plateNo || 'TBD'})</td>
                <td>${t.driverName} (${t.driverPhone || 'N/A'})</td>
                <td>${t.status || 'Confirmed'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Amja Travels (Pvt) Ltd &bull; 24/7 Logistics Control & Airport Representatives &bull; Hotline: +94 11 234 5678 / KSA: +966 50 123 4567
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
