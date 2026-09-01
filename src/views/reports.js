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
    const collectionRate = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

    container.innerHTML = `
      <!-- TOP CONTROLS & DATE FILTER BAR -->
      <div class="card" style="margin-bottom: 1.25rem; padding: 1rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <!-- Date Range Inputs -->
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <label style="font-size: 0.78rem; font-weight: 550; color: var(--text-muted);">From</label>
              <input type="date" id="rep-date-from" class="form-control" value="${dateFilter.from}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; width: 140px;">
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <label style="font-size: 0.78rem; font-weight: 550; color: var(--text-muted);">To</label>
              <input type="date" id="rep-date-to" class="form-control" value="${dateFilter.to}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; width: 140px;">
            </div>
            <button class="btn btn-primary" id="btn-apply-dates" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;">Apply</button>
          </div>

          <!-- Quick Presets -->
          <div class="segmented-control" style="background: #f1f5f9; padding: 3px; border-radius: 6px; display: inline-flex; gap: 2px;">
            <button class="btn-seg ${dateFilter.preset === 'all' ? 'active' : ''} btn-preset" data-preset="all">All Time</button>
            <button class="btn-seg ${dateFilter.preset === 'thisMonth' ? 'active' : ''} btn-preset" data-preset="thisMonth">This Month</button>
            <button class="btn-seg ${dateFilter.preset === 'upcoming' ? 'active' : ''} btn-preset" data-preset="upcoming">Next 30 Days</button>
            <button class="btn-seg ${dateFilter.preset === 'thisYear' ? 'active' : ''} btn-preset" data-preset="thisYear">Season 2026</button>
          </div>

          <!-- Export & Print Actions -->
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-export-csv" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export CSV
            </button>
            <button class="btn btn-secondary" id="btn-print-report" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Report
            </button>
          </div>

        </div>
      </div>

      <!-- METRIC CARDS -->
      <div class="stats-grid" style="margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: var(--primary); border: 1px solid var(--border-color);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Enrolled Pilgrims</span>
            <h3 class="stat-number">${totalEnrolled.length} <small style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">Pax</small></h3>
            <div class="stat-sub">
              ${filteredCustomers.filter(c => c.packageType === 'hajj' && c.status !== 'cancelled').length} Hajj &bull; ${filteredCustomers.filter(c => c.packageType === 'umrah' && c.status !== 'cancelled').length} Umrah
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: #2563eb; border: 1px solid var(--border-color);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Invoiced Revenue</span>
            <h3 class="stat-number">LKR ${totalSales.toLocaleString()}</h3>
            <div class="stat-sub">Total billed in period</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #059669; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Collected (Paid)</span>
            <h3 class="stat-number" style="color: #059669;">LKR ${totalPaid.toLocaleString()}</h3>
            <div class="stat-sub" style="color: #059669; font-weight: 600;">${collectionRate}% Collection Rate</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Outstanding Due</span>
            <h3 class="stat-number" style="color: ${totalDue > 0 ? '#b45309' : '#059669'};">LKR ${totalDue.toLocaleString()}</h3>
            <div class="stat-sub">${filteredCustomers.filter(c => (c.price - c.paid) > 0 && c.status !== 'cancelled').length} Pilgrims with balance</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Cancelled Bookings</span>
            <h3 class="stat-number" style="color: ${totalCancelled.length > 0 ? '#dc2626' : 'var(--text-main)'};">${totalCancelled.length}</h3>
            <div class="stat-sub">Value: LKR ${totalCancelled.reduce((s, c) => s + c.price, 0).toLocaleString()}</div>
          </div>
        </div>

      </div>

      <!-- REPORT SELECTION TABS (SEGMENTED STYLE) -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
        <div class="segmented-control" style="background: #f1f5f9; padding: 3px; border-radius: 6px; display: inline-flex; gap: 2px;">
          <button class="btn-seg ${activeReportTab === 'enrolled' ? 'active' : ''} btn-rep-tab" data-tab="enrolled">
            Enrolled Pilgrims & Settlements
          </button>
          <button class="btn-seg ${activeReportTab === 'groups' ? 'active' : ''} btn-rep-tab" data-tab="groups">
            Tour Cohorts Performance
          </button>
          <button class="btn-seg ${activeReportTab === 'cancellations' ? 'active' : ''} btn-rep-tab" data-tab="cancellations">
            Cancellations & Audit
          </button>
          <button class="btn-seg ${activeReportTab === 'financial' ? 'active' : ''} btn-rep-tab" data-tab="financial">
            Financial Health & Aging
          </button>
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">
          Showing ${activeReportTab === 'enrolled' ? filteredCustomers.length : activeReportTab === 'groups' ? filteredGroups.length : activeReportTab === 'cancellations' ? totalCancelled.length : filteredExpenses.length} records
        </span>
      </div>

      <!-- ACTIVE REPORT TABLE -->
      <div class="card" style="padding: 0; overflow: hidden;">
        ${this.renderActiveReportTable(activeReportTab, filteredCustomers, filteredGroups, filteredExpenses, groups)}
      </div>
    `;

    this.bindEvents(container, filteredCustomers, filteredGroups, filteredExpenses, groups);
  },

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

  renderActiveReportTable(tab, customers, groups, expenses, allGroups) {
    if (tab === 'enrolled') {
      return `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Pilgrim</th>
                <th>Package</th>
                <th>Tour Cohort</th>
                <th>Departure</th>
                <th style="text-align: right;">Package Price</th>
                <th style="text-align: right;">Amount Paid</th>
                <th style="text-align: right;">Pending Due</th>
                <th>Special Requests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customers.length === 0 ? `
                <tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No enrolled pilgrims found for the selected period.</td></tr>
              ` : customers.map(c => {
                const group = allGroups.find(g => g.id === c.groupId);
                const due = c.price - c.paid;
                const sr = c.specialRequests || {};
                const tags = [];
                if (sr.wheelchair) tags.push('Wheelchair');
                if (sr.diet) tags.push('Special Diet');
                if (sr.elderly) tags.push('Senior Care');
                if (sr.groundFloor) tags.push('Low Floor');
                if (sr.cot) tags.push('Child Cot');
                if (sr.notes) tags.push(sr.notes);

                return `
                  <tr>
                    <td>
                      <div style="font-weight: 600; color: var(--text-main);">${c.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${c.phone}</div>
                    </td>
                    <td><span class="badge badge-${c.packageType}">${c.packageType}</span></td>
                    <td>${group ? `<span style="font-weight: 550; color: var(--primary);">${group.name}</span>` : '<span style="color: var(--text-light); font-size: 0.8rem;">Unassigned</span>'}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${c.departureDate || 'TBD'}</td>
                    <td style="text-align: right; font-weight: 600; font-family: monospace; font-size: 0.85rem;">LKR ${c.price.toLocaleString()}</td>
                    <td style="text-align: right; color: #059669; font-weight: 600; font-family: monospace; font-size: 0.85rem;">LKR ${c.paid.toLocaleString()}</td>
                    <td style="text-align: right; color: ${due > 0 ? '#b45309' : '#059669'}; font-weight: 600; font-family: monospace; font-size: 0.85rem;">
                      ${due > 0 ? `LKR ${due.toLocaleString()}` : 'Settled'}
                    </td>
                    <td>
                      ${tags.length > 0 ? tags.map(t => `<span class="badge-sr">${t}</span>`).join('') : '<span style="color: var(--text-light); font-size: 0.75rem;">None</span>'}
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
                <th>Cohort / Group</th>
                <th>Tour Type</th>
                <th>Tour Leader</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Travelers</th>
                <th style="text-align: right;">Base Price</th>
                <th style="text-align: right;">Group Inflow</th>
              </tr>
            </thead>
            <tbody>
              ${groups.length === 0 ? `
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No tour cohorts found for the selected period.</td></tr>
              ` : groups.map(g => {
                const members = customers.filter(c => c.groupId === g.id && c.status !== 'cancelled');
                const groupRevenue = members.reduce((sum, c) => sum + c.price, 0);

                return `
                  <tr>
                    <td style="font-weight: 600; color: var(--text-main);">${g.name}</td>
                    <td><span class="badge ${g.type === 'umrah' ? 'badge-umrah' : 'badge-hajj'}">${g.type || 'hajj'}</span></td>
                    <td style="color: var(--text-muted); font-size: 0.85rem;">${g.guide || 'Not Assigned'}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${g.departureDate || 'TBD'}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${g.arrivalDate || 'TBD'}</td>
                    <td style="font-weight: 600; color: var(--primary);">${members.length} Pax</td>
                    <td style="text-align: right; font-family: monospace; font-size: 0.85rem;">LKR ${(g.basePrice || 0).toLocaleString()}</td>
                    <td style="text-align: right; font-weight: 700; color: #059669; font-family: monospace; font-size: 0.85rem;">LKR ${groupRevenue.toLocaleString()}</td>
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
                <th>Pilgrim</th>
                <th>Contact</th>
                <th>Package</th>
                <th>Departure Date</th>
                <th style="text-align: right;">Package Value</th>
                <th style="text-align: right;">Amount Deposited</th>
                <th>Reason & Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${cancelled.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No cancelled bookings recorded for this period.</td></tr>
              ` : cancelled.map(c => `
                <tr>
                  <td style="font-weight: 600; color: var(--text-main);">${c.name}</td>
                  <td style="color: var(--text-muted); font-size: 0.8rem;">${c.phone}</td>
                  <td><span class="badge badge-${c.packageType}">${c.packageType}</span></td>
                  <td style="font-size: 0.8rem; color: var(--text-muted);">${c.departureDate || 'N/A'}</td>
                  <td style="text-align: right; font-family: monospace; font-size: 0.85rem; font-weight: 600;">LKR ${c.price.toLocaleString()}</td>
                  <td style="text-align: right; font-family: monospace; font-size: 0.85rem; color: #059669;">LKR ${c.paid.toLocaleString()}</td>
                  <td style="color: #dc2626; font-size: 0.8rem; max-width: 250px;">
                    ${c.cancellationReason || 'No reason recorded.'}
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
        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            
            <div class="card" style="margin-bottom: 0; border: 1px solid var(--border-color); background: #f8fafc;">
              <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.85rem; color: var(--text-main);">Receivables & Aging</h4>
              <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.8125rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Fully Paid:</span>
                  <span style="font-weight: 600; color: #059669;">${fullyPaid.length} Pilgrims</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Partially Paid (Deposits):</span>
                  <span style="font-weight: 600; color: #b45309;">${partialPaid.length} Pilgrims</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Zero Payment:</span>
                  <span style="font-weight: 600; color: #dc2626;">${zeroPaid.length} Pilgrims</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 0.35rem;">
                  <span style="font-weight: 600; color: var(--text-main);">Total Active Due:</span>
                  <span style="font-weight: 700; color: #b45309; font-family: monospace;">LKR ${activePax.reduce((s, c) => s + (c.price - c.paid), 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="card" style="margin-bottom: 0; border: 1px solid var(--border-color); background: #f8fafc;">
              <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.85rem; color: var(--text-main);">Operating Cost Segregation</h4>
              <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.8125rem;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Pre-Departure Costs:</span>
                  <span style="font-weight: 600; font-family: monospace;">LKR ${totalPre.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">On-Tour Expenses:</span>
                  <span style="font-weight: 600; font-family: monospace;">LKR ${totalOnTour.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Total Recorded Outflow:</span>
                  <span style="font-weight: 600; color: #dc2626; font-family: monospace;">LKR ${totalCost.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 0.35rem;">
                  <span style="font-weight: 600; color: var(--text-main);">Net Margin (Cash Inflow - Costs):</span>
                  <span style="font-weight: 700; color: #059669; font-family: monospace;">LKR ${(activePax.reduce((s, c) => s + c.paid, 0) - totalCost).toLocaleString()}</span>
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
    container.querySelectorAll('.btn-rep-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeReportTab = btn.getAttribute('data-tab');
        this.render(container);
      });
    });

    container.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.applyPreset(preset);
        this.render(container);
      });
    });

    const applyBtn = container.querySelector('#btn-apply-dates');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        dateFilter.from = container.querySelector('#rep-date-from').value;
        dateFilter.to = container.querySelector('#rep-date-to').value;
        dateFilter.preset = 'custom';
        this.render(container);
      });
    }

    const exportBtn = container.querySelector('#btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToCSV(activeReportTab, customers, groups, expenses, allGroups);
      });
    }

    const printBtn = container.querySelector('#btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printReport(activeReportTab, customers, groups, expenses, allGroups);
      });
    }
  },

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

  printReport(tab, customers, groups, expenses, allGroups) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print this report.');
      return;
    }

    const tableHtml = this.renderActiveReportTable(tab, customers, groups, expenses, allGroups);
    const tabNames = {
      enrolled: 'Enrolled Pilgrims & Settlement Report',
      groups: 'Tour Cohorts Performance Report',
      cancellations: 'Cancelled Bookings & Audit Report',
      financial: 'Financial Health & Collections Summary'
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amja Travels - ${tabNames[tab]}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; color: #0f172a; line-height: 1.5; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; letter-spacing: -0.02em; }
          .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          .meta { font-size: 11px; color: #475569; margin-bottom: 1.25rem; background: #f8fafc; padding: 0.6rem 0.85rem; border-radius: 6px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 0.75rem; }
          th { background: #f8fafc; text-align: left; padding: 6px 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; }
          td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
          .badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
          .badge-sr { font-size: 9px; padding: 1px 4px; background: #fef3c7; color: #92400e; border-radius: 3px; display: inline-block; margin: 1px; }
          .footer { margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; font-size: 10px; color: #94a3b8; text-align: center; }
          @media print {
            .no-print { display: none; }
            body { padding: 0.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <button onclick="window.close()" style="background: #ffffff; color: #1e293b; border: 1px solid #cbd5e1; padding: 7px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Return to CRM / Close
          </button>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <span style="font-size: 12px; color: #64748b;">Tip: Press Esc or click Return to go back</span>
            <button onclick="window.print()" style="background: #065f46; color: white; border: 1px solid #065f46; padding: 7px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / Save as PDF
            </button>
          </div>
        </div>
        <script>window.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.close(); });</script>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS</h1>
            <div class="sub">Hajj & Umrah CRM &bull; Management Reporting</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${tabNames[tab]}</div>
            <div class="sub">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta">
          <strong>Period:</strong> ${dateFilter.from || 'All'} &mdash; ${dateFilter.to || 'Present'} &nbsp;&bull;&nbsp; 
          <strong>Records:</strong> ${tab === 'enrolled' ? customers.length : tab === 'groups' ? groups.length : tab === 'cancellations' ? customers.filter(c => c.status === 'cancelled').length : expenses.length}
        </div>

        ${tableHtml}

        <div class="footer">
          Amja Travels (Pvt) Ltd &bull; Confidential Internal Report
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
};
