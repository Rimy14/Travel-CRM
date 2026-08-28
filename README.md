# Amja Travels - Hajj & Umrah CRM

A modern, fast, and feature-rich Customer Relationship Management (CRM) system and tour cohort planner designed specifically for Hajj & Umrah travel operators. 

Built with a friendly Emerald Green & Gold theme, the application operates out-of-the-box using local storage, with an option to connect to a real-time cloud database via Firebase Firestore.

---

## 🌟 Key Features

*   📊 **Live Analytics Dashboard**: Displays total sales revenue, cash inflows (deposits), balances due, pre-departure expenses, on-tour expenses, and net profit margins. Includes interactive, pixel-sharp high-DPI canvas charts.
*   👥 **Pilgrim Directory**: Manage pilgrim registrations, booking statuses (Active, Completed, Cancelled), package types, and travel dates.
*   ✈️ **Document Submission Tracker**: Checks and displays pilgrim document statuses (Passport, Photos, Visa, and Vaccination status tags).
*   🗂️ **Travel Groups & Cohorts**: Group pilgrims traveling on the same dates, assign Sheikh/guides, set per-person package pricing, and track group revenues.
*   📅 **Day-wise Itinerary Planner**: Generates chronological daily plan cards (Day 1, Day 2, etc.) for Mecca, Medina, or Mina excursions, allowing custom location tags and schedules.
*   💰 **Segregated Finance Logs**: Tracks pre-departure costs (visas, air tickets) separately from on-tour expenditures (hotels, catering, transport) to evaluate precise profit margins.
*   ⚡ **Dual-Mode Cloud Sync**: Seamlessly syncs offline browser data to Google Firestore via a dynamic settings connection panel.

---

## 🚀 Getting Started (Local Setup)

Follow these instructions to get the application running on your local machine.

### Prerequisites
Make sure you have **Node.js** (v18+) and **npm** installed on your system.

### Installation Steps

1.  **Extract/Clone the repository** to your local machine:
    ```bash
    git clone https://github.com/Rimy14/Travel-CRM.git
    cd Travel-CRM
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the local development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app in your browser**:
    Navigate to the local address displayed in your terminal (usually [http://localhost:5173/](http://localhost:5173/)).

---

## ⚙️ Connecting to Firebase Firestore

The application starts in **Local Storage Mode** by default. To connect it to your live cloud database for real-time team collaboration, follow these steps:

### 1. Setup Firebase Console
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Create a project** and name it `Amja Travels`. Turn off Google Analytics for faster setup, and create the project.
3.  On the left menu, expand **Build** and select **Firestore Database**.
4.  Click **Create database**, select your region, choose **Start in test mode**, and click **Create**.

### 2. Register Web App & Get Keys
1.  Go back to the Firebase home dashboard (click **Project Overview** in the sidebar).
2.  Click the web icon (**`</>`**) to add a web app.
3.  Name it `Amja Travels CRM` (leave Firebase Hosting unchecked) and click **Register App**.
4.  Copy the keys inside the `firebaseConfig` object, for example:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "amja-travels.firebaseapp.com",
      projectId: "amja-travels",
      ...
    };
    ```

### 3. Connect and Sync Data
1.  Open your CRM app in the browser and navigate to the **Firebase Setup** tab in the sidebar.
2.  Paste your keys into the corresponding fields and click **Save & Connect**.
3.  The database status indicator on the bottom-left sidebar will turn **green** (`Firebase Synced`).
4.  If you have entered test pilgrims or logged expenses while offline, click the gold **Sync Data** button to upload all offline data directly to your Firestore database!
