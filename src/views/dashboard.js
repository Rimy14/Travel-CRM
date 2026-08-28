// ----------------------------------------------------
// Amja Travels CRM - Dashboard View (dashboard.js)
// ----------------------------------------------------

import { 
  getCustomers, 
  getGroups, 
  getExpenses 
} from '../db.js';

export default {
  async render(container) {
    const customers = await getCustomers();
    const groups = await getGroups();
    const expenses = await getExpenses();

    // Filter active and completed bookings (ignore cancelled bookings for revenue)
    const activeBookings = customers.filter(c => c.status === 'active' || c.status === 'completed');
    const cancelledCount = customers.filter(c => c.status === 'cancelled').length;

    // Financial Metrics
    const totalSales = activeBookings.reduce((sum, c) => sum + c.price, 0);
    const totalPaid = activeBookings.reduce((sum, c) => sum + c.paid, 0);
    const totalDue = totalSales - totalPaid;

    const preExpenses = expenses.filter(e => e.type === 'pre');
    const postExpenses = expenses.filter(e => e.type === 'post');

    const totalPreCost = preExpenses.reduce((sum, e) => sum + e.cost, 0);
    const totalPostCost = postExpenses.reduce((sum, e) => sum + e.cost, 0);
    const totalExpensesCost = totalPreCost + totalPostCost;
    
    // Revenue definition: Total Sales bookings value
    const netProfit = totalSales - totalExpensesCost;

    // Package Distribution
    const hajjBookings = activeBookings.filter(c => c.packageType === 'hajj').length;
    const umrahBookings = activeBookings.filter(c => c.packageType === 'umrah').length;

    container.innerHTML = `
      <!-- Stats Cards Row -->
      <div class="stats-grid">
        <div class="stat-card revenue">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="stat-info">
            <span>Total Sales Revenue</span>
            <h3>LKR ${totalSales.toLocaleString()}</h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
              Paid: LKR ${totalPaid.toLocaleString()} | Due: LKR ${totalDue.toLocaleString()}
            </p>
          </div>
        </div>

        <div class="stat-card pre-expense">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="stat-info">
            <span>Pre-Departure Costs</span>
            <h3>LKR ${totalPreCost.toLocaleString()}</h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">Visas, flights, insurance</p>
          </div>
        </div>

        <div class="stat-card post-expense">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div class="stat-info">
            <span>On-Tour Costs</span>
            <h3>LKR ${totalPostCost.toLocaleString()}</h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">Hotels, meals, local transport</p>
          </div>
        </div>

        <div class="stat-card profit">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </div>
          <div class="stat-info">
            <span>Est. Net Profit</span>
            <h3 style="color: ${netProfit >= 0 ? 'var(--status-active)' : 'var(--status-cancelled)'}">
              LKR ${netProfit.toLocaleString()}
            </h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">Sales minus total expenses</p>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Row -->
      <div class="dashboard-layout">
        <!-- Main Stats Visualization (Charts) -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- FINANCIAL CHART CARD -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h2>Financial Distribution Comparison</h2>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Sales vs Expenses vs Profit margins</span>
            </div>
            <div class="chart-container-wrapper" style="display: flex; justify-content: center; align-items: center; padding: 1rem 0;">
              <canvas id="financeBarChart" width="550" height="200" style="max-width: 100%;"></canvas>
            </div>
          </div>

          <!-- RECENT ACTIVITY LOGS -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h2>Recent Customer Bookings</h2>
              <button class="btn btn-secondary" id="btn-goto-customers" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">View All</button>
            </div>
            <div class="table-responsive">
              <table class="table" style="font-size: 0.8rem;">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Package</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeBookings.length === 0 ? `
                    <tr>
                      <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                        No active bookings logged yet.
                      </td>
                    </tr>
                  ` : activeBookings.slice(-4).reverse().map(c => `
                    <tr>
                      <td style="font-weight: 600;">${c.name}</td>
                      <td><span class="badge badge-${c.packageType}">${c.packageType}</span></td>
                      <td>LKR ${c.price.toLocaleString()}</td>
                      <td><span class="badge badge-${c.status}">${c.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Right Sidebar Widgets -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- BOOKINGS RATIO CHART -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h2>Hajj vs Umrah Ratio</h2>
            </div>
            <div class="chart-container-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px;">
              ${hajjBookings === 0 && umrahBookings === 0 ? `
                <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">No active bookings for package charts.</div>
              ` : `
                <canvas id="bookingsDonutChart" width="160" height="160" style="margin-bottom: 0.5rem;"></canvas>
                <div class="chart-legend" style="margin-top: 0.25rem;">
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: var(--primary);"></span>
                    <span>Hajj (${hajjBookings})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: var(--secondary);"></span>
                    <span>Umrah (${umrahBookings})</span>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- QUICK METRICS WIDGET -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h2>Quick Operations Summary</h2>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.875rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem;">
                <span style="color: var(--text-muted); font-weight: 500;">Active Tour Cohorts</span>
                <span style="font-weight: 700; color: var(--primary);">${groups.length} Groups</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem;">
                <span style="color: var(--text-muted); font-weight: 500;">Active Travelers</span>
                <span style="font-weight: 700; color: var(--primary);">${activeBookings.length} Pax</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem;">
                <span style="color: var(--text-muted); font-weight: 500;">Cancelled Bookings</span>
                <span style="font-weight: 700; color: var(--status-cancelled);">${cancelledCount} Bookings</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 0.25rem;">
                <span style="color: var(--text-muted); font-weight: 500;">Total Transactions</span>
                <span style="font-weight: 700; color: var(--text-main);">${expenses.length + customers.length} Records</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    this.initCharts(totalSales, totalExpensesCost, netProfit, hajjBookings, umrahBookings);
    this.bindEvents(container);
  },

  initCharts(sales, expenses, profit, hajj, umrah) {
    // 1. Finance Bar Chart
    const barCanvas = document.getElementById('financeBarChart');
    if (barCanvas) {
      const ctx = barCanvas.getContext('2d');
      
      const dpr = window.devicePixelRatio || 1;
      const rect = barCanvas.getBoundingClientRect();
      const displayWidth = rect.width || 550;
      const displayHeight = rect.height || 200;

      // Set canvas buffer sizes to be multiplied by device pixel ratio
      barCanvas.width = displayWidth * dpr;
      barCanvas.height = displayHeight * dpr;
      barCanvas.style.width = displayWidth + 'px';
      barCanvas.style.height = displayHeight + 'px';

      // Scale context to draw crisp shapes/text
      ctx.scale(dpr, dpr);

      const maxVal = Math.max(sales, expenses, Math.abs(profit)) || 100000;
      const margin = 40;
      const width = displayWidth;
      const height = displayHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Draw Grid lines
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = margin + (i * (height - margin * 2) / 4);
        ctx.beginPath();
        ctx.moveTo(margin + 20, y);
        ctx.lineTo(width - margin, y);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#9ca3af';
        ctx.font = '500 9px "Plus Jakarta Sans"';
        const labelVal = maxVal - (i * maxVal / 4);
        ctx.fillText(`LKR ${(labelVal / 1000).toFixed(0)}k`, 5, y + 3);
      }

      // Bar configs
      const labels = ['Sales Revenue', 'Total Expenses', 'Estimated Profit'];
      const values = [sales, expenses, profit];
      const colors = ['#0b5e34', '#dc2626', profit >= 0 ? '#2563eb' : '#6b7280'];
      
      const barWidth = 60;
      const startX = 80;
      const gap = (width - startX - margin - (barWidth * 3)) / 2;
      const chartBottom = height - margin;

      values.forEach((val, idx) => {
        const barHeight = (Math.max(0, val) / maxVal) * (height - margin * 2);
        const x = startX + idx * (barWidth + gap);
        const y = chartBottom - barHeight;

        // Draw bar shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        ctx.fillRect(x + 3, y + 3, barWidth, barHeight);

        // Draw actual bar
        ctx.fillStyle = colors[idx];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Add value text on top of bar
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 9px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(`LKR ${(val / 1000).toFixed(0)}k`, x + barWidth / 2, y - 6);

        // Add Category label underneath bar
        ctx.fillStyle = '#6b7280';
        ctx.font = '600 10px "Plus Jakarta Sans"';
        ctx.fillText(labels[idx], x + barWidth / 2, chartBottom + 16);
      });
    }

    // 2. Booking Donut Chart
    const donutCanvas = document.getElementById('bookingsDonutChart');
    if (donutCanvas && (hajj > 0 || umrah > 0)) {
      const ctx = donutCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = donutCanvas.getBoundingClientRect();
      const displayWidth = rect.width || 160;
      const displayHeight = rect.height || 160;

      // Set canvas buffer sizes to be multiplied by device pixel ratio
      donutCanvas.width = displayWidth * dpr;
      donutCanvas.height = displayHeight * dpr;
      donutCanvas.style.width = displayWidth + 'px';
      donutCanvas.style.height = displayHeight + 'px';

      // Scale context to draw crisp shapes/text
      ctx.scale(dpr, dpr);

      const centerX = displayWidth / 2;
      const centerY = displayHeight / 2;
      const radius = 60;
      const innerRadius = 38;

      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const total = hajj + umrah;
      const hajjAngle = (hajj / total) * Math.PI * 2;
      
      // Arc 1: Hajj
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + hajjAngle, false);
      ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + hajjAngle, -Math.PI / 2, true);
      ctx.closePath();
      ctx.fillStyle = '#0b5e34'; // Primary Emerald
      ctx.fill();

      // Arc 2: Umrah
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2 + hajjAngle, -Math.PI / 2 + Math.PI * 2, false);
      ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + Math.PI * 2, -Math.PI / 2 + hajjAngle, true);
      ctx.closePath();
      ctx.fillStyle = '#d4af37'; // Gold Accent
      ctx.fill();

      // Draw Center text: Total bookings count
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 15px "Plus Jakarta Sans"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(total.toString(), centerX, centerY - 4);

      ctx.fillStyle = '#6b7280';
      ctx.font = '600 9px "Plus Jakarta Sans"';
      ctx.fillText('Bookings', centerX, centerY + 10);
    }
  },

  bindEvents(container) {
    // Button link to customers panel
    const viewCustBtn = container.querySelector('#btn-goto-customers');
    if (viewCustBtn) {
      viewCustBtn.addEventListener('click', () => {
        // Trigger sidebar navigation click
        const sidebarCustItem = document.querySelector('.nav-item[data-view="customers"]');
        if (sidebarCustItem) sidebarCustItem.click();
      });
    }
  }
};
