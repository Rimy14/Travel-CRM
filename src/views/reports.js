// ----------------------------------------------------
// Amja Travels CRM - Date-wise Business Reports Hub (reports.js)
// ----------------------------------------------------

import { getCustomers, getGroups, getExpenses } from '../db.js';

let activeReportTab = 'enrolled'; // 'enrolled', 'groups', 'cancellations', 'financial'
let dateFilter = {
  from: '',
  to: '',
  preset: 'all' // 'all', 'thisMonth', 'upcoming', 'thisYear'
};

export default {
  async render(container) {
    const customers = await getCustomers();
    const groups = await getGroups();
    const expenses = await getExpenses();

    // Default dates initialization if empty
    if (!dateFilter.from && !dateFilter.to) {
      this.applyPreset('all', false);
    }

    // Apply Date Filtering
    const filteredCustomers = this.filterByDate(customers, 'departureDate');
    const filteredGroups = this.filterByDate(groups, 'departureDate');
    const filteredExpenses = this.filterByDate(expenses, 'date');

    // Calculate Summary Metrics
    const totalEnrolled = filteredCustomers.filter(c => c.status !== 'cancelled');
    const totalCancelled = filteredCustomers.filter(c => c.status === 'cancelled');

    const totalSales = totalEnrolled.reduce((sum, c) => sum + (c.price || 0), 0);
    const totalPaid = totalEnrolled.reduce((sum, c) => sum + (c.paid || 0), 0);
    const totalDue = totalSales - totalPaid;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);
    const netProfit = totalPaid - totalExpenses;
    const collectionRate = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

    container.innerHTML = `
      <!-- TOP CONTROLS & DATE FILTER BAR -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <!-- Date Range Inputs -->
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">From:</label>
              <input type="date" id="rep-date-from" class="form-control" value="${dateFilter.from}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;">
            </div>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">To:</label>
              <input type="date" id="rep-date-to" class="form-control" value="${dateFilter.to}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;">
            </div>
            <button class="btn btn-primary" id="btn-apply-dates" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Filter</button>
          </div>

          <!-- Quick Presets -->
          <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
            <button class="btn ${dateFilter.preset === 'all' ? 'btn-primary' : 'btn-secondary'} btn-preset" data-preset="all" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">All Time</button>
            <button class="btn ${dateFilter.preset === 'thisMonth' ? 'btn-primary' : 'btn-secondary'} btn-preset" data-preset="thisMonth" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">This Month</button>
            <button class="btn ${dateFilter.preset === 'upcoming' ? 'btn-primary' : 'btn-secondary'} btn-preset" data-preset="upcoming" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">Next 30 Days</button>
            <button class="btn ${dateFilter.preset === 'thisYear' ? 'btn-primary' : 'btn-secondary'} btn-preset" data-preset="thisYear" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">Season 2026</button>
          </div>

          <!-- Export & Print Actions -->
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-export-csv" style="padding: 0.4rem 0.85rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.35rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export CSV
            </button>
            <button class="btn btn-primary" id="btn-print-report" style="padding: 0.4rem 0.85rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.35rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Report
            </button>
          </div>

        </div>
      </div>

      <!-- DATE-FILTERED SUMMARY METRICS CARDS -->
      <div class="stats-grid" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: var(--primary);">👥</div>
          <div class="stat-info">
            <span>Enrolled Pilgrims</span>
            <h3>${totalEnrolled.length} Pax</h3>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
              ${filteredCustomers.filter(c => c.packageType === 'hajj' && c.status !== 'cancelled').length} Hajj | ${filteredCustomers.filter(c => c.packageType === 'umrah' && c.status !== 'cancelled').length} Umrah
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb;">💰</div>
          <div class="stat-info">
            <span>Total Invoiced Sales</span>
            <h3>LKR ${totalSales.toLocaleString()}</h3>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
              Billed for selected period
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: var(--status-active);">💵</div>
          <div class="stat-info">
            <span>Paid (Collected)</span>
            <h3 style="color: var(--status-active);">LKR ${totalPaid.toLocaleString()}</h3>
            <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600; margin-top: 0.15rem;">
              ${collectionRate}% Collection Rate
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: var(--accent-gold);">⏳</div>
          <div class="stat-info">
            <span>Pending Due Amount</span>
            <h3 style="color: ${totalDue > 0 ? '#b45309' : 'var(--status-active)'};">LKR ${totalDue.toLocaleString()}</h3>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
              ${filteredCustomers.filter(c => (c.price - c.paid) > 0 && c.status !== 'cancelled').length} Pilgrims with balance
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef2f2; color: var(--status-cancelled);">❌</div>
          <div class="stat-info">
            <span>Canceled Bookings</span>
            <h3 style="color: var(--status-cancelled);">${totalCancelled.length} Bookings</h3>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
              Value: LKR ${totalCancelled.reduce((s, c) => s + c.price, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <!-- REPORT SELECTION TABS -->
      <div style="display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem; gap: 0.75rem;">
        <button class="btn btn-secondary ${activeReportTab === 'enrolled' ? 'btn-primary' : ''} btn-rep-tab" data-tab="enrolled" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.65rem 1.25rem; font-size: 0.85rem;">
          👥 Enrolled Pilgrims & Settlement
        </button>
        <button class="btn btn-secondary ${activeReportTab === 'groups' ? 'btn-primary' : ''} btn-rep-tab" data-tab="groups" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.65rem 1.25rem; font-size: 0.85rem;">
          🕋 Tour Cohorts Performance
        </button>
        <button class="btn btn-secondary ${activeReportTab === 'cancellations' ? 'btn-primary' : ''} btn-rep-tab" data-tab="cancellations" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.65rem 1.25rem; font-size: 0.85rem;">
          ❌ Cancellations & Reasons Audit
        </button>
        <button class="btn btn-secondary ${activeReportTab === 'financial' ? 'btn-primary' : ''} btn-rep-tab" data-tab="financial" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.65rem 1.25rem; font-size: 0.85rem;">
          📊 Financial Health & Aging
        </button>
      </div>

      <!-- ACTIVE REPORT TABLE CONTAINER -->
      <div class="card" style="padding: 0; overflow: hidden;">
        ${this.renderActiveReportTable(activeReportTab, filteredCustomers, filteredGroups, filteredExpenses, groups)}
      </div>
    `;

    this.bindEvents(container, filteredCustomers, filteredGroups, filteredExpenses, groups);
  },

  // Helper: Filter records by date string
  filterByDate(records, dateField) {
    if (!dateFilter.from && !dateFilter.to) return records;
    return records.filter(r => {
      const dateVal = r[dateField] || r.createdAt;
      if (!dateVal) return true;
      const target = new Date(dateVal).getTime();
      const from = dateFilter.from ? new Date(dateFilter.from).getTime() : -Infinity;
      const to = dateFilter.to ? new Date(dateFilter.to).getTime() + (24 * 60 * 60 * 1000 - 1) : Infinity;
      return target >= from && target <= to;
    });
  },

  // Apply Quick Date Presets
  applyPreset(preset, shouldRerender = true) {
    dateFilter.preset = preset;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (preset === 'all') {
      dateFilter.from = '';
      dateFilter.to = '';
    } else if (preset === 'thisMonth') {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      dateFilter.from = start.toISOString().substring(0, 10);
      dateFilter.to = end.toISOString().substring(0, 10);
    } else if (preset === 'upcoming') {
      const start = new Date();
      const end = new Date();
      end.setDate(now.getDate() + 30);
      dateFilter.from = start.toISOString().substring(0, 10);
      dateFilter.to = end.toISOString().substring(0, 10);
    } else if (preset === 'thisYear') {
      dateFilter.from = `${y}-01-01`;
      dateFilter.to = `${y}-12-31`;
    }
  },

  // Render Sub-report Tables
  renderActiveReportTable(tab, customers, groups, expenses, allGroups) {
    if (tab === 'enrolled') {
      return `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Pilgrim Name</th>
                <th>Package</th>
                <th>Tour Cohort</th>
                <th>Departure Date</th>
                <th>Total Price</th>
                <th>Amount Paid</th>
                <th>Pending Balance</th>
                <th>Special Requests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customers.length === 0 ? `
                <tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 3rem;">No enrolled pilgrims found for the selected date range.</td></tr>
              ` : customers.map(c => {
                const group = allGroups.find(g => g.id === c.groupId);
                const due = c.price - c.paid;
                const sr = c.specialRequests || {};
                const tags = [];
                if (sr.wheelchair) tags.push('♿ Wheelchair');
                if (sr.diet) tags.push('🥗 Diet');
                if (sr.elderly) tags.push('🧓 Elderly');
                if (sr.groundFloor) tags.push('🛏️ Low Floor');
                if (sr.cot) tags.push('👶 Cot');
                if (sr.notes) tags.push(`📝 ${sr.notes}`);

                return `
                  <tr>
                    <td style="font-weight: 600;">
                      <div>${c.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">${c.phone}</div>
                    </td>
                    <td><span class="badge badge-${c.packageType}">${c.packageType}</span></td>
                    <td>${group ? `<span style="font-weight: 600; color: var(--primary);">${group.name}</span>` : '<span style="color: var(--text-muted);">Unassigned</span>'}</td>
                    <td>${c.departureDate || 'TBD'}</td>
                    <td style="font-weight: 600;">LKR ${c.price.toLocaleString()}</td>
                    <td style="color: var(--status-active); font-weight: 600;">LKR ${c.paid.toLocaleString()}</td>
                    <td style="color: ${due > 0 ? '#b45309' : 'var(--status-active)'}; font-weight: 700;">
                      ${due > 0 ? `LKR ${due.toLocaleString()}` : 'Settled (LKR 0)'}
                    </td>
                    <td>
                      ${tags.length > 0 ? tags.map(t => `<span class="badge-sr" style="margin-right: 0.2rem;">${t}</span>`).join('') : '<span style="color: var(--text-muted); font-size: 0.75rem;">None</span>'}
                    </td>
                    <td><span class="badge badge-${c.status}">${c.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (tab === 'groups') {
      return `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Cohort / Group Name</th>
                <th>Tour Type</th>
                <th>Tour Leader (Sheikh)</th>
                <th>Departure Date</th>
                <th>Arrival Date</th>
                <th>Travelers</th>
                <th>Package Price</th>
                <th>Total Inflow Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${groups.length === 0 ? `
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">No tour cohorts found for the selected date range.</td></tr>
              ` : groups.map(g => {
                const members = customers.filter(c => c.groupId === g.id && c.status !== 'cancelled');
                const groupRevenue = members.reduce((sum, c) => sum + c.price, 0);

                return `
                  <tr>
                    <td style="font-weight: 700; color: var(--text-main);">${g.name}</td>
                    <td><span class="badge ${g.type === 'umrah' ? 'badge-umrah' : 'badge-hajj'}" style="text-transform: uppercase;">${g.type || 'hajj'}</span></td>
                    <td style="font-weight: 600;">${g.guide || 'Not Assigned'}</td>
                    <td>${g.departureDate || 'TBD'}</td>
                    <td>${g.arrivalDate || 'TBD'}</td>
                    <td style="font-weight: 600; color: var(--primary);">${members.length} Pilgrims</td>
                    <td>LKR ${(g.basePrice || 0).toLocaleString()}</td>
                    <td style="font-weight: 700; color: var(--status-active);">LKR ${groupRevenue.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (tab === 'cancellations') {
      const cancelled = customers.filter(c => c.status === 'cancelled');
      return `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Pilgrim Name</th>
                <th>Contact</th>
                <th>Package</th>
                <th>Booked Departure</th>
                <th>Package Value</th>
                <th>Amount Deposited</th>
                <th>Cancellation Reason & Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${cancelled.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">No cancelled bookings recorded for this date period.</td></tr>
              ` : cancelled.map(c => `
                <tr>
                  <td style="font-weight: 700; color: var(--status-cancelled);">${c.name}</td>
                  <td>${c.phone}</td>
                  <td><span class="badge badge-${c.packageType}">${c.packageType}</span></td>
                  <td>${c.departureDate || 'N/A'}</td>
                  <td style="font-weight: 600;">LKR ${c.price.toLocaleString()}</td>
                  <td style="font-weight: 600;">LKR ${c.paid.toLocaleString()}</td>
                  <td style="color: var(--status-cancelled); font-weight: 500; max-width: 250px;">
                    ${c.cancellationReason || 'No specific reason recorded.'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (tab === 'financial') {
      const preExpenses = expenses.filter(e => e.type === 'pre');
      const onTourExpenses = expenses.filter(e => e.type === 'post');
      const totalPre = preExpenses.reduce((s, e) => s + e.cost, 0);
      const totalOnTour = onTourExpenses.reduce((s, e) => s + e.cost, 0);
      const totalCost = totalPre + totalOnTour;

      const activePax = customers.filter(c => c.status !== 'cancelled');
      const fullyPaid = activePax.filter(c => (c.price - c.paid) <= 0);
      const partialPaid = activePax.filter(c => (c.price - c.paid) > 0 && c.paid > 0);
      const zeroPaid = activePax.filter(c => c.paid === 0);

      return `
        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Breakdown Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            
            <div class="card" style="margin-bottom: 0; border: 1px solid var(--border-color); background: var(--bg-main);">
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">Receivables & Aging Summary</h4>
              <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
                  <span>Fully Paid Bookings:</span>
                  <span style="font-weight: 700; color: var(--status-active);">${fullyPaid.length} Pilgrims</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
                  <span>Partially Paid (Deposits):</span>
                  <span style="font-weight: 700; color: #b45309;">${partialPaid.length} Pilgrims</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
                  <span>Zero Payment (Overdue):</span>
                  <span style="font-weight: 700; color: var(--status-cancelled);">${zeroPaid.length} Pilgrims</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 0.25rem;">
                  <span>Total Active Balance Due:</span>
                  <span style="font-weight: 800; color: #b45309;">LKR ${activePax.reduce((s, c) => s + (c.price - c.paid), 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="card" style="margin-bottom: 0; border: 1px solid var(--border-color); background: var(--bg-main);">
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">Operating Cost Segregation</h4>
              <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
                  <span>Pre-Departure Costs (Visas, Flights):</span>
                  <span style="font-weight: 700; color: var(--text-main);">LKR ${totalPre.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
                  <span>On-Tour Costs (Hotels, Meals, Buses):</span>
                  <span style="font-weight: 700; color: var(--text-main);">LKR ${totalOnTour.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
                  <span>Total Recorded Outflow:</span>
                  <span style="font-weight: 700; color: var(--status-cancelled);">LKR ${totalCost.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 0.25rem;">
                  <span>Estimated Net Margin:</span>
                  <span style="font-weight: 800; color: var(--status-active);">LKR ${(activePax.reduce((s, c) => s + c.paid, 0) - totalCost).toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      `;
    }

    return '';
  },

  bindEvents(container, customers, groups, expenses, allGroups) {
    // Tab switching
    container.querySelectorAll('.btn-rep-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeReportTab = btn.getAttribute('data-tab');
        this.render(container);
      });
    });

    // Preset filter buttons
    container.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.applyPreset(preset);
        this.render(container);
      });
    });

    // Manual date filter apply
    const applyBtn = container.querySelector('#btn-apply-dates');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        dateFilter.from = container.querySelector('#rep-date-from').value;
        dateFilter.to = container.querySelector('#rep-date-to').value;
        dateFilter.preset = 'custom';
        this.render(container);
      });
    }

    // Export CSV Trigger
    const exportBtn = container.querySelector('#btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToCSV(activeReportTab, customers, groups, expenses, allGroups);
      });
    }

    // Print Report Trigger
    const printBtn = container.querySelector('#btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printReport(activeReportTab, customers, groups, expenses, allGroups);
      });
    }
  },

  // Export to CSV Function
  exportToCSV(tab, customers, groups, expenses, allGroups) {
    let headers = [];
    let rows = [];
    let filename = `Amja_Travels_${tab}_Report_${new Date().toISOString().substring(0, 10)}.csv`;

    if (tab === 'enrolled') {
      headers = ['Name', 'Phone', 'Email', 'Package', 'Group', 'Departure Date', 'Price (LKR)', 'Paid (LKR)', 'Due (LKR)', 'Special Requests', 'Status'];
      rows = customers.map(c => {
        const group = allGroups.find(g => g.id === c.groupId);
        const due = c.price - c.paid;
        const sr = c.specialRequests || {};
        const srList = [];
        if (sr.wheelchair) srList.push('Wheelchair');
        if (sr.diet) srList.push('Special Diet');
        if (sr.elderly) srList.push('Senior Care');
        if (sr.groundFloor) srList.push('Ground Floor Room');
        if (sr.cot) srList.push('Child Cot');
        if (sr.notes) srList.push(sr.notes);

        return [
          `"${c.name}"`,
          `"${c.phone}"`,
          `"${c.email || ''}"`,
          `"${c.packageType}"`,
          `"${group ? group.name : 'Unassigned'}"`,
          `"${c.departureDate || ''}"`,
          c.price,
          c.paid,
          due,
          `"${srList.join('; ')}"`,
          `"${c.status}"`
        ];
      });
    } else if (tab === 'groups') {
      headers = ['Group Name', 'Type', 'Tour Leader', 'Departure Date', 'Arrival Date', 'Travelers Count', 'Base Price (LKR)', 'Group Revenue (LKR)'];
      rows = groups.map(g => {
        const members = customers.filter(c => c.groupId === g.id && c.status !== 'cancelled');
        const rev = members.reduce((s, c) => s + c.price, 0);
        return [
          `"${g.name}"`,
          `"${g.type || 'hajj'}"`,
          `"${g.guide || 'Not Assigned'}"`,
          `"${g.departureDate || ''}"`,
          `"${g.arrivalDate || ''}"`,
          members.length,
          g.basePrice || 0,
          rev
        ];
      });
    } else if (tab === 'cancellations') {
      headers = ['Pilgrim Name', 'Phone', 'Package', 'Departure Date', 'Price (LKR)', 'Amount Paid (LKR)', 'Cancellation Reason'];
      rows = customers.filter(c => c.status === 'cancelled').map(c => [
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.packageType}"`,
        `"${c.departureDate || ''}"`,
        c.price,
        c.paid,
        `"${c.cancellationReason || ''}"`
      ]);
    } else {
      headers = ['Category', 'Cost (LKR)', 'Date', 'Type', 'Description'];
      rows = expenses.map(e => [
        `"${e.category}"`,
        e.cost,
        `"${e.date}"`,
        `"${e.type === 'pre' ? 'Pre-Departure' : 'On-Tour'}"`,
        `"${e.description || ''}"`
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.showNotification(`Report exported as ${filename}!`, 'success');
  },

  // Print Report Function
  printReport(tab, customers, groups, expenses, allGroups) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print this report.');
      return;
    }

    const tableHtml = this.renderActiveReportTable(tab, customers, groups, expenses, allGroups);
    const tabNames = {
      enrolled: 'Enrolled Pilgrims & Financial Settlement Report',
      groups: 'Tour Cohorts & Performance Report',
      cancellations: 'Cancelled Bookings & Refund Audit Report',
      financial: 'Financial Health & Collections Summary'
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amja Travels - ${tabNames[tab]}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #111827; line-height: 1.5; }
          .header { border-bottom: 2px solid #0b5e34; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 800; color: #0b5e34; margin: 0; }
          .sub { font-size: 13px; color: #6b7280; margin-top: 4px; }
          .meta { font-size: 12px; color: #4b5563; margin-bottom: 1.5rem; background: #f9fafb; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 1rem; }
          th { background: #f3f4f6; text-align: left; padding: 8px; border-bottom: 1px solid #d1d5db; font-weight: 700; color: #374151; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          .badge-sr { font-size: 10px; padding: 2px 5px; background: #fef3c7; color: #92400e; border-radius: 3px; display: inline-block; margin: 1px; }
          .footer { margin-top: 2.5rem; border-top: 1px solid #e5e7eb; padding-top: 0.75rem; font-size: 11px; color: #9ca3af; text-align: center; }
          @media print {
            .no-print { display: none; }
            body { padding: 0.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 1.5rem; text-align: right;">
          <button onclick="window.print()" style="background: #0b5e34; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
        </div>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS</h1>
            <div class="sub">Hajj & Umrah Travel Management System • Management Report</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 700;">${tabNames[tab]}</div>
            <div class="sub">Generated: ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div class="meta">
          <strong>Filtered Period:</strong> ${dateFilter.from || 'Beginning of time'} &nbsp;to&nbsp; ${dateFilter.to || 'Present'} &nbsp; | &nbsp; 
          <strong>Total Records:</strong> ${tab === 'enrolled' ? customers.length : tab === 'groups' ? groups.length : tab === 'cancellations' ? customers.filter(c => c.status === 'cancelled').length : expenses.length}
        </div>

        ${tableHtml}

        <div class="footer">
          Amja Travels (Pvt) Ltd • Confidential Financial & Operations Report
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
};
