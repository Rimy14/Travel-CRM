// ----------------------------------------------------
// Amja Travels CRM - Flights & Transport Logistics (flights.js)
// ----------------------------------------------------

import { 
  getFlights, 
  saveFlight, 
  deleteFlight,
  getTransports, 
  saveTransport, 
  deleteTransport,
  getCustomers,
  getGroups
} from '../db.js';

let activeLogisticsTab = 'all'; // 'all', 'flights', 'transports'

export default {
  async render(container) {
    const flights = await getFlights();
    const transports = await getTransports();
    const customers = await getCustomers();
    const groups = await getGroups();

    const activePilgrims = customers.filter(c => c.status !== 'cancelled');

    container.innerHTML = `
      <!-- TOP LOGISTICS KPIS -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Group Flight Blocks</span>
            <h3 class="stat-number">${flights.length} Flight Routes</h3>
            <div class="stat-sub">Direct & connecting routes</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"></rect><path d="M4 11h16"></path><path d="M8 15h.01"></path><path d="M16 15h.01"></path><path d="M6 19v2"></path><path d="M18 19v2"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Ground Transfers</span>
            <h3 class="stat-number">${transports.length} Movements</h3>
            <div class="stat-sub">Haramain Train & VIP Buses</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Standard Baggage</span>
            <h3 class="stat-number">46 kg + Zamzam</h3>
            <div class="stat-sub">2x 23kg Pieces per Pilgrim</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Ticketed Pilgrims</span>
            <h3 class="stat-number">${activePilgrims.length} Travelers</h3>
            <div class="stat-sub">Across all confirmed groups</div>
          </div>
        </div>

      </div>

      <!-- FILTER & ACTIONS TOOLBAR -->
      <div class="filter-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <div class="segmented-control" style="background: #f1f5f9; padding: 3px; border-radius: 6px; display: inline-flex; gap: 2px;">
            <button class="btn-seg ${activeLogisticsTab === 'all' ? 'active' : ''}" data-tab="all">All Logistics</button>
            <button class="btn-seg ${activeLogisticsTab === 'flights' ? 'active' : ''}" data-tab="flights">Airlines & Flight Manifests</button>
            <button class="btn-seg ${activeLogisticsTab === 'transports' ? 'active' : ''}" data-tab="transports">Ground Transfers & Trains</button>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-print-logistics" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Logistics Itinerary Pack
            </button>
            <button class="btn btn-primary" id="btn-add-flight" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Add Flight Schedule
            </button>
            <button class="btn btn-secondary" id="btn-add-transport" style="display: inline-flex; align-items: center; gap: 6px;">
              + Add Transfer
            </button>
          </div>

        </div>
      </div>

      <!-- MAIN LOGISTICS CONTENT -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- FLIGHT SCHEDULES SECTION -->
        ${activeLogisticsTab === 'all' || activeLogisticsTab === 'flights' ? `
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div>
                <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">Group Flight Schedules & PNR Manifests</h2>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Airline block bookings, flight numbers, terminals, and baggage policies</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; margin-top: 0.75rem;">
              ${flights.map(f => `
                <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem;">
                      <div>
                        <div style="font-weight: 700; font-size: 1rem; color: var(--text-main);">${f.airline}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">Flight: <strong>${f.flightNumber}</strong> &bull; PNR: <strong>${f.pnr}</strong></div>
                      </div>
                      <span class="badge ${f.direction === 'outbound' ? 'badge-hajj' : 'badge-umrah'}" style="font-size: 0.68rem; text-transform: uppercase;">
                        ${f.direction}
                      </span>
                    </div>

                    <!-- Flight Route Timeline -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; background: #ffffff; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--border-color);">
                      <div style="text-align: left;">
                        <div style="font-size: 1.1rem; font-weight: 800; color: #065f46;">${f.departureTime}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">${f.origin.split(' ')[0]}</div>
                        <div style="font-size: 0.68rem; color: #94a3b8;">${f.departureDate}</div>
                      </div>
                      
                      <div style="display: flex; flex-direction: column; align-items: center; flex: 1; padding: 0 0.75rem;">
                        <span style="font-size: 0.68rem; color: var(--text-muted);">Direct Flight</span>
                        <div style="width: 100%; height: 1px; background: #cbd5e1; position: relative; margin: 4px 0;">
                          <div style="position: absolute; right: -2px; top: -4px; color: #065f46; font-size: 10px;">✈</div>
                        </div>
                        <span style="font-size: 0.65rem; color: #059669; font-weight: 600;">${f.seatBlock}</span>
                      </div>

                      <div style="text-align: right;">
                        <div style="font-size: 1.1rem; font-weight: 800; color: #065f46;">${f.arrivalTime}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">${f.destination.split(' ')[0]}</div>
                        <div style="font-size: 0.68rem; color: #94a3b8;">${f.arrivalDate}</div>
                      </div>
                    </div>

                    <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem;">
                      <div>🏢 <strong>Terminal:</strong> ${f.terminal}</div>
                      <div>🧳 <strong>Baggage Allowance:</strong> ${f.baggage}</div>
                      ${f.notes ? `<div style="font-style: italic; color: #64748b;">Note: ${f.notes}</div>` : ''}
                    </div>
                  </div>

                  <div style="margin-top: 0.85rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
                    <button class="btn-delete-flight" data-id="${f.id}" style="background: none; border: none; color: #dc2626; font-size: 0.72rem; cursor: pointer; font-weight: 600;">Remove Flight</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- GROUND TRANSPORT SECTION -->
        ${activeLogisticsTab === 'all' || activeLogisticsTab === 'transports' ? `
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div>
                <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">Saudi Ground Logistics & Transfers</h2>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Airport pickups, Haramain High-Speed Train bookings, and Ziyarah coaches</span>
              </div>
            </div>

            <div class="table-responsive" style="margin-top: 0.75rem;">
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
                  ${transports.map(t => `
                    <tr>
                      <td><strong>${t.type}</strong></td>
                      <td>${t.date} &bull; <span style="font-family: monospace; font-weight: 600;">${t.time}</span></td>
                      <td style="color: #065f46; font-weight: 600;">${t.route}</td>
                      <td>${t.vehicle} <br><span style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">Plate: ${t.vehiclePlate}</span></td>
                      <td>${t.driver} <br><span style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">${t.driverPhone}</span></td>
                      <td><span class="badge badge-active">${t.status}</span></td>
                      <td style="text-align: right;">
                        <button class="btn-delete-trans" data-id="${t.id}" style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 0.75rem; font-weight: 600;">Remove</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

      </div>

      <!-- MODAL: ADD FLIGHT SCHEDULE -->
      <div class="modal" id="modal-flight" style="display: none;">
        <div class="modal-content" style="max-width: 520px;">
          <div class="modal-header">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Add Flight Schedule</h3>
            <button class="modal-close" id="btn-close-flight-modal">&times;</button>
          </div>
          <form id="form-flight">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Airline Name *</label>
                <input type="text" id="flight-airline" required placeholder="e.g. SriLankan Airlines" />
              </div>
              <div class="form-group">
                <label>Flight Number *</label>
                <input type="text" id="flight-number" required placeholder="e.g. UL 281" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Group PNR Code *</label>
                <input type="text" id="flight-pnr" required placeholder="e.g. AMJA-9981" />
              </div>
              <div class="form-group">
                <label>Direction</label>
                <select id="flight-direction">
                  <option value="outbound">Outbound (To Saudi Arabia)</option>
                  <option value="inbound">Inbound (Return Flight)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Origin Airport *</label>
                <input type="text" id="flight-origin" required placeholder="e.g. Colombo (CMB)" />
              </div>
              <div class="form-group">
                <label>Destination Airport *</label>
                <input type="text" id="flight-dest" required placeholder="e.g. Jeddah (JED)" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Departure Date & Time *</label>
                <input type="date" id="flight-dep-date" required />
                <input type="time" id="flight-dep-time" required style="margin-top: 4px;" />
              </div>
              <div class="form-group">
                <label>Arrival Date & Time *</label>
                <input type="date" id="flight-arr-date" required />
                <input type="time" id="flight-arr-time" required style="margin-top: 4px;" />
              </div>
            </div>

            <div class="form-group">
              <label>Baggage Policy</label>
              <input type="text" id="flight-baggage" value="2x 23kg Check-in + 7kg Hand Baggage + 5L Zamzam" />
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-flight">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Flight Route</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: ADD GROUND TRANSPORT -->
      <div class="modal" id="modal-transport" style="display: none;">
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Add Ground Transport Transfer</h3>
            <button class="modal-close" id="btn-close-trans-modal">&times;</button>
          </div>
          <form id="form-trans">
            <div class="form-group">
              <label>Transfer Type *</label>
              <select id="trans-type">
                <option value="Airport Pickup Transfer">Airport Pickup Transfer</option>
                <option value="Intercity High-Speed Train">Intercity High-Speed Train (Haramain)</option>
                <option value="Historical Ziyarah Tour">Historical Ziyarah Tour</option>
                <option value="Departure Airport Drop">Departure Airport Drop</option>
              </select>
            </div>

            <div class="form-group">
              <label>Route / Destinations *</label>
              <input type="text" id="trans-route" required placeholder="e.g. Jeddah Airport ➔ Makkah Hotel" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Date *</label>
                <input type="date" id="trans-date" required />
              </div>
              <div class="form-group">
                <label>Pickup Time *</label>
                <input type="time" id="trans-time" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Vehicle Model / Type</label>
                <input type="text" id="trans-vehicle" placeholder="e.g. Luxury 50-Seater Coach" />
              </div>
              <div class="form-group">
                <label>Plate / Booking Ref</label>
                <input type="text" id="trans-plate" placeholder="e.g. KSA-7782-HJJ" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Driver / Captain Name</label>
                <input type="text" id="trans-driver" placeholder="e.g. Brother Tariq" />
              </div>
              <div class="form-group">
                <label>Driver Phone Number</label>
                <input type="text" id="trans-phone" placeholder="e.g. +966 55 123 4567" />
              </div>
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-trans">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Transfer</button>
            </div>
          </form>
        </div>
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

    // Flight modal handling
    const flightModal = container.querySelector('#modal-flight');
    const openFlight = () => { flightModal.style.display = 'flex'; };
    const closeFlight = () => { flightModal.style.display = 'none'; };
    container.querySelector('#btn-add-flight').addEventListener('click', openFlight);
    container.querySelector('#btn-close-flight-modal').addEventListener('click', closeFlight);
    container.querySelector('#btn-cancel-flight').addEventListener('click', closeFlight);

    // Save Flight
    const formFlight = container.querySelector('#form-flight');
    if (formFlight) {
      formFlight.addEventListener('submit', async (e) => {
        e.preventDefault();
        const airline = container.querySelector('#flight-airline').value;
        const flightNumber = container.querySelector('#flight-number').value;
        const pnr = container.querySelector('#flight-pnr').value;
        const direction = container.querySelector('#flight-direction').value;
        const origin = container.querySelector('#flight-origin').value;
        const destination = container.querySelector('#flight-dest').value;
        const departureDate = container.querySelector('#flight-dep-date').value;
        const departureTime = container.querySelector('#flight-dep-time').value;
        const arrivalDate = container.querySelector('#flight-arr-date').value;
        const arrivalTime = container.querySelector('#flight-arr-time').value;
        const baggage = container.querySelector('#flight-baggage').value;

        await saveFlight({
          airline,
          flightNumber,
          pnr,
          direction,
          origin,
          destination,
          departureDate,
          departureTime,
          arrivalDate,
          arrivalTime,
          seatBlock: 'Group Block Confirmed',
          baggage,
          terminal: 'International Terminal'
        });

        window.showNotification('Flight schedule added successfully!', 'success');
        closeFlight();
        this.render(container);
      });
    }

    // Transport modal handling
    const transModal = container.querySelector('#modal-transport');
    const openTrans = () => { transModal.style.display = 'flex'; };
    const closeTrans = () => { transModal.style.display = 'none'; };
    container.querySelector('#btn-add-transport').addEventListener('click', openTrans);
    container.querySelector('#btn-close-trans-modal').addEventListener('click', closeTrans);
    container.querySelector('#btn-cancel-trans').addEventListener('click', closeTrans);

    // Save Transport
    const formTrans = container.querySelector('#form-trans');
    if (formTrans) {
      formTrans.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = container.querySelector('#trans-type').value;
        const route = container.querySelector('#trans-route').value;
        const date = container.querySelector('#trans-date').value;
        const time = container.querySelector('#trans-time').value;
        const vehicle = container.querySelector('#trans-vehicle').value || 'Air-Conditioned VIP Coach';
        const vehiclePlate = container.querySelector('#trans-plate').value || 'TBD';
        const driver = container.querySelector('#trans-driver').value || 'Assigned Driver';
        const driverPhone = container.querySelector('#trans-phone').value || 'N/A';

        await saveTransport({
          type,
          route,
          date,
          time,
          vehicle,
          vehiclePlate,
          driver,
          driverPhone,
          status: 'Confirmed'
        });

        window.showNotification('Ground transfer logged successfully!', 'success');
        closeTrans();
        this.render(container);
      });
    }

    // Print Logistics Pack
    const btnPrint = container.querySelector('#btn-print-logistics');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.printLogistics(flights, transports, customers);
      });
    }
  },

  // Direct In-page Print for Logistics Itinerary
  printLogistics(flights, transports, customers) {
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amja Travels - Official Group Logistics & Flight Pack</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.5; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; letter-spacing: -0.02em; }
          .sub { font-size: 11px; color: #64748b; margin-top: 3px; }
          .meta { font-size: 11px; color: #475569; margin-bottom: 1.25rem; background: #f8fafc; padding: 0.6rem 0.85rem; border-radius: 6px; border: 1px solid #e2e8f0; }
          .sec-title { font-size: 13px; font-weight: 700; color: #065f46; margin-top: 1.25rem; margin-bottom: 0.4rem; border-left: 3px solid #065f46; padding-left: 6px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 0.5rem; margin-bottom: 1rem; }
          th { background: #f8fafc; text-align: left; padding: 6px 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; }
          td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS</h1>
            <div class="sub">Hajj & Umrah Tour Logistics & Flight Manifest Information Pack</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Flight & Transport Pack</div>
            <div class="sub">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta">
          <strong>Baggage Guidelines:</strong> 2x 23kg Standard Check-in + 7kg Cabin Hand Luggage + 5L Zamzam Water Container Included.
        </div>

        <div class="sec-title">1. Confirmed Flight Schedule</div>
        <table>
          <thead>
            <tr>
              <th>Direction</th>
              <th>Airline & Flight No</th>
              <th>Group PNR</th>
              <th>Origin Airport</th>
              <th>Departure Time</th>
              <th>Destination</th>
              <th>Arrival Time</th>
              <th>Terminal</th>
            </tr>
          </thead>
          <tbody>
            ${flights.map(f => `
              <tr>
                <td><strong>${f.direction.toUpperCase()}</strong></td>
                <td>${f.airline} (${f.flightNumber})</td>
                <td>${f.pnr}</td>
                <td>${f.origin}</td>
                <td>${f.departureDate} ${f.departureTime}</td>
                <td>${f.destination}</td>
                <td>${f.arrivalDate} ${f.arrivalTime}</td>
                <td>${f.terminal}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="sec-title">2. Ground Transfers & Rail Schedules</div>
        <table>
          <thead>
            <tr>
              <th>Transfer Type</th>
              <th>Date & Time</th>
              <th>Route</th>
              <th>Vehicle & Plate</th>
              <th>Driver / Coordinator</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transports.map(t => `
              <tr>
                <td><strong>${t.type}</strong></td>
                <td>${t.date} ${t.time}</td>
                <td>${t.route}</td>
                <td>${t.vehicle} (${t.vehiclePlate})</td>
                <td>${t.driver} &bull; ${t.driverPhone}</td>
                <td>${t.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Amja Travels (Pvt) Ltd &bull; 24/7 Airport Support &bull; Hotlines: +94 11 234 5678 / KSA: +966 50 123 4567
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
