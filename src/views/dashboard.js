// ----------------------------------------------------
// Amja Travels CRM - Modern Interactive Dashboard (dashboard.js)
// ----------------------------------------------------

import { 
  getCustomers, 
  getGroups, 
  getExpenses 
} from '../db.js';

let currentChartMode = 'revenue'; // 'revenue' or 'volume'

export default {
  async render(container) {
    const customers = await getCustomers();
    const groups = await getGroups();
    const expenses = await getExpenses();

    // Filter active and completed bookings
    const activeBookings = customers.filter(c => c.status === 'active' || c.status === 'completed');
    const cancelledBookings = customers.filter(c => c.status === 'cancelled');

    // Financial Metrics
    const totalSales = activeBookings.reduce((sum, c) => sum + (c.price || 0), 0);
    const totalPaid = activeBookings.reduce((sum, c) => sum + (c.paid || 0), 0);
    const totalDue = totalSales - totalPaid;
    const collectionRate = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

    const preExpenses = expenses.filter(e => e.type === 'pre');
    const postExpenses = expenses.filter(e => e.type === 'post');

    const totalPreCost = preExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);
    const totalPostCost = postExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);
    const totalExpensesCost = totalPreCost + totalPostCost;
    const netProfit = totalSales - totalExpensesCost;

    // Package Distribution
    const hajjBookings = activeBookings.filter(c => c.packageType === 'hajj');
    const umrahBookings = activeBookings.filter(c => c.packageType === 'umrah');
    const hajjRevenue = hajjBookings.reduce((sum, c) => sum + c.price, 0);
    const umrahRevenue = umrahBookings.reduce((sum, c) => sum + c.price, 0);

    // Document checklist health
    const passportCount = activeBookings.filter(c => c.documents?.passport).length;
    const visaCount = activeBookings.filter(c => c.documents?.visa).length;
    const vaccinationCount = activeBookings.filter(c => c.documents?.vaccination).length;

    // Nearest upcoming departure calculation
    const now = new Date();
    const upcomingGroups = groups
      .map(g => {
        const dep = g.departureDate ? new Date(g.departureDate) : null;
        const diffDays = dep ? Math.ceil((dep - now) / (1000 * 60 * 60 * 24)) : 999;
        const members = activeBookings.filter(c => c.groupId === g.id);
        return { ...g, diffDays, memberCount: members.length };
      })
      .sort((a, b) => (a.departureDate || '').localeCompare(b.departureDate || ''));

    container.innerHTML = `
      <!-- TOP METRIC KPI CARDS -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Total Sales Revenue</span>
            <h3 class="stat-number">LKR ${totalSales.toLocaleString()}</h3>
            <div class="stat-sub" style="color: #065f46; font-weight: 550;">
              Collected: LKR ${totalPaid.toLocaleString()} (${collectionRate}%)
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Pending Receivables</span>
            <h3 class="stat-number" style="color: ${totalDue > 0 ? '#b45309' : '#059669'};">LKR ${totalDue.toLocaleString()}</h3>
            <div class="stat-sub">
              ${activeBookings.filter(c => (c.price - c.paid) > 0).length} Pilgrims with due balance
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Total Operations Cost</span>
            <h3 class="stat-number">LKR ${totalExpensesCost.toLocaleString()}</h3>
            <div class="stat-sub">
              Pre: LKR ${totalPreCost.toLocaleString()} &bull; Tour: LKR ${totalPostCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Estimated Net Margin</span>
            <h3 class="stat-number" style="color: ${netProfit >= 0 ? '#059669' : '#dc2626'};">
              LKR ${netProfit.toLocaleString()}
            </h3>
            <div class="stat-sub">
              ${totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0}% Net Profit Margin
            </div>
          </div>
        </div>

      </div>

      <!-- MAIN DASHBOARD GRID -->
      <div class="dashboard-layout" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem;">
        
        <!-- LEFT COLUMN: INTERACTIVE CHARTS & BOOKINGS -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- MULTI-SERIES INTERACTIVE TREND CHART -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.15rem;">
                  ${currentChartMode === 'revenue' ? 'Annual Cash Flow & Financial Trends (2026)' : 'Monthly Pilgrim Enrollment Volume'}
                </h2>
                <span style="font-size: 0.75rem; color: var(--text-muted);">
                  ${currentChartMode === 'revenue' ? 'Inflow Sales Revenue vs. Direct Outflows vs. Net Profit' : 'Hajj vs. Umrah pilgrim registration trajectory'}
                </span>
              </div>
              <div class="segmented-control" style="background: #f1f5f9; padding: 2px; border-radius: 6px; display: inline-flex; gap: 2px;">
                <button class="btn-seg ${currentChartMode === 'revenue' ? 'active' : ''}" id="btn-chart-rev">Cash Flow</button>
                <button class="btn-seg ${currentChartMode === 'volume' ? 'active' : ''}" id="btn-chart-vol">Enrollments</button>
              </div>
            </div>

            <!-- Canvas Wrapper with Interactive Hover Tooltip -->
            <div style="position: relative; width: 100%; height: 220px; margin-top: 0.5rem;">
              <canvas id="mainTrendsChart" style="width: 100%; height: 220px;"></canvas>
              <div id="chartTooltip" style="display: none; position: absolute; background: #0f172a; color: white; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.75rem; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 10; border: 1px solid rgba(255,255,255,0.15);"></div>
            </div>

            <!-- Chart Custom Legend -->
            <div style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-muted);">
              ${currentChartMode === 'revenue' ? `
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #065f46; display: inline-block;"></span>
                  <span style="font-weight: 550; color: #0f172a;">Sales Inflow</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #e11d48; display: inline-block;"></span>
                  <span style="font-weight: 550; color: #0f172a;">Expenses</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #2563eb; display: inline-block;"></span>
                  <span style="font-weight: 550; color: #0f172a;">Net Margin</span>
                </div>
              ` : `
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 10px; height: 10px; border-radius: 2px; background: #065f46; display: inline-block;"></span>
                  <span style="font-weight: 550; color: #0f172a;">Hajj Bookings</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="width: 10px; height: 10px; border-radius: 2px; background: #d97706; display: inline-block;"></span>
                  <span style="font-weight: 550; color: #0f172a;">Umrah Bookings</span>
                </div>
              `}
            </div>
          </div>

          <!-- RECENT BOOKINGS TABLE -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.15rem;">Recent Pilgrim Enrollments</h2>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Latest registered bookings and payment status</span>
              </div>
              <button class="btn btn-secondary" id="btn-goto-customers" style="padding: 0.3rem 0.7rem; font-size: 0.75rem;">
                View All (${activeBookings.length})
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table" style="font-size: 0.8rem;">
                <thead>
                  <tr>
                    <th>Pilgrim Name</th>
                    <th>Package</th>
                    <th>Departure Date</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Paid Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeBookings.length === 0 ? `
                    <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No active bookings found. Click "Quick Actions" to register a pilgrim.</td></tr>
                  ` : activeBookings.slice(-4).reverse().map(c => `
                    <tr>
                      <td style="font-weight: 600; color: var(--text-main);">${c.name}</td>
                      <td><span class="badge badge-${c.packageType}">${c.packageType}</span></td>
                      <td style="color: var(--text-muted); font-size: 0.78rem;">${c.departureDate || 'TBD'}</td>
                      <td style="text-align: right; font-family: monospace; font-size: 0.82rem; font-weight: 600;">LKR ${c.price.toLocaleString()}</td>
                      <td style="text-align: right; font-family: monospace; font-size: 0.82rem; color: #059669; font-weight: 600;">LKR ${c.paid.toLocaleString()}</td>
                      <td><span class="badge badge-${c.status}">${c.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: RATIOS, ACTIVE COHORTS & OPERATIONS CHECKLIST -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- PACKAGE RATIO & REVENUE ALLOCATION -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h2 style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">Package Ratio & Allocation</h2>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-around; padding: 0.5rem 0;">
              <canvas id="bookingsDonutChart" width="130" height="130" style="max-width: 130px; max-height: 130px;"></canvas>
              
              <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.78rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="width: 8px; height: 8px; border-radius: 2px; background: #065f46;"></span>
                  <div>
                    <div style="font-weight: 600; color: var(--text-main);">Hajj (${hajjBookings.length} Pax)</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">LKR ${hajjRevenue.toLocaleString()}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="width: 8px; height: 8px; border-radius: 2px; background: #d97706;"></span>
                  <div>
                    <div style="font-weight: 600; color: var(--text-main);">Umrah (${umrahBookings.length} Pax)</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">LKR ${umrahRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Collection Progress Bar -->
            <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.35rem;">
                <span style="color: var(--text-muted); font-weight: 550;">Overall Inflow Collection</span>
                <span style="font-weight: 700; color: #065f46;">${collectionRate}%</span>
              </div>
              <div style="height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; border: 1px solid var(--border-color);">
                <div style="height: 100%; width: ${collectionRate}%; background: #065f46; border-radius: 3px;"></div>
              </div>
            </div>
          </div>

          <!-- UPCOMING COHORTS & CAPACITY -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">Tour Cohorts Capacity</h2>
              <button class="btn btn-secondary" id="btn-goto-groups" style="padding: 0.25rem 0.6rem; font-size: 0.7rem;">Manage</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${upcomingGroups.length === 0 ? `
                <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 1rem;">No tour cohorts established.</div>
              ` : upcomingGroups.map(g => {
                const targetCapacity = g.capacity || 20;
                const percent = Math.min(100, Math.round((g.memberCount / targetCapacity) * 100));
                const isImminent = g.diffDays >= 0 && g.diffDays <= 14;

                return `
                  <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 6px; padding: 0.65rem 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
                      <div>
                        <div style="font-weight: 600; font-size: 0.8125rem; color: var(--text-main);">${g.name}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">
                          ${g.departureDate || 'Date TBD'} &bull; ${g.guide || 'Guide TBD'}
                        </div>
                      </div>
                      <span class="badge ${g.type === 'umrah' ? 'badge-umrah' : 'badge-hajj'}" style="font-size: 0.65rem;">
                        ${g.diffDays >= 0 && g.diffDays <= 30 ? (g.diffDays === 0 ? 'Today' : `in ${g.diffDays}d`) : (g.type || 'hajj')}
                      </span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                      <span>Enrolled: <strong>${g.memberCount} Pilgrims</strong></span>
                      <span>Cap: ${targetCapacity} Pax</span>
                    </div>
                    <div style="height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                      <div style="height: 100%; width: ${percent}%; background: ${percent >= 80 ? '#059669' : '#3b82f6'};"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- DOCUMENT VERIFICATION HEALTH CHECKLIST -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h2 style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">Operations & Document Readiness</h2>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.78rem;">
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  Passport Submissions:
                </span>
                <span style="font-weight: 600; color: ${passportCount === activeBookings.length && activeBookings.length > 0 ? '#059669' : '#b45309'};">
                  ${passportCount} / ${activeBookings.length} Verified
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  Visa Issuances:
                </span>
                <span style="font-weight: 600; color: ${visaCount === activeBookings.length && activeBookings.length > 0 ? '#059669' : '#b45309'};">
                  ${visaCount} / ${activeBookings.length} Issued
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                  Vaccinations & Medicals:
                </span>
                <span style="font-weight: 600; color: ${vaccinationCount === activeBookings.length && activeBookings.length > 0 ? '#059669' : '#b45309'};">
                  ${vaccinationCount} / ${activeBookings.length} Cleared
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    `;

    this.initInteractiveTrendsChart(customers, expenses);
    this.initDonutChart(hajjBookings.length, umrahBookings.length);
    this.bindEvents(container);
  },

  // 1. Multi-series Smooth Spline Area Chart with Real-time Tooltips
  initInteractiveTrendsChart(customers, expenses) {
    const canvas = document.getElementById('mainTrendsChart');
    const tooltip = document.getElementById('chartTooltip');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = 220;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Aggregate real data by month index (0-11)
    const monthlySales = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);
    const monthlyHajj = new Array(12).fill(0);
    const monthlyUmrah = new Array(12).fill(0);

    customers.forEach(c => {
      if (c.status !== 'cancelled') {
        const date = c.departureDate ? new Date(c.departureDate) : new Date();
        const m = isNaN(date.getMonth()) ? 8 : date.getMonth();
        monthlySales[m] += (c.price || 0);
        if (c.packageType === 'hajj') monthlyHajj[m] += 1;
        else monthlyUmrah[m] += 1;
      }
    });

    expenses.forEach(e => {
      const date = e.date ? new Date(e.date) : new Date();
      const m = isNaN(date.getMonth()) ? 8 : date.getMonth();
      monthlyExpenses[m] += (e.cost || 0);
    });

    // Calculate net profits
    const monthlyProfit = monthlySales.map((s, idx) => s - monthlyExpenses[idx]);

    // Chart dimensions
    const padL = 48;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    let maxVal = currentChartMode === 'revenue' 
      ? Math.max(...monthlySales, ...monthlyExpenses, 500000) * 1.2
      : Math.max(...monthlyHajj.map((h, i) => h + monthlyUmrah[i]), 5) * 1.3;

    // Draw Grid Lines
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, sans-serif';

    for (let i = 0; i <= 4; i++) {
      const y = padT + (i * plotH / 4);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      const val = maxVal - (i * maxVal / 4);
      const label = currentChartMode === 'revenue' 
        ? `${(val / 1000).toFixed(0)}k` 
        : Math.round(val).toString();
      ctx.fillText(label, 6, y + 3);
    }

    // Month X Labels & Coordinates
    const xCoords = months.map((m, idx) => {
      const x = padL + (idx * plotW / (months.length - 1));
      ctx.fillText(m, x - 10, height - 8);
      return x;
    });

    if (currentChartMode === 'revenue') {
      // Draw Smooth Spline Gradient Area for Sales
      const getY = (val) => padT + plotH - (Math.max(0, val) / maxVal * plotH);

      // Area Gradient Fill
      const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
      grad.addColorStop(0, 'rgba(6, 95, 70, 0.25)');
      grad.addColorStop(1, 'rgba(6, 95, 70, 0.0)');

      ctx.beginPath();
      ctx.moveTo(xCoords[0], padT + plotH);
      xCoords.forEach((x, idx) => {
        const y = getY(monthlySales[idx]);
        if (idx === 0) ctx.lineTo(x, y);
        else {
          const prevX = xCoords[idx - 1];
          const prevY = getY(monthlySales[idx - 1]);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.lineTo(xCoords[11], padT + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Sales Line
      ctx.beginPath();
      xCoords.forEach((x, idx) => {
        const y = getY(monthlySales[idx]);
        if (idx === 0) ctx.moveTo(x, y);
        else {
          const prevX = xCoords[idx - 1];
          const prevY = getY(monthlySales[idx - 1]);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Expenses Line
      ctx.beginPath();
      xCoords.forEach((x, idx) => {
        const y = getY(monthlyExpenses[idx]);
        if (idx === 0) ctx.moveTo(x, y);
        else {
          const prevX = xCoords[idx - 1];
          const prevY = getY(monthlyExpenses[idx - 1]);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Profit Line
      ctx.beginPath();
      xCoords.forEach((x, idx) => {
        const y = getY(monthlyProfit[idx]);
        if (idx === 0) ctx.moveTo(x, y);
        else {
          const prevX = xCoords[idx - 1];
          const prevY = getY(monthlyProfit[idx - 1]);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point Dots for Data Nodes
      xCoords.forEach((x, idx) => {
        if (monthlySales[idx] > 0) {
          ctx.beginPath();
          ctx.arc(x, getY(monthlySales[idx]), 4, 0, Math.PI * 2);
          ctx.fillStyle = '#065f46';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        }
      });
    } else {
      // Volume Mode: Stacked Rounded Bars
      const barW = Math.max(14, (plotW / 12) - 12);
      xCoords.forEach((x, idx) => {
        const hajj = monthlyHajj[idx];
        const umrah = monthlyUmrah[idx];
        const total = hajj + umrah;

        if (total > 0) {
          const hHajj = (hajj / maxVal) * plotH;
          const hUmrah = (umrah / maxVal) * plotH;
          const baseY = padT + plotH;

          // Hajj bar segment
          if (hajj > 0) {
            ctx.fillStyle = '#065f46';
            ctx.fillRect(x - barW / 2, baseY - hHajj, barW, hHajj);
          }

          // Umrah bar segment
          if (umrah > 0) {
            ctx.fillStyle = '#d97706';
            ctx.fillRect(x - barW / 2, baseY - hHajj - hUmrah, barW, hUmrah);
          }

          // Value top label
          ctx.fillStyle = '#0f172a';
          ctx.font = '600 10px sans-serif';
          ctx.fillText(`${total}`, x - 3, baseY - hHajj - hUmrah - 4);
        }
      });
    }

    // Mouse Move Event for Tooltip
    canvas.onmousemove = (e) => {
      const mouseX = e.offsetX;
      // Find nearest month
      let nearestIdx = 0;
      let minDiff = Infinity;
      xCoords.forEach((x, idx) => {
        const diff = Math.abs(x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          nearestIdx = idx;
        }
      });

      if (minDiff < (plotW / 12)) {
        const mName = months[nearestIdx];
        if (currentChartMode === 'revenue') {
          tooltip.innerHTML = `
            <div style="font-weight: 700; color: #a7f3d0; margin-bottom: 2px;">${mName} 2026</div>
            <div>Inflow: <strong>LKR ${monthlySales[nearestIdx].toLocaleString()}</strong></div>
            <div style="color: #fecdd3;">Expenses: LKR ${monthlyExpenses[nearestIdx].toLocaleString()}</div>
            <div style="color: #bfdbfe;">Net Profit: LKR ${monthlyProfit[nearestIdx].toLocaleString()}</div>
          `;
        } else {
          tooltip.innerHTML = `
            <div style="font-weight: 700; color: #a7f3d0; margin-bottom: 2px;">${mName} 2026</div>
            <div>Hajj: <strong>${monthlyHajj[nearestIdx]} Pax</strong></div>
            <div>Umrah: <strong>${monthlyUmrah[nearestIdx]} Pax</strong></div>
          `;
        }
        tooltip.style.display = 'block';
        tooltip.style.left = `${Math.min(width - 150, Math.max(10, xCoords[nearestIdx] - 60))}px`;
        tooltip.style.top = '10px';
      } else {
        tooltip.style.display = 'none';
      }
    };

    canvas.onmouseleave = () => {
      tooltip.style.display = 'none';
    };
  },

  // 2. High-DPI Donut Chart
  initDonutChart(hajjCount, umrahCount) {
    const canvas = document.getElementById('bookingsDonutChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 130;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const total = hajjCount + umrahCount;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 50;
    const cutout = 34;

    ctx.clearRect(0, 0, size, size);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.arc(cx, cy, cutout, Math.PI * 2, 0, true);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      return;
    }

    const hajjAngle = (hajjCount / total) * Math.PI * 2;

    // Hajj Segment
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + hajjAngle);
    ctx.arc(cx, cy, cutout, -Math.PI / 2 + hajjAngle, -Math.PI / 2, true);
    ctx.fillStyle = '#065f46';
    ctx.fill();

    // Umrah Segment
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2 + hajjAngle, -Math.PI / 2 + Math.PI * 2);
    ctx.arc(cx, cy, cutout, -Math.PI / 2 + Math.PI * 2, -Math.PI / 2 + hajjAngle, true);
    ctx.fillStyle = '#d97706';
    ctx.fill();

    // Center Total Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${total}`, cx, cy - 4);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 8px sans-serif';
    ctx.fillText('Pax', cx, cy + 9);
  },

  bindEvents(container) {
    const revBtn = container.querySelector('#btn-chart-rev');
    const volBtn = container.querySelector('#btn-chart-vol');

    if (revBtn && volBtn) {
      revBtn.addEventListener('click', () => {
        currentChartMode = 'revenue';
        this.render(container);
      });
      volBtn.addEventListener('click', () => {
        currentChartMode = 'volume';
        this.render(container);
      });
    }

    const gotoCust = container.querySelector('#btn-goto-customers');
    if (gotoCust) {
      gotoCust.addEventListener('click', () => {
        const custTab = document.querySelector('[data-view="customers"]');
        if (custTab) custTab.click();
      });
    }

    const gotoGroups = container.querySelector('#btn-goto-groups');
    if (gotoGroups) {
      gotoGroups.addEventListener('click', () => {
        const groupTab = document.querySelector('[data-view="groups"]');
        if (groupTab) groupTab.click();
      });
    }
  }
};
