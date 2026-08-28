// ----------------------------------------------------
// Amja Travels CRM - Settings View (settings.js)
// ----------------------------------------------------

import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  isFirebaseConnected, 
  migrateLocalDataToFirebase,
  getCustomers,
  getGroups,
  getExpenses
} from '../db.js';

export default {
  async render(container) {
    const config = getFirebaseConfig() || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };

    const isConnected = isFirebaseConnected();
    
    // Check if there is local data that can be migrated
    let hasLocalData = false;
    try {
      const localCust = JSON.parse(localStorage.getItem('amja_crm_customers')) || [];
      const localGroups = JSON.parse(localStorage.getItem('amja_crm_groups')) || [];
      const localExp = JSON.parse(localStorage.getItem('amja_crm_expenses')) || [];
      hasLocalData = localCust.length > 0 || localGroups.length > 0 || localExp.length > 0;
    } catch (e) {}

    container.innerHTML = `
      <div class="settings-grid">
        <div class="card">
          <div class="card-header">
            <h2>Firebase Configuration</h2>
            <span class="badge ${isConnected ? 'badge-active' : 'badge-cancelled'}">
              ${isConnected ? 'Connected' : 'Offline / Local Mode'}
            </span>
          </div>
          
          <form id="firebase-config-form">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Fill in your Firebase Web App credentials below. When configured, data will sync in real-time to Google Firestore. Leaving these blank keeps your data in your browser's local storage.
            </p>

            <div class="form-group">
              <label for="apiKey">API Key *</label>
              <input type="text" id="apiKey" class="form-control" value="${config.apiKey || ''}" required placeholder="AIzaSy...">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectId">Project ID *</label>
                <input type="text" id="projectId" class="form-control" value="${config.projectId || ''}" required placeholder="amja-travels-crm">
              </div>
              <div class="form-group">
                <label for="authDomain">Auth Domain</label>
                <input type="text" id="authDomain" class="form-control" value="${config.authDomain || ''}" placeholder="amja-travels-crm.firebaseapp.com">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="storageBucket">Storage Bucket</label>
                <input type="text" id="storageBucket" class="form-control" value="${config.storageBucket || ''}" placeholder="amja-travels-crm.appspot.com">
              </div>
              <div class="form-group">
                <label for="messagingSenderId">Messaging Sender ID</label>
                <input type="text" id="messagingSenderId" class="form-control" value="${config.messagingSenderId || ''}" placeholder="1234567890">
              </div>
            </div>

            <div class="form-group">
              <label for="appId">App ID</label>
              <input type="text" id="appId" class="form-control" value="${config.appId || ''}" placeholder="1:1234567890:web:abcdef123456">
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" id="btn-save-config">Save & Connect</button>
              ${config.apiKey ? `<button type="button" class="btn btn-secondary" id="btn-disconnect-db">Disconnect (Go Offline)</button>` : ''}
            </div>
          </form>
        </div>

        <div class="settings-sidebar">
          <div class="settings-card-info" style="margin-bottom: 1.5rem;">
            <h3>Setup Guide</h3>
            <p>To connect this CRM to Firebase Firestore:</p>
            <ol>
              <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" style="color: var(--primary); font-weight: 600;">Firebase Console</a>.</li>
              <li>Create a new project named <strong>Amja Travels CRM</strong>.</li>
              <li>Navigate to <strong>Build > Firestore Database</strong> and click "Create Database". Start in test mode.</li>
              <li>Navigate to <strong>Project Settings</strong> and click the web icon (<code>&lt;/&gt;</code>) to register a Web App.</li>
              <li>Copy the configuration keys from the config script and paste them here!</li>
            </ol>
          </div>

          ${isConnected && hasLocalData ? `
            <div class="migration-banner" id="migration-box">
              <div class="migration-banner-text">
                <h4>Unsynced Local Data Found</h4>
                <p>You have customers, groups, or expenses stored locally in your browser. Sync them to Firestore now.</p>
              </div>
              <button class="btn btn-gold" id="btn-migrate-data">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Sync Data
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    const form = container.querySelector('#firebase-config-form');
    const disconnectBtn = container.querySelector('#btn-disconnect-db');
    const migrateBtn = container.querySelector('#btn-migrate-data');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = container.querySelector('#btn-save-config');
        saveBtn.disabled = true;
        saveBtn.innerText = 'Connecting...';

        const config = {
          apiKey: container.querySelector('#apiKey').value.trim(),
          authDomain: container.querySelector('#authDomain').value.trim(),
          projectId: container.querySelector('#projectId').value.trim(),
          storageBucket: container.querySelector('#storageBucket').value.trim(),
          messagingSenderId: container.querySelector('#messagingSenderId').value.trim(),
          appId: container.querySelector('#appId').value.trim()
        };

        try {
          const success = await saveFirebaseConfig(config);
          if (success) {
            window.showNotification('Connected to Firebase successfully!', 'success');
          } else {
            window.showNotification('Failed to connect to Firebase. Using offline fallback.', 'error');
          }
          // Refresh Settings Panel
          this.render(container);
          // Refresh Sidebar UI Status
          window.updateSidebarDbStatus();
        } catch (err) {
          window.showNotification('Connection Error: ' + err.message, 'error');
          saveBtn.disabled = false;
          saveBtn.innerText = 'Save & Connect';
        }
      });
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to disconnect from Firebase? The system will revert to using browser local storage.')) {
          await saveFirebaseConfig(null);
          window.showNotification('Disconnected. Now operating in local offline mode.', 'warning');
          this.render(container);
          window.updateSidebarDbStatus();
        }
      });
    }

    if (migrateBtn) {
      migrateBtn.addEventListener('click', async () => {
        migrateBtn.disabled = true;
        migrateBtn.innerHTML = 'Syncing...';
        try {
          await migrateLocalDataToFirebase();
          window.showNotification('All local data has been successfully synced to Firestore!', 'success');
          const migrationBox = container.querySelector('#migration-box');
          if (migrationBox) migrationBox.style.display = 'none';
        } catch (err) {
          window.showNotification('Migration failed: ' + err.message, 'error');
          migrateBtn.disabled = false;
          migrateBtn.innerHTML = 'Sync Data';
        }
      });
    }
  }
};
