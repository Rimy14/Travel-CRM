// ----------------------------------------------------
// Amja Travels CRM - Invoices & Payment Receipts (invoices.js)
// ----------------------------------------------------

import { 
  getCustomers, 
  getPayments, 
  recordPayment,
  getGroups 
} from '../db.js';

let invoiceFilter = 'all'; // 'all', 'due', 'settled'
let invoiceSearchQuery = '';

export default {
  async render(container) {
    const customers = await getCustomers();
    const payments = await getPayments();
    const groups = await getGroups();

    const activePilgrims = customers.filter(c => c.status !== 'cancelled');

    // Aggregate metrics
    const totalInvoiced = activePilgrims.reduce((sum, c) => sum + (c.price || 0), 0);
    const totalCollected = activePilgrims.reduce((sum, c) => sum + (c.paid || 0), 0);
    const totalOutstanding = totalInvoiced - totalCollected;
    const fullySettledCount = activePilgrims.filter(c => (c.price - c.paid) <= 0).length;
    const pendingDueCount = activePilgrims.filter(c => (c.price - c.paid) > 0).length;

    // Filter pilgrims
    const filteredPilgrims = activePilgrims.filter(c => {
      const isSettled = (c.price - c.paid) <= 0;
      if (invoiceFilter === 'due' && isSettled) return false;
      if (invoiceFilter === 'settled' && !isSettled) return false;

      if (invoiceSearchQuery) {
        const q = invoiceSearchQuery.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone) return false;
      }
      return true;
    });

    container.innerHTML = `
      <!-- TOP BILLING KPI METRICS -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.25rem;">
        
        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Total Invoiced Amount</span>
            <h3 class="stat-number">LKR ${totalInvoiced.toLocaleString()}</h3>
            <div class="stat-sub">${activePilgrims.length} Total Registered Invoices</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Total Collected to Date</span>
            <h3 class="stat-number" style="color: #059669;">LKR ${totalCollected.toLocaleString()}</h3>
            <div class="stat-sub">${totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}% Realized Inflow</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Outstanding Receivables</span>
            <h3 class="stat-number" style="color: ${totalOutstanding > 0 ? '#b45309' : '#059669'};">LKR ${totalOutstanding.toLocaleString()}</h3>
            <div class="stat-sub">${pendingDueCount} Pilgrims with Pending Balance</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-title">Receipts Issued</span>
            <h3 class="stat-number">${payments.length} Vouchers</h3>
            <div class="stat-sub">${fullySettledCount} Fully Cleared Accounts</div>
          </div>
        </div>

      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="filter-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <!-- Status Segmented Control -->
            <div class="segmented-control" style="background: #f1f5f9; padding: 3px; border-radius: 6px; display: inline-flex; gap: 2px;">
              <button class="btn-seg ${invoiceFilter === 'all' ? 'active' : ''}" data-inv-filter="all">All Invoices (${activePilgrims.length})</button>
              <button class="btn-seg ${invoiceFilter === 'due' ? 'active' : ''}" data-inv-filter="due">Pending Due (${pendingDueCount})</button>
              <button class="btn-seg ${invoiceFilter === 'settled' ? 'active' : ''}" data-inv-filter="settled">Fully Settled (${fullySettledCount})</button>
            </div>

            <!-- Search input -->
            <div style="position: relative;">
              <input type="text" id="input-search-invoices" placeholder="Search pilgrim or phone..." value="${invoiceSearchQuery}" style="padding: 6px 12px; font-size: 0.8125rem; border: 1px solid var(--border-color); border-radius: 6px; width: 220px;" />
            </div>
          </div>

          <!-- Quick Action -->
          <button class="btn btn-primary" id="btn-quick-payment" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            + Record Installment Payment
          </button>

        </div>
      </div>

      <!-- PILGRIM INVOICES TABLE -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div>
            <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">Pilgrim Invoices & Settlement Ledger</h2>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Package cost breakdown, amount received, balance due, and official receipt generation</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table" style="font-size: 0.8125rem;">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Pilgrim Details</th>
                <th>Tour Package</th>
                <th style="text-align: right;">Total Price</th>
                <th style="text-align: right;">Amount Paid</th>
                <th style="text-align: right;">Balance Due</th>
                <th>Settlement Progress</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPilgrims.length === 0 ? `
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No invoices match this filter criteria.</td></tr>
              ` : filteredPilgrims.map((p, idx) => {
                const due = (p.price || 0) - (p.paid || 0);
                const isFullyPaid = due <= 0;
                const percent = Math.min(100, Math.round(((p.paid || 0) / (p.price || 1)) * 100));
                const invoiceNum = `INV-2026-00${idx + 1}`;

                return `
                  <tr>
                    <td><strong style="font-family: monospace; color: #475569;">${invoiceNum}</strong></td>
                    <td>
                      <div style="font-weight: 600; color: var(--text-main);">${p.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${p.phone}</div>
                    </td>
                    <td>
                      <span class="badge badge-${p.packageType}">${p.packageType}</span>
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 600;">
                      LKR ${(p.price || 0).toLocaleString()}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 600; color: #059669;">
                      LKR ${(p.paid || 0).toLocaleString()}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 700; color: ${isFullyPaid ? '#059669' : '#b45309'};">
                      ${isFullyPaid ? 'LKR 0 (Settled)' : `LKR ${due.toLocaleString()}`}
                    </td>
                    <td style="min-width: 140px;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">
                        <span>${percent}% Paid</span>
                        <span>${isFullyPaid ? 'Complete' : 'Partial'}</span>
                      </div>
                      <div style="height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${percent}%; background: ${isFullyPaid ? '#059669' : '#d97706'};"></div>
                      </div>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.35rem;">
                        <button class="btn btn-secondary btn-print-receipt" data-cust-id="${p.id}" data-inv-num="${invoiceNum}" style="padding: 3px 8px; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;" title="Print Official Receipt">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                          Receipt
                        </button>
                        <button class="btn btn-primary btn-record-single-pay" data-cust-id="${p.id}" data-cust-name="${p.name}" data-due="${due}" style="padding: 3px 8px; font-size: 0.72rem;">
                          + Pay
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAYMENT TRANSACTION VOUCHERS -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <div>
            <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">Recent Payment Transactions & Vouchers</h2>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Recorded receipts, payment modes (Cash / Bank Transfer / Card), and bank references</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table" style="font-size: 0.8125rem;">
            <thead>
              <tr>
                <th>Receipt Voucher</th>
                <th>Payment Date</th>
                <th>Pilgrim Name</th>
                <th>Payment Method</th>
                <th>Bank Reference / Slip</th>
                <th style="text-align: right;">Amount Paid</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${payments.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No separate payment transactions logged yet. Click "+ Record Installment Payment" to issue a receipt voucher.</td></tr>
              ` : payments.slice().reverse().map(pay => `
                <tr>
                  <td><strong style="font-family: monospace; color: #065f46;">${pay.receiptNo}</strong></td>
                  <td>${pay.paymentDate || 'N/A'}</td>
                  <td><strong>${pay.customerName}</strong></td>
                  <td><span class="badge" style="background: #f1f5f9; border: 1px solid #cbd5e1; font-size: 0.7rem;">${pay.paymentMethod}</span></td>
                  <td style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">${pay.reference || 'N/A'}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">LKR ${(pay.amount || 0).toLocaleString()}</td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-print-single-voucher" data-pay-id="${pay.id}" style="padding: 2px 7px; font-size: 0.7rem;">Print Slip</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: RECORD PAYMENT -->
      <div class="modal" id="modal-payment" style="display: none;">
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Record Pilgrim Payment</h3>
            <button class="modal-close" id="btn-close-pay-modal">&times;</button>
          </div>
          <form id="form-payment">
            <div class="form-group">
              <label>Select Pilgrim Traveler *</label>
              <select id="pay-pilgrim-select" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color);">
                <option value="">-- Choose pilgrim --</option>
                ${activePilgrims.map(p => {
                  const due = (p.price || 0) - (p.paid || 0);
                  return `<option value="${p.id}" data-name="${p.name}" data-due="${due}">
                    ${p.name} (Due: LKR ${due.toLocaleString()})
                  </option>`;
                }).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Payment Amount (LKR) *</label>
                <input type="number" id="pay-amount" required min="1000" step="500" placeholder="e.g. 200000" />
              </div>
              <div class="form-group">
                <label>Payment Date *</label>
                <input type="date" id="pay-date" required value="${new Date().toISOString().substring(0, 10)}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Payment Method *</label>
                <select id="pay-method">
                  <option value="Bank Transfer">Bank Transfer / Online</option>
                  <option value="Cash">Cash (Office Collection)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div class="form-group">
                <label>Bank Reference / Slip No</label>
                <input type="text" id="pay-ref" placeholder="e.g. BOC-TX-8823" />
              </div>
            </div>

            <div class="form-group">
              <label>Payment Notes / Milestones</label>
              <input type="text" id="pay-notes" placeholder="e.g. 2nd Installment - Visa Fee payment" />
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-pay">Cancel</button>
              <button type="submit" class="btn btn-primary">Generate Receipt & Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.bindEvents(container, customers, payments, groups);
  },

  bindEvents(container, customers, payments, groups) {
    // Status filter buttons
    container.querySelectorAll('[data-inv-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        invoiceFilter = e.target.getAttribute('data-inv-filter');
        this.render(container);
      });
    });

    // Search input
    const searchInput = container.querySelector('#input-search-invoices');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        invoiceSearchQuery = e.target.value;
        this.render(container);
      });
    }

    // Modal handling
    const payModal = container.querySelector('#modal-payment');
    const openPay = () => { payModal.style.display = 'flex'; };
    const closePay = () => { payModal.style.display = 'none'; };
    container.querySelector('#btn-quick-payment').addEventListener('click', openPay);
    container.querySelector('#btn-close-pay-modal').addEventListener('click', closePay);
    container.querySelector('#btn-cancel-pay').addEventListener('click', closePay);

    // Single Pilgrim "+ Pay" Button
    container.querySelectorAll('.btn-record-single-pay').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const custId = e.currentTarget.getAttribute('data-cust-id');
        const due = e.currentTarget.getAttribute('data-due');
        const select = container.querySelector('#pay-pilgrim-select');
        select.value = custId;
        if (due && Number(due) > 0) {
          container.querySelector('#pay-amount').value = due;
        }
        openPay();
      });
    });

    // Submit Payment
    const formPay = container.querySelector('#form-payment');
    if (formPay) {
      formPay.addEventListener('submit', async (e) => {
        e.preventDefault();
        const select = container.querySelector('#pay-pilgrim-select');
        const customerId = select.value;
        const customerName = select.options[select.selectedIndex].getAttribute('data-name');
        const amount = Number(container.querySelector('#pay-amount').value);
        const paymentDate = container.querySelector('#pay-date').value;
        const paymentMethod = container.querySelector('#pay-method').value;
        const reference = container.querySelector('#pay-ref').value;
        const notes = container.querySelector('#pay-notes').value;

        if (!customerId || !amount) {
          alert('Please select pilgrim and enter valid payment amount.');
          return;
        }

        const newPayment = await recordPayment({
          customerId,
          customerName,
          amount,
          paymentDate,
          paymentMethod,
          reference,
          notes
        });

        window.showNotification(`Payment recorded! Receipt: ${newPayment.receiptNo}`, 'success');
        closePay();
        this.render(container);
      });
    }

    // Print Official Receipt
    container.querySelectorAll('.btn-print-receipt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const custId = e.currentTarget.getAttribute('data-cust-id');
        const invNum = e.currentTarget.getAttribute('data-inv-num');
        const pilgrim = customers.find(c => c.id === custId);
        if (pilgrim) {
          this.printOfficialReceipt(pilgrim, invNum, payments, groups);
        }
      });
    });

    // Print Single Voucher
    container.querySelectorAll('.btn-print-single-voucher').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const payId = e.currentTarget.getAttribute('data-pay-id');
        const pay = payments.find(p => p.id === payId);
        const pilgrim = customers.find(c => c.id === pay.customerId) || { name: pay.customerName, phone: 'N/A', packageType: 'Hajj/Umrah', price: pay.amount, paid: pay.amount };
        this.printOfficialReceipt(pilgrim, pay.receiptNo, [pay], groups);
      });
    });
  },

  // Direct In-page Print for Official Branded Receipt
  printOfficialReceipt(pilgrim, invoiceOrReceiptNo, payments, groups) {
    const group = groups.find(g => g.id === pilgrim.groupId);
    const due = (pilgrim.price || 0) - (pilgrim.paid || 0);

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amja Travels - Official Payment Receipt (${invoiceOrReceiptNo})</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.5; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; letter-spacing: -0.02em; }
          .sub { font-size: 11px; color: #64748b; margin-top: 3px; }
          .meta-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; background: #f8fafc; padding: 0.85rem; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 1.25rem; font-size: 11px; }
          .meta-label { color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 600; }
          .meta-val { font-weight: 700; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 0.75rem; margin-bottom: 1.25rem; }
          th { background: #f8fafc; text-align: left; padding: 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; }
          td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
          .total-box { margin-left: auto; width: 280px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.75rem; font-size: 11px; margin-bottom: 2rem; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .sign-area { display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1rem; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #475569; }
          .footer { margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS (PVT) LTD</h1>
            <div class="sub">Hajj & Umrah Tour Operators &bull; License No: SL-MR-9821</div>
            <div class="sub">124 Main Street, Colombo 03, Sri Lanka &bull; Tel: +94 11 234 5678</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 800; color: #065f46;">OFFICIAL PAYMENT RECEIPT</div>
            <div style="font-size: 11px; font-family: monospace; color: #475569; margin-top: 2px;">Receipt #: <strong>${invoiceOrReceiptNo}</strong></div>
            <div class="sub">Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta-box">
          <div>
            <div class="meta-label">Pilgrim Name</div>
            <div class="meta-val">${pilgrim.name}</div>
            <div style="color: #64748b; font-size: 10px;">Contact: ${pilgrim.phone}</div>
          </div>
          <div>
            <div class="meta-label">Package & Tour Cohort</div>
            <div class="meta-val" style="text-transform: uppercase;">${pilgrim.packageType} PACKAGE</div>
            <div style="color: #64748b; font-size: 10px;">Cohort: ${group ? group.name : 'Amja Travels Group'}</div>
          </div>
          <div>
            <div class="meta-label">Departure Date</div>
            <div class="meta-val">${pilgrim.departureDate || '2026-09-06'}</div>
            <div style="color: #059669; font-size: 10px; font-weight: 600;">Status: Active / Confirmed</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description / Itemized Inclusions</th>
              <th>Package Category</th>
              <th style="text-align: right;">Package Total (LKR)</th>
              <th style="text-align: right;">Amount Paid (LKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Complete ${pilgrim.packageType.toUpperCase()} Pilgrimage Package</strong>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                  Includes Return Air Tickets, Saudi Visa & Nusuk Registration, Makkah & Madinah Hotel Accommodation, 3 Daily Meals, Haramain Train Transfers, and Ziyarah Guided Tours.
                </div>
              </td>
              <td>${pilgrim.packageType.toUpperCase()}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 600;">LKR ${(pilgrim.price || 0).toLocaleString()}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">LKR ${(pilgrim.paid || 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row">
            <span>Total Package Price:</span>
            <span style="font-weight: 600; font-family: monospace;">LKR ${(pilgrim.price || 0).toLocaleString()}</span>
          </div>
          <div class="total-row" style="color: #059669; font-weight: 700;">
            <span>Total Received / Paid:</span>
            <span style="font-family: monospace;">LKR ${(pilgrim.paid || 0).toLocaleString()}</span>
          </div>
          <div class="total-row" style="border-top: 1px solid #cbd5e1; padding-top: 4px; margin-top: 4px; font-weight: 700; color: ${due <= 0 ? '#059669' : '#b45309'};">
            <span>Outstanding Balance:</span>
            <span style="font-family: monospace;">${due <= 0 ? 'LKR 0 (Settled)' : `LKR ${due.toLocaleString()}`}</span>
          </div>
        </div>

        <div class="sign-area">
          <div>
            <div style="font-weight: 600; margin-bottom: 25px;">Pilgrim / Payer Signature:</div>
            <div>_____________________________</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; margin-bottom: 25px;">Authorized Agency Officer:</div>
            <div style="color: #065f46; font-weight: 700;">Amja Travels &bull; Official Seal</div>
            <div>_____________________________</div>
          </div>
        </div>

        <div class="footer">
          Amja Travels (Pvt) Ltd &bull; This is an official computer-generated receipt &bull; Thank you for choosing Amja Travels.
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
