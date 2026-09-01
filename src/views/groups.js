// ----------------------------------------------------
// Amja Travels CRM - Groups & Itinerary Planner (groups.js)
// ----------------------------------------------------

import { 
  getGroups, 
  saveGroup, 
  deleteGroup, 
  getCustomers, 
  saveCustomer 
} from '../db.js';

let groupList = [];
let customerList = [];
let activeTab = 'directory'; // 'directory' or 'itinerary'
let selectedGroupId = null;

// Predefined Itinerary Templates for quick 1-click loading
const PREDEFINED_TEMPLATES = {
  umrah14: {
    id: 'umrah14',
    name: '14-Day Classic Umrah Itinerary',
    badge: '14 Days • Umrah',
    description: 'Standard complete Umrah itinerary covering Makkah arrival, guided Tawaf & Sa\'ee, historical Makkah Ziyarat, Haramain High-Speed Train, and Madinah Munawwarah with Rawdah permits and daily prayer timetables.',
    days: [
      {
        dayNum: 1, location: 'travel',
        activity: 'Arrival at Jeddah King Abdulaziz Airport (Terminal 1). Meet Amja Travels representative. Chartered luxury AC bus transfer to Makkah hotel. Check-in and rest.',
        note: 'Wear Ihram before flight boarding or at Miqat Yalamlam.',
        timetable: [
          { time: '02:00 PM', activity: 'Flight arrival at Jeddah International Airport' },
          { time: '04:30 PM', activity: 'Board chartered luxury AC bus to Makkah' },
          { time: '06:30 PM', activity: 'Hotel check-in at Makkah & room key distribution' },
          { time: '08:30 PM', activity: 'Welcome dinner buffet & Umrah orientation lecture' }
        ]
      },
      {
        dayNum: 2, location: 'mecca',
        activity: 'Perform Umrah rituals together as a group. Guided Tawaf around the Holy Kaaba, Sa\'ee between Safa & Marwah, and Halq/Taqseer (hair cut).',
        note: 'Stay hydrated with Zamzam water during Sa\'ee.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr prayer inside Masjid al-Haram' },
          { time: '07:30 AM', activity: 'Buffet breakfast at hotel restaurant' },
          { time: '09:00 AM', activity: 'Group assembly in hotel lobby for Umrah rituals' },
          { time: '09:30 AM', activity: 'Guided Tawaf led by Sheikh' },
          { time: '11:30 AM', activity: 'Sa\'ee between Safa and Marwah' },
          { time: '01:00 PM', activity: 'Halq/Taqseer (hair cut) & completion of Umrah' },
          { time: '08:30 PM', activity: 'Dinner buffet at hotel' }
        ]
      },
      {
        dayNum: 3, location: 'mecca',
        activity: 'Day of rest, personal Ibadah, and individual prayers in Masjid al-Haram. Evening spiritual lecture.',
        note: 'Rest well after Umrah rituals.',
        timetable: [
          { time: '04:30 AM', activity: 'Tahajjud & Fajr prayer at Haram' },
          { time: '01:00 PM', activity: 'Dhuhr prayer and lunch' },
          { time: '05:30 PM', activity: 'Sheikh Rizwan Lecture: Virtues and Etiquette of Makkah' },
          { time: '08:00 PM', activity: 'Isha prayer and dinner' }
        ]
      },
      {
        dayNum: 4, location: 'mecca',
        activity: 'Historical Makkah Ziyarat Tour by VIP coach: Jabal al-Nour (Cave of Hira), Mount Thawr, Mina, Muzdalifah, and Jabal al-Rahmah (Arafat).',
        note: 'Wear comfortable walking footwear and bring cameras/water.',
        timetable: [
          { time: '06:30 AM', activity: 'Breakfast buffet' },
          { time: '07:30 AM', activity: 'Board chartered VIP coaches for Makkah Ziyarat' },
          { time: '08:30 AM', activity: 'Visit Cave of Hira (Jabal al-Nour)' },
          { time: '10:00 AM', activity: 'Visit Mount Thawr & Mina tent plain' },
          { time: '11:30 AM', activity: 'Dua session at Mount Arafat (Jabal al-Rahmah)' },
          { time: '01:30 PM', activity: 'Return to hotel for Dhuhr and rest' }
        ]
      },
      {
        dayNum: 5, location: 'mecca',
        activity: 'Jummah prayer at Masjid al-Haram. Group Quran recitation and evening Dua.',
        note: 'Enter Haram by 09:30 AM to secure spots before gates close.',
        timetable: [
          { time: '09:00 AM', activity: 'Early departure for Jummah prayer at Masjid al-Haram' },
          { time: '12:30 PM', activity: 'Jummah Khutbah and Prayer' },
          { time: '04:00 PM', activity: 'Asr prayer and group Quran recitation circle' },
          { time: '08:30 PM', activity: 'Dinner buffet' }
        ]
      },
      {
        dayNum: 6, location: 'mecca',
        activity: 'Free day for shopping, visiting local historic exhibitions, or performing a second Umrah from Masjid Aisha (Taneem).',
        note: 'Taxis available to Masjid Aisha for Ihram.',
        timetable: [
          { time: '08:00 AM', activity: 'Optional group coach to Masjid Aisha for second Umrah' },
          { time: '01:00 PM', activity: 'Dhuhr prayer at Haram' },
          { time: '05:00 PM', activity: 'Shopping at Clock Tower and Souq Khalil' },
          { time: '08:30 PM', activity: 'Dinner buffet' }
        ]
      },
      {
        dayNum: 7, location: 'mecca',
        activity: 'Farewell Tawaf (Tawaf al-Wada) in Makkah. Final prayers in the Haram. Luggage tagging and baggage preparation.',
        note: 'Ensure all bags are tagged with Amja Travels identifiers.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr prayer & Farewell Tawaf (Tawaf al-Wada)' },
          { time: '11:00 AM', activity: 'Luggage weigh-in and hotel check-out preparation' },
          { time: '05:00 PM', activity: 'Final Makkah gathering in hotel conference room' },
          { time: '08:00 PM', activity: 'Farewell dinner in Makkah' }
        ]
      },
      {
        dayNum: 8, location: 'travel',
        activity: 'Transfer to Makkah Railway Station. Travel to Madinah Munawwarah via Haramain High-Speed Train. Hotel check-in near the Prophet\'s Mosque.',
        note: 'Keep passports and train tickets handy.',
        timetable: [
          { time: '08:00 AM', activity: 'Transfer to Makkah Train Station' },
          { time: '09:30 AM', activity: 'Board Haramain High-Speed Train to Madinah' },
          { time: '11:45 AM', activity: 'Arrival at Madinah Railway Station & coach transfer' },
          { time: '01:00 PM', activity: 'Check-in at Diyar Al Madinah Hotel' },
          { time: '04:30 PM', activity: 'First group walk to Al-Masjid an-Nabawi' }
        ]
      },
      {
        dayNum: 9, location: 'medina',
        activity: 'Greeting the Prophet (Salam on Rasoolullah SAW and his companions). Guided visit to Rawdah ash-Sharifah (via Nusuk permit).',
        note: 'Have Nusuk app barcodes ready for Rawdah entry.',
        timetable: [
          { time: '04:30 AM', activity: 'Tahajjud & Fajr in Prophet\'s Mosque' },
          { time: '08:30 AM', activity: 'Official Nusuk permit group entry into Rawdah ash-Sharifah' },
          { time: '01:00 PM', activity: 'Dhuhr prayer and lunch' },
          { time: '05:30 PM', activity: 'Lecture: The Noble Life & Legacy of the Prophet SAW' }
        ]
      },
      {
        dayNum: 10, location: 'medina',
        activity: 'Historical Madinah Ziyarat Tour: Masjid Quba (prayer equal to Umrah), Mount Uhud and Martyrs Cemetery, Masjid al-Qiblatayn, and Seven Mosques (Battle of the Trench).',
        note: 'Perform Wudhu at hotel before departing for Quba.',
        timetable: [
          { time: '07:30 AM', activity: 'Breakfast buffet' },
          { time: '08:30 AM', activity: 'Board buses for Madinah historical Ziyarat' },
          { time: '09:00 AM', activity: '2 Rakat Sunnah prayer at Masjid Quba' },
          { time: '10:30 AM', activity: 'Visit Mount Uhud & Archers Hill with Sheikh narration' },
          { time: '12:00 PM', activity: 'Visit Masjid al-Qiblatayn & Khandaq' },
          { time: '01:30 PM', activity: 'Return to hotel for Dhuhr' }
        ]
      },
      {
        dayNum: 11, location: 'medina',
        activity: 'Visit to the Central Madinah Dates Market (Souq al-Tumoor) for Ajwa, Safawi, and Amber dates. Personal Ibadah in Masjid an-Nabawi.',
        note: 'Agency discount available at selected date vendors.',
        timetable: [
          { time: '08:30 AM', activity: 'Bus transfer to Madinah Central Date Market' },
          { time: '11:30 AM', activity: 'Return with purchases to hotel' },
          { time: '01:00 PM', activity: 'Dhuhr prayer at Prophet\'s Mosque' },
          { time: '08:00 PM', activity: 'Dinner buffet' }
        ]
      },
      {
        dayNum: 12, location: 'medina',
        activity: 'Early morning visit to Jannat al-Baqi cemetery after Fajr. Day dedicated to personal Quran recitation and Salawat.',
        note: 'Baqi gates open immediately after Fajr prayer.',
        timetable: [
          { time: '05:30 AM', activity: 'Group visit to Jannat al-Baqi cemetery' },
          { time: '01:00 PM', activity: 'Dhuhr prayer and rest' },
          { time: '08:30 PM', activity: 'Group review meeting and journey reflections' }
        ]
      },
      {
        dayNum: 13, location: 'medina',
        activity: 'Final shopping, souvenir distribution, packing, 5-Liter Zamzam bottle collection, and Farewell Salam to the Prophet SAW.',
        note: 'Collect airline-sealed 5L Zamzam bottles from reception.',
        timetable: [
          { time: '10:00 AM', activity: 'Distribution of airline-approved 5L Zamzam containers' },
          { time: '05:00 PM', activity: 'Final Farewell Salam to the Prophet SAW at Bab as-Salam' },
          { time: '08:30 PM', activity: 'Farewell Dinner & Tour Souvenir Gift Distribution' }
        ]
      },
      {
        dayNum: 14, location: 'travel',
        activity: 'Check-out from Madinah Hotel. Transfer to Prince Mohammad Bin Abdulaziz International Airport (MED) for return flight home.',
        note: 'Check baggage weight limits (usually 2 x 23kg + 5L Zamzam).',
        timetable: [
          { time: '06:00 AM', activity: 'Breakfast & room key return' },
          { time: '07:30 AM', activity: 'Board airport transfer coaches' },
          { time: '08:30 AM', activity: 'Airport check-in & luggage drop at MED Airport' },
          { time: '11:30 AM', activity: 'Flight departure back home' }
        ]
      }
    ]
  },
  hajj21: {
    id: 'hajj21',
    name: '21-Day Complete Hajj Caravan',
    badge: '21 Days • Hajj',
    description: 'Comprehensive 21-day Hajj package covering Makkah arrival, Tamattu Umrah, 5 days of Hajj rites (Mina tents, Day of Arafat, Muzdalifah overnight, Jamarat stoning, Tawaf Ifadah), Tashreeq, and Madinah Munawwarah.',
    days: [
      {
        dayNum: 1, location: 'travel',
        activity: 'Flight arrival at King Abdulaziz Airport Jeddah. Meet Amja Travels logistics team. VIP coach transfer to Makkah hotel.',
        note: 'Don Ihram at point of departure or Miqat.',
        timetable: [
          { time: '11:00 AM', activity: 'Flight landing at Jeddah Airport' },
          { time: '03:00 PM', activity: 'VIP Coach transfer to Makkah Al-Mukarramah' },
          { time: '06:00 PM', activity: 'Hotel check-in and room assignments' },
          { time: '08:30 PM', activity: 'Orientation and Hajj briefing by Sheikh' }
        ]
      },
      {
        dayNum: 2, location: 'mecca',
        activity: 'Perform Umrah of Tamattu\' as a group: Guided Tawaf, Sa\'ee, and Halq/Taqseer. Exit Ihram until 8th of Dhul Hijjah.',
        note: 'First stage of Tamattu Hajj completed.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr prayer at Masjid al-Haram' },
          { time: '09:00 AM', activity: 'Guided Tawaf & Sa\'ee with group guides' },
          { time: '01:00 PM', activity: 'Haircut and exit from Ihram' }
        ]
      },
      {
        dayNum: 8, location: 'mina',
        activity: 'Day 1 of Hajj (8th Dhul Hijjah - Yawm al-Tarwiyah): Enter state of Ihram for Hajj from hotel. Move to Mina VIP Tent City. Five daily prayers in Mina.',
        note: 'Pack light 5-day Hajj backpack only.',
        timetable: [
          { time: '07:00 AM', activity: 'Shower, wear Ihram, and make Niyyah for Hajj' },
          { time: '09:00 AM', activity: 'Bus transfer to Mina Tent Camp' },
          { time: '01:00 PM', activity: 'Dhuhr, Asr, Maghrib, Isha shortened in Mina tents' },
          { time: '10:00 PM', activity: 'Rest early for the Day of Arafat' }
        ]
      },
      {
        dayNum: 9, location: 'arafat',
        activity: 'Day 2 of Hajj (9th Dhul Hijjah - Yawm al-Arafah): The pinnacle of Hajj. Travel to Plain of Arafat. Combined Dhuhr & Asr prayers. Wuqoof at Arafat until sunset. Move to Muzdalifah for overnight stay under open sky.',
        note: 'Spend all afternoon in earnest Dua and Astaghfar.',
        timetable: [
          { time: '05:30 AM', activity: 'Fajr in Mina & group bus transfer to Arafat' },
          { time: '12:30 PM', activity: 'Khutbah of Arafah & combined Dhuhr/Asr prayers' },
          { time: '01:30 PM', activity: 'Wuqoof al-Arafah collective Du\'a & supplication' },
          { time: '06:45 PM', activity: 'Sunset departure to Muzdalifah' },
          { time: '09:30 PM', activity: 'Combined Maghrib & Isha; collect 49-70 pebbles in Muzdalifah' }
        ]
      },
      {
        dayNum: 10, location: 'mina',
        activity: 'Day 3 of Hajj (10th Dhul Hijjah - Yawm an-Nahr / Eid): Fajr at Mash\'ar al-Haram. Move to Mina. Rami of Big Jamarat (Aqaba). Qurbani confirmation. Halq (head shave). Move to Makkah for Tawaf al-Ifadah & Sa\'ee.',
        note: 'Major Tahallul achieved after Tawaf al-Ifadah.',
        timetable: [
          { time: '05:00 AM', activity: 'Fajr in Muzdalifah and proceed to Mina' },
          { time: '07:30 AM', activity: 'Rami of Jamarat al-Aqaba (7 pebbles)' },
          { time: '10:00 AM', activity: 'Sacrifice (Qurbani) confirmation and Halq' },
          { time: '03:00 PM', activity: 'Tawaf al-Ifadah and Sa\'ee of Hajj in Haram' },
          { time: '09:00 PM', activity: 'Return to Mina camp for overnight stay' }
        ]
      },
      {
        dayNum: 11, location: 'mina',
        activity: 'Day 4 of Hajj (11th Dhul Hijjah - First Day of Tashreeq): Stay in Mina. Stoning all three Jamarat (Small, Medium, Big) with 21 pebbles after Zawal.',
        note: 'Walk in group with tour banner.',
        timetable: [
          { time: '01:30 PM', activity: 'Dhuhr prayer in Mina camp' },
          { time: '02:30 PM', activity: 'Walk to Jamarat Bridge for Rami of 3 pillars' },
          { time: '08:00 PM', activity: 'Spiritual halqa and dinner in tent' }
        ]
      },
      {
        dayNum: 12, location: 'mina',
        activity: 'Day 5 of Hajj (12th Dhul Hijjah - Second Day of Tashreeq): Stoning all three Jamarat after Zawal. Depart Mina before Maghrib. Return to Makkah hotel. Hajj rituals completed!',
        note: 'Hajj Mabrur! Congratulations to all pilgrims.',
        timetable: [
          { time: '01:30 PM', activity: 'Stoning three Jamarat' },
          { time: '04:00 PM', activity: 'Coach transfer from Mina back to Makkah hotel' },
          { time: '08:00 PM', activity: 'Grand Hajj Celebration Dinner' }
        ]
      },
      {
        dayNum: 13, location: 'mecca',
        activity: 'Day of rest and Tawaf al-Wada (Farewell Tawaf) in Makkah.',
        note: 'Rest and recuperate.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr prayer' },
          { time: '05:00 PM', activity: 'Farewell Tawaf in Masjid al-Haram' },
          { time: '08:00 PM', activity: 'Dinner buffet' }
        ]
      },
      {
        dayNum: 14, location: 'travel',
        activity: 'Transfer from Makkah to Madinah Munawwarah by luxury bus or train. Check-in at Madinah hotel.',
        note: 'Welcome to the City of the Prophet SAW.',
        timetable: [
          { time: '08:00 AM', activity: 'Luggage loading and departure to Madinah' },
          { time: '02:00 PM', activity: 'Check-in at Madinah Hotel' },
          { time: '05:00 PM', activity: 'First visit to Al-Masjid an-Nabawi' }
        ]
      },
      {
        dayNum: 15, location: 'medina',
        activity: 'Greeting the Prophet SAW and Rawdah visit.',
        note: 'Have Nusuk permits ready.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr in Prophet\'s Mosque' },
          { time: '09:00 AM', activity: 'Guided Rawdah visit' }
        ]
      },
      {
        dayNum: 16, location: 'medina',
        activity: 'Historical Madinah Ziyarat (Masjid Quba, Mount Uhud, Qiblatayn).',
        note: 'Perform Wudhu beforehand.',
        timetable: [
          { time: '08:30 AM', activity: 'Bus Ziyarat tour' },
          { time: '01:00 PM', activity: 'Dhuhr at Prophet\'s Mosque' }
        ]
      },
      {
        dayNum: 21, location: 'travel',
        activity: 'Final check-out from Madinah hotel and transfer to Prince Mohammad Airport (MED) for return flight.',
        note: 'Safe travels and Hajj Mabrur!',
        timetable: [
          { time: '07:00 AM', activity: 'Breakfast & check-out' },
          { time: '08:30 AM', activity: 'Airport transfer' },
          { time: '12:00 PM', activity: 'Flight departure' }
        ]
      }
    ]
  }
};

export default {
  async render(container) {
    groupList = await getGroups();
    customerList = await getCustomers();

    if (groupList.length > 0 && !selectedGroupId) {
      selectedGroupId = groupList[0].id;
    }

    container.innerHTML = `
      <!-- Sub Navigation Tabs -->
      <div style="display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem; gap: 1rem;">
        <button class="btn btn-secondary ${activeTab === 'directory' ? 'btn-primary' : ''}" id="tab-group-directory" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.75rem 1.5rem;">
          Tour Groups Directory
        </button>
        <button class="btn btn-secondary ${activeTab === 'itinerary' ? 'btn-primary' : ''}" id="tab-group-itinerary" style="border-radius: 8px 8px 0 0; border-bottom: none; margin-bottom: -1px; padding: 0.75rem 1.5rem;">
          Day-wise Itinerary Planner
        </button>
      </div>

      <!-- TAB 1: DIRECTORY -->
      ${activeTab === 'directory' ? this.renderDirectory() : this.renderItinerary()}
    `;

    this.bindEvents(container);
  },

  renderDirectory() {
    return `
      <div class="view-header-actions" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">Travel Groups</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Create travel cohorts, set tour pricing, assign members, and manage dates.</p>
        </div>
        <button class="btn btn-primary" id="btn-create-group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Group
        </button>
      </div>

      <div class="groups-grid">
        ${groupList.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">
            No travel groups have been created yet. Set up your first group to start planning itineraries.
          </div>
        ` : groupList.map(g => {
          const members = customerList.filter(c => c.groupId === g.id && c.status !== 'cancelled');
          const totalRevenue = members.reduce((sum, c) => sum + c.price, 0);

          const typeBadge = g.type === 'umrah' ? 'badge-umrah' : 'badge-hajj';
          return `
            <div class="group-card">
              <div class="group-card-header">
                <div class="group-title">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.15rem; flex-wrap: wrap;">
                    <h3 style="margin: 0; line-height: 1.2;">${g.name}</h3>
                    <span class="badge ${typeBadge}" style="font-size: 0.6rem; padding: 0.15rem 0.4rem; text-transform: uppercase;">${g.type || 'hajj'}</span>
                  </div>
                  <span>Leader: <strong>${g.guide || 'Not Assigned'}</strong></span>
                </div>
                <span class="badge badge-hajj" style="font-size: 0.7rem;">
                  LKR ${g.basePrice ? g.basePrice.toLocaleString() : 0} / Pax
                </span>
              </div>

              <div class="group-dates">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span><strong>${g.departureDate || 'N/A'}</strong> to <strong>${g.arrivalDate || 'N/A'}</strong></span>
              </div>

              <div class="group-meta-stats">
                <div class="meta-stat">
                  <span>Travelers</span>
                  <span>${members.length} Active</span>
                </div>
                <div class="meta-stat">
                  <span>Group Revenue</span>
                  <span style="color: var(--primary);">LKR ${totalRevenue.toLocaleString()}</span>
                </div>
                <div class="meta-stat" style="margin-top: 0.5rem;">
                  <span>Base Package Price</span>
                  <span>LKR ${g.basePrice ? g.basePrice.toLocaleString() : 0}</span>
                </div>
                <div class="meta-stat" style="margin-top: 0.5rem;">
                  <span>Meal Price / Day</span>
                  <span>LKR ${g.mealPrice ? g.mealPrice.toLocaleString() : 0}</span>
                </div>
              </div>

              <div class="group-card-footer">
                <div style="display: flex; gap: 0.35rem; width: 100%;">
                  <button class="btn btn-secondary btn-edit-group" data-id="${g.id}" style="flex: 1; padding: 0.5rem; font-size: 0.8rem;">Edit Group</button>
                  <button class="btn btn-secondary btn-plan-itinerary" data-id="${g.id}" style="flex: 1.5; padding: 0.5rem; font-size: 0.8rem; background-color: var(--primary-light); color: var(--primary);">Plan Itinerary</button>
                  <button class="btn btn-danger btn-delete-group" data-id="${g.id}" style="padding: 0.5rem; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderItinerary() {
    const selectedGroup = groupList.find(g => g.id === selectedGroupId);

    return `
      <div class="itinerary-container">
        <!-- Left Side: Group List Selector -->
        <div class="itinerary-groups-list">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.05em;">Select Group</h3>
          ${groupList.length === 0 ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 2rem 0;">
              No groups available.
            </div>
          ` : groupList.map(g => {
            const isSelected = g.id === selectedGroupId;
            const count = customerList.filter(c => c.groupId === g.id && c.status !== 'cancelled').length;
            return `
              <div class="group-selector-item ${isSelected ? 'selected' : ''}" data-id="${g.id}">
                <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                  <h4 style="font-size: 0.9rem; font-weight: 700; margin: 0;">${g.name}</h4>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${g.departureDate || 'N/A'}</span>
                </div>
                <span class="badge" style="background-color: ${isSelected ? 'var(--primary)' : 'var(--border-color)'}; color: ${isSelected ? 'white' : 'var(--text-main)'}; font-size: 0.7rem;">
                  ${count} Pax
                </span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Right Side: Itinerary Planner -->
        <div class="itinerary-planner-content">
          ${!selectedGroup ? `
            <div style="text-align: center; color: var(--text-muted); padding: 5rem 0;">
              Please select or create a group to begin managing day-wise plans.
            </div>
          ` : `
            <div class="itinerary-header">
              <div>
                <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${selectedGroup.name} Itinerary</h2>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                  Departure: <strong>${selectedGroup.departureDate || 'N/A'}</strong> | Arrival: <strong>${selectedGroup.arrivalDate || 'N/A'}</strong>
                </p>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-secondary" id="btn-load-template" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Predefined Templates
                </button>
                <button class="btn btn-primary" id="btn-print-itinerary" style="font-size: 0.78rem; padding: 0.4rem 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print Timetable Leaflet
                </button>
              </div>
            </div>

            <div class="timeline">
              ${this.generateItineraryDaysList(selectedGroup)}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // Helper: Generates vertical timeline item days based on dates
  generateItineraryDaysList(group) {
    if (!group.departureDate || !group.arrivalDate) {
      return `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Please set Departure and Arrival dates for this group to generate daily planner slots.</div>`;
    }

    const start = new Date(group.departureDate);
    const end = new Date(group.arrivalDate);
    const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (isNaN(dayCount) || dayCount <= 0 || dayCount > 60) {
      return `<div style="padding: 2rem; text-align: center; color: var(--status-cancelled); font-size: 0.85rem;">Invalid dates entered. Departure must be before Arrival date.</div>`;
    }

    // Ensure itinerary array is populated
    const itinerary = group.itinerary || [];
    const timelineHtml = [];

    for (let i = 0; i < dayCount; i++) {
      const currentDayDate = new Date(start);
      currentDayDate.setDate(start.getDate() + i);
      const dateString = currentDayDate.toISOString().substring(0, 10);
      
      // Find saved day config, or fallback to default
      let dayData = itinerary.find(d => d.dayNum === i + 1 || d.date === dateString);
      if (!dayData) {
        dayData = {
          dayNum: i + 1,
          date: dateString,
          location: 'travel',
          activity: 'Travel details not defined. Click Edit to customize this day.',
          note: ''
        };
      }

      // Location Label Styling
      let locationBadgeClass = 'badge-hajj';
      if (dayData.location === 'mecca') locationBadgeClass = 'badge-active';
      if (dayData.location === 'medina') locationBadgeClass = 'badge-umrah';
      if (dayData.location === 'mina') locationBadgeClass = 'badge-completed';

      timelineHtml.push(`
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <div>
                <span class="timeline-day">Day ${dayData.dayNum}</span>
                <span class="timeline-date">(${dateString})</span>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="badge ${locationBadgeClass}" style="font-size: 0.65rem; text-transform: uppercase;">
                  ${dayData.location}
                </span>
                <button class="btn btn-secondary btn-edit-day" data-day="${dayData.dayNum}" data-date="${dateString}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; border-radius: 4px;">
                  Edit Plan
                </button>
              </div>
            </div>
            <p class="timeline-desc">${dayData.activity}</p>
            ${dayData.timetable && dayData.timetable.length > 0 ? `
              <div class="timetable-preview" style="margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.3rem;">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.025em;">Daily Hourly Timetable:</span>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                  ${dayData.timetable.map(slot => `
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                      <span class="badge" style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); font-family: monospace; font-size: 0.7rem; padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600;">${slot.time}</span>
                      <span style="color: var(--text-main);">${slot.activity}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            ${dayData.note ? `
              <div style="font-size: 0.75rem; color: var(--text-muted); padding-top: 0.35rem; border-top: 1px dashed var(--border-color); display: flex; align-items: center; gap: 0.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Note: ${dayData.note}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `);
    }

    return timelineHtml.join('');
  },

  bindEvents(container) {
    // Tabs Toggles
    const dirTab = container.querySelector('#tab-group-directory');
    if (dirTab) {
      dirTab.addEventListener('click', () => {
        activeTab = 'directory';
        this.render(container);
      });
    }

    const itinTab = container.querySelector('#tab-group-itinerary');
    if (itinTab) {
      itinTab.addEventListener('click', () => {
        activeTab = 'itinerary';
        this.render(container);
      });
    }

    // Group Selector trigger
    const groupItems = container.querySelectorAll('.group-selector-item');
    groupItems.forEach(item => {
      item.addEventListener('click', () => {
        selectedGroupId = item.getAttribute('data-id');
        this.render(container);
      });
    });

    // Create Group Trigger
    const createBtn = container.querySelector('#btn-create-group');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.openGroupModal(container);
      });
    }

    // Edit Group Trigger
    const editBtns = container.querySelectorAll('.btn-edit-group');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const group = groupList.find(g => g.id === id);
        if (group) this.openGroupModal(container, group);
      });
    });

    // Delete Group Trigger
    const deleteBtns = container.querySelectorAll('.btn-delete-group');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this group? All assigned customers will be unassigned.')) {
          try {
            // Unassign customers first
            const members = customerList.filter(c => c.groupId === id);
            for (const customer of members) {
              customer.groupId = null;
              await saveCustomer(customer);
            }

            await deleteGroup(id);
            window.showNotification('Group deleted successfully!', 'warning');
            if (selectedGroupId === id) selectedGroupId = null;
            this.render(container);
          } catch (err) {
            window.showNotification('Error deleting group: ' + err.message, 'error');
          }
        }
      });
    });

    // Quick plan itinerary button in cards
    const planBtns = container.querySelectorAll('.btn-plan-itinerary');
    planBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedGroupId = btn.getAttribute('data-id');
        activeTab = 'itinerary';
        this.render(container);
      });
    });

    // Template modal trigger
    const loadTemplateBtn = container.querySelector('#btn-load-template');
    if (loadTemplateBtn) {
      loadTemplateBtn.addEventListener('click', () => {
        const group = groupList.find(g => g.id === selectedGroupId);
        if (group) this.openTemplateModal(container, group);
      });
    }

    // Print itinerary trigger
    const printItinBtn = container.querySelector('#btn-print-itinerary');
    if (printItinBtn) {
      printItinBtn.addEventListener('click', () => {
        const group = groupList.find(g => g.id === selectedGroupId);
        if (group) this.openPrintItineraryModal(group);
      });
    }

    // Edit Day Plan trigger
    const editDayBtns = container.querySelectorAll('.btn-edit-day');
    editDayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dayNum = parseInt(btn.getAttribute('data-day'));
        const date = btn.getAttribute('data-date');
        this.openDayPlanModal(container, dayNum, date);
      });
    });
  },

  // Modal: Create or Edit Travel Group
  openGroupModal(container, group = null) {
    const isEdit = !!group;
    const assignedMemberIds = isEdit ? customerList.filter(c => c.groupId === group.id).map(c => c.id) : [];

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'group-modal';

    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Edit Tour Group' : 'Create Travel Group'}</h3>
          <button class="modal-close" id="btn-close-modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="group-form">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label for="g-name">Group / Tour Name *</label>
                <input type="text" id="g-name" class="form-control" value="${group?.name || ''}" required placeholder="Hajj Cohort - Sept 2026">
              </div>
              <div class="form-group">
                <label for="g-type">Group Type *</label>
                <select id="g-type" class="form-control" required>
                  <option value="hajj" ${group?.type === 'hajj' ? 'selected' : ''}>Hajj Tour</option>
                  <option value="umrah" ${group?.type === 'umrah' ? 'selected' : '' || !group}>Umrah Tour</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="g-depdate">Departure Date *</label>
                <input type="date" id="g-depdate" class="form-control" value="${group?.departureDate || ''}" required>
              </div>
              <div class="form-group">
                <label for="g-arrdate">Arrival Date *</label>
                <input type="date" id="g-arrdate" class="form-control" value="${group?.arrivalDate || ''}" required>
              </div>
            </div>

            <div class="form-group">
              <label for="g-guide">Tour Leader / Guide Name</label>
              <input type="text" id="g-guide" class="form-control" value="${group?.guide || ''}" placeholder="Sheikh Rizwan Al-Moulana">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="g-baseprice">Package Price per Person (LKR)</label>
                <input type="number" id="g-baseprice" class="form-control" value="${group?.basePrice || ''}" min="0" placeholder="850000">
              </div>
              <div class="form-group">
                <label for="g-mealprice">Meal Price per Person / Day (LKR)</label>
                <input type="number" id="g-mealprice" class="form-control" value="${group?.mealPrice || ''}" min="0" placeholder="3500">
              </div>
            </div>

            <!-- Group Assignment Checklist -->
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">Assign Customers</label>
            <div class="assignment-checklist-grid">
              ${customerList.length === 0 ? `
                <div style="font-size: 0.8rem; color: var(--text-light); text-align: center; grid-column: 1 / -1; padding: 1rem 0;">
                  No customers registered in system.
                </div>
              ` : customerList.map(c => {
                const isChecked = assignedMemberIds.includes(c.id);
                // Highlight if already assigned to another group
                const otherGroup = !isChecked && c.groupId ? groupList.find(g => g.id === c.groupId) : null;
                const statusLabel = otherGroup ? `(in ${otherGroup.name})` : '';

                return `
                  <label class="assignment-item" style="color: ${otherGroup ? 'var(--text-light)' : 'var(--text-main)'};">
                    <input type="checkbox" class="chk-member" data-id="${c.id}" ${isChecked ? 'checked' : ''}>
                    <span>${c.name} <span class="badge badge-${c.packageType}" style="font-size: 0.6rem; padding: 0.1rem 0.35rem; font-weight: 700; margin-left: 0.25rem;">${c.packageType}</span> ${statusLabel}</span>
                  </label>
                `;
              }).join('')}
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Group'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);

    modalOverlay.querySelector('#group-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const depDate = modalOverlay.querySelector('#g-depdate').value;
      const arrDate = modalOverlay.querySelector('#g-arrdate').value;

      if (new Date(depDate) > new Date(arrDate)) {
        window.showNotification('Departure date must be before arrival date.', 'error');
        return;
      }

      const payload = {
        name: modalOverlay.querySelector('#g-name').value.trim(),
        type: modalOverlay.querySelector('#g-type').value,
        departureDate: depDate,
        arrivalDate: arrDate,
        guide: modalOverlay.querySelector('#g-guide').value.trim(),
        basePrice: parseFloat(modalOverlay.querySelector('#g-baseprice').value) || 0,
        mealPrice: parseFloat(modalOverlay.querySelector('#g-mealprice').value) || 0,
        itinerary: group?.itinerary || []
      };

      if (isEdit) payload.id = group.id;

      try {
        // Save/create group to database to obtain reference ID
        // (Wait: saveGroup returns immediately in LocalStorage, or pushes to firestore. 
        // We'll write to db and query the list or obtain back details)
        
        // Let's first save the group
        // If it's a new group, we generate a temp ID to links members or let DB do it.
        // Wait, for Firestore, `addDoc` generates the ID. In db.js, `saveGroup` updates or creates.
        // Let's modify db.js to return the saved ID or object if needed, but since it updates cache, we can find the group by name & timestamp.
        // A simpler way: we save the group, re-load groups from DB, find our group, and then update customer relations.
        // Let's do that!
        
        await saveGroup(payload);
        
        // Reload groupList to find the saved group (either existing or new one)
        const updatedGroups = await getGroups();
        let targetGroup = null;
        if (isEdit) {
          targetGroup = updatedGroups.find(g => g.id === group.id);
        } else {
          // Sort by createdAt descending and get first match
          const sorted = [...updatedGroups].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
          targetGroup = sorted[0];
        }

        if (targetGroup) {
          // Sync customer group assignments
          const selectedChks = modalOverlay.querySelectorAll('.chk-member:checked');
          const selectedCustIds = Array.from(selectedChks).map(el => el.getAttribute('data-id'));

          // Unassign customers that were unchecked
          const previouslyAssigned = customerList.filter(c => c.groupId === targetGroup.id);
          for (const c of previouslyAssigned) {
            if (!selectedCustIds.includes(c.id)) {
              c.groupId = null;
              await saveCustomer(c);
            }
          }

          // Assign newly checked customers
          for (const cid of selectedCustIds) {
            const customer = customerList.find(c => c.id === cid);
            if (customer && customer.groupId !== targetGroup.id) {
              customer.groupId = targetGroup.id;
              // If group base price exists, we can optionally populate customer base price if they don't have one,
              // but keeping customer price custom is safer.
              await saveCustomer(customer);
            }
          }
        }

        window.showNotification(isEdit ? 'Group details updated!' : 'Group cohort created!', 'success');
        closeModal();
        this.render(container);
      } catch (err) {
        window.showNotification('Error saving group: ' + err.message, 'error');
      }
    });
  },

  // Modal: Edit Itinerary Day Activity Plan
  openDayPlanModal(container, dayNum, date) {
    const selectedGroup = groupList.find(g => g.id === selectedGroupId);
    if (!selectedGroup) return;

    const itinerary = selectedGroup.itinerary || [];
    const dayData = itinerary.find(d => d.dayNum === dayNum) || {
      dayNum: dayNum,
      date: date,
      location: 'travel',
      activity: '',
      note: '',
      timetable: []
    };

    let timetableSlots = [...(dayData.timetable || [])];

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'day-plan-modal';

    const renderSlotsList = () => {
      const container = modalOverlay.querySelector('#timetable-slots-container');
      if (!container) return;
      if (timetableSlots.length === 0) {
        container.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.75rem;">No hourly slots added. Click "+ Add Slot" or "Auto-Schedule".</div>`;
        return;
      }
      container.innerHTML = timetableSlots.map((s, idx) => `
        <div class="timetable-row" style="display: flex; gap: 0.4rem; align-items: center;">
          <input type="text" class="form-control tt-time" value="${s.time}" placeholder="04:30 AM" style="width: 100px; font-size: 0.8rem; padding: 0.35rem 0.5rem; font-family: monospace;">
          <input type="text" class="form-control tt-act" value="${s.activity}" placeholder="Activity name..." style="flex-grow: 1; font-size: 0.8rem; padding: 0.35rem 0.5rem;">
          <button type="button" class="btn btn-danger btn-del-slot" data-idx="${idx}" style="padding: 0.35rem; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;" title="Delete Slot">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `).join('');

      container.querySelectorAll('.btn-del-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          timetableSlots.splice(idx, 1);
          renderSlotsList();
        });
      });
    };

    modalOverlay.innerHTML = `
      <div class="modal-content" style="width: 520px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3>Day ${dayNum} Plan & Timetable (${date})</h3>
          <button class="modal-close" id="btn-close-day">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="day-plan-form">
          <div class="modal-body">
            <div class="form-group">
              <label for="day-location">Current Location *</label>
              <select id="day-location" class="form-control" required>
                <option value="travel" ${dayData.location === 'travel' ? 'selected' : ''}>Travel / In-Transit</option>
                <option value="mecca" ${dayData.location === 'mecca' ? 'selected' : ''}>Mecca (Makkah)</option>
                <option value="medina" ${dayData.location === 'medina' ? 'selected' : ''}>Medina (Madinah)</option>
                <option value="mina" ${dayData.location === 'mina' ? 'selected' : ''}>Mina Tents</option>
                <option value="arafat" ${dayData.location === 'arafat' ? 'selected' : ''}>Arafat / Muzdalifah</option>
                <option value="other" ${dayData.location === 'other' ? 'selected' : ''}>Other / Excursion</option>
              </select>
            </div>

            <div class="form-group">
              <label for="day-activity">Day's Main Summary *</label>
              <textarea id="day-activity" class="form-control" required placeholder="Perform Umrah rituals. Tawaaf & Sa'ee. Rest at Hotel. Guided sessions after Isha." style="min-height: 70px;">${dayData.activity.includes('details not defined') ? '' : dayData.activity}</textarea>
            </div>

            <div class="form-group">
              <label for="day-note">Special Instructions / Meal Notes</label>
              <input type="text" id="day-note" class="form-control" value="${dayData.note || ''}" placeholder="Catering provides dinner at hotel lobby at 8 PM. Prepare ihram.">
            </div>

            <!-- HOURLY TIMETABLE SECTION -->
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin: 0;">Date-wise Hourly Timetable</label>
                <button type="button" id="btn-auto-timetable" class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  Auto-Schedule Prayers & Activities
                </button>
              </div>
              <div id="timetable-slots-container" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto; padding-right: 0.25rem;">
              </div>
              <button type="button" id="btn-add-slot" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.6rem; margin-top: 0.5rem; width: 100%; border: 1px dashed var(--border-color);">
                + Add Time Slot
              </button>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-day">Close</button>
            <button type="submit" class="btn btn-primary">Save Day & Timetable</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);
    renderSlotsList();

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-day').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-day').addEventListener('click', closeModal);

    // Auto-generate timetable slots based on location
    modalOverlay.querySelector('#btn-auto-timetable').addEventListener('click', () => {
      const loc = modalOverlay.querySelector('#day-location').value;
      if (loc === 'mecca') {
        timetableSlots = [
          { time: '04:30 AM', activity: 'Fajr Prayer at Masjid al-Haram' },
          { time: '07:30 AM', activity: 'Hotel Buffet Breakfast' },
          { time: '09:30 AM', activity: 'Guided Tawaf / Holy Kaaba Ziyarat with Sheikh' },
          { time: '01:00 PM', activity: 'Dhuhr Prayer & Lunch' },
          { time: '04:30 PM', activity: 'Asr Prayer & Spiritual Halqa' },
          { time: '06:45 PM', activity: 'Maghrib Prayer at Haram' },
          { time: '08:00 PM', activity: 'Isha Prayer & Group Dinner Buffet' }
        ];
      } else if (loc === 'medina') {
        timetableSlots = [
          { time: '04:30 AM', activity: 'Tahajjud & Fajr at Al-Masjid an-Nabawi' },
          { time: '07:30 AM', activity: 'Hotel Buffet Breakfast' },
          { time: '08:30 AM', activity: 'Rawdah Ash-Sharifah Visit & Salam on the Prophet SAW' },
          { time: '01:00 PM', activity: 'Dhuhr Prayer & Lunch' },
          { time: '05:00 PM', activity: 'Seerah Lecture by Tour Guide' },
          { time: '08:00 PM', activity: 'Isha Prayer & Dinner' }
        ];
      } else if (loc === 'mina' || loc === 'arafat') {
        timetableSlots = [
          { time: '05:00 AM', activity: 'Fajr Prayer in Camp' },
          { time: '07:30 AM', activity: 'Breakfast & Dua Preparation' },
          { time: '12:30 PM', activity: 'Combined Dhuhr & Asr Prayers' },
          { time: '01:30 PM', activity: 'Intense Wuqoof & Supplications' },
          { time: '07:00 PM', activity: 'Maghrib & Isha Combined' }
        ];
      } else {
        timetableSlots = [
          { time: '07:00 AM', activity: 'Breakfast & Room Check-out / Packing' },
          { time: '09:00 AM', activity: 'Board Chartered VIP Luxury Coach' },
          { time: '01:00 PM', activity: 'Rest Stop, Prayers & Lunch' },
          { time: '04:30 PM', activity: 'Arrival at Destination Hotel & Check-in' },
          { time: '08:00 PM', activity: 'Welcome Dinner & Tour Briefing' }
        ];
      }
      renderSlotsList();
      window.showNotification('Hourly prayer and activity schedule generated!', 'success');
    });

    // Add time slot button
    modalOverlay.querySelector('#btn-add-slot').addEventListener('click', () => {
      timetableSlots.push({ time: '09:00 AM', activity: 'New activity' });
      renderSlotsList();
    });

    modalOverlay.querySelector('#day-plan-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      // Read current values from timetable inputs
      const currentSlots = Array.from(modalOverlay.querySelectorAll('.timetable-row')).map(row => ({
        time: row.querySelector('.tt-time').value.trim(),
        activity: row.querySelector('.tt-act').value.trim()
      })).filter(s => s.time && s.activity);

      const newDayConfig = {
        dayNum: dayNum,
        date: date,
        location: modalOverlay.querySelector('#day-location').value,
        activity: modalOverlay.querySelector('#day-activity').value.trim(),
        note: modalOverlay.querySelector('#day-note').value.trim(),
        timetable: currentSlots
      };

      // Merge into itinerary array
      const currentItinerary = [...(selectedGroup.itinerary || [])];
      const matchIdx = currentItinerary.findIndex(d => d.dayNum === dayNum);
      
      if (matchIdx !== -1) {
        currentItinerary[matchIdx] = newDayConfig;
      } else {
        currentItinerary.push(newDayConfig);
      }

      currentItinerary.sort((a, b) => a.dayNum - b.dayNum);
      selectedGroup.itinerary = currentItinerary;

      try {
        await saveGroup(selectedGroup);
        window.showNotification(`Day ${dayNum} itinerary & timetable updated!`, 'success');
        closeModal();
        this.render(container);
      } catch (err) {
        window.showNotification('Error saving day plan: ' + err.message, 'error');
      }
    });
  },

  // Modal: Load Predefined Templates
  openTemplateModal(container, selectedGroup) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'template-modal';

    modalOverlay.innerHTML = `
      <div class="modal-content" style="width: 580px;">
        <div class="modal-header">
          <h3>Apply Predefined Tour Template</h3>
          <button class="modal-close" id="btn-close-template">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Select an authentic pre-configured travel template. Applying a template will auto-populate all daily itineraries, spiritual activities, and hourly prayer/meal timetables for <strong>${selectedGroup.name}</strong>.
          </p>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${Object.values(PREDEFINED_TEMPLATES).map(tmpl => `
              <div class="card" style="margin-bottom: 0; padding: 1.25rem; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.5rem; transition: var(--transition-fast); hover:border-color: var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">${tmpl.name}</h4>
                    <span class="badge badge-hajj" style="font-size: 0.65rem;">${tmpl.badge}</span>
                  </div>
                  <button class="btn btn-primary btn-apply-tmpl" data-id="${tmpl.id}" style="font-size: 0.8rem; padding: 0.4rem 0.85rem;">
                    Apply Template
                  </button>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
                  ${tmpl.description}
                </p>
                <div style="font-size: 0.75rem; color: var(--primary); font-weight: 550; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Includes ${tmpl.days.length} days of activities & complete hourly prayer schedules
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-template">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-template').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-template').addEventListener('click', closeModal);

    modalOverlay.querySelectorAll('.btn-apply-tmpl').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tmplId = btn.getAttribute('data-id');
        const tmpl = PREDEFINED_TEMPLATES[tmplId];
        if (!tmpl) return;

        if (confirm(`Apply "${tmpl.name}" to ${selectedGroup.name}? This will overwrite the existing daily schedule with the complete template.`)) {
          try {
            // Map template days to the group's dates
            const start = selectedGroup.departureDate ? new Date(selectedGroup.departureDate) : new Date();
            const populatedItinerary = tmpl.days.map((d, idx) => {
              const dayDate = new Date(start);
              dayDate.setDate(start.getDate() + idx);
              return {
                ...d,
                dayNum: idx + 1,
                date: dayDate.toISOString().substring(0, 10)
              };
            });

            selectedGroup.itinerary = populatedItinerary;
            await saveGroup(selectedGroup);
            window.showNotification(`"${tmpl.name}" applied successfully!`, 'success');
            closeModal();
            this.render(container);
          } catch (err) {
            window.showNotification('Error applying template: ' + err.message, 'error');
          }
        }
      });
    });
  },

  // Modal: Printable Group Timetable Leaflet
  openPrintItineraryModal(selectedGroup) {
    const itinerary = selectedGroup.itinerary || [];
    const members = customerList.filter(c => c.groupId === selectedGroup.id && c.status !== 'cancelled');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the tour schedule.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedGroup.name} - Tour Timetable</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #1f2937; line-height: 1.5; }
          .header { border-bottom: 2px solid #0b5e34; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 800; color: #0b5e34; margin: 0; }
          .subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 13px; border: 1px solid #e5e7eb; }
          .meta-label { color: #6b7280; font-size: 11px; text-transform: uppercase; font-weight: 600; }
          .meta-val { font-weight: 700; color: #111827; }
          .day-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; page-break-inside: avoid; }
          .day-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
          .day-title { font-size: 15px; font-weight: 700; color: #0b5e34; }
          .day-loc { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; background: #ecfdf5; color: #065f46; border-radius: 12px; }
          .day-act { font-size: 13px; margin: 0 0 0.5rem 0; }
          .tt-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 12px; }
          .tt-table td { padding: 4px 8px; border-bottom: 1px solid #f3f4f6; }
          .tt-time { width: 90px; font-weight: 700; color: #374151; font-family: monospace; }
          .footer { margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; font-size: 11px; color: #9ca3af; text-align: center; }
          @media print {
            body { padding: 0.5cm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <button onclick="window.close()" style="background: #ffffff; color: #1e293b; border: 1px solid #cbd5e1; padding: 7px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            &larr; Return to CRM / Close
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
            <div class="subtitle">Official Pilgrimage Tour Schedule & Day-wise Timetable</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 700; color: #111827;">${selectedGroup.name}</div>
            <div class="subtitle">Tour Leader: ${selectedGroup.guide || 'Assigned Sheikh'}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <div class="meta-label">Departure Date</div>
            <div class="meta-val">${selectedGroup.departureDate || 'N/A'}</div>
          </div>
          <div>
            <div class="meta-label">Arrival Date</div>
            <div class="meta-val">${selectedGroup.arrivalDate || 'N/A'}</div>
          </div>
          <div>
            <div class="meta-label">Registered Travelers</div>
            <div class="meta-val">${members.length} Pilgrims</div>
          </div>
          <div>
            <div class="meta-label">Tour Type</div>
            <div class="meta-val" style="text-transform: uppercase;">${selectedGroup.type || 'Umrah'}</div>
          </div>
        </div>

        <h3 style="font-size: 16px; color: #111827; margin-bottom: 1rem;">Chronological Tour Schedule</h3>

        ${itinerary.length === 0 ? `
          <p style="color: #6b7280; font-size: 13px;">No itinerary days have been configured for this group.</p>
        ` : itinerary.map(d => `
          <div class="day-box">
            <div class="day-header">
              <span class="day-title">Day ${d.dayNum} (${d.date || 'Date TBD'})</span>
              <span class="day-loc">${d.location}</span>
            </div>
            <p class="day-act">${d.activity}</p>
            ${d.note ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 0.5rem; font-style: italic;">Note: ${d.note}</div>` : ''}
            ${d.timetable && d.timetable.length > 0 ? `
              <table class="tt-table">
                <tbody>
                  ${d.timetable.map(slot => `
                    <tr>
                      <td class="tt-time">${slot.time}</td>
                      <td>${slot.activity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
        `).join('')}

        <div class="footer">
          Amja Travels (Pvt) Ltd • 24/7 Pilgrim Emergency Assistance • Hotline: +94 11 234 5678 / KSA: +966 50 123 4567
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
};
