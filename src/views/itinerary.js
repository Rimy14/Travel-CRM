// ----------------------------------------------------
// Amja Travels CRM - Dedicated Itinerary Planner (itinerary.js)
// ----------------------------------------------------

import { 
  getGroups, 
  saveGroup, 
  getCustomers 
} from '../db.js';

let groupList = [];
let customerList = [];
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
          { time: '05:30 PM', activity: 'Sheikh Lecture: Virtues and Etiquette of Makkah' },
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
        note: 'Enter Haram early to secure spots before gates close.',
        timetable: [
          { time: '09:00 AM', activity: 'Early departure for Jummah prayer at Masjid al-Haram' },
          { time: '12:30 PM', activity: 'Jummah Khutbah and Prayer' },
          { time: '04:00 PM', activity: 'Asr prayer and group Quran recitation circle' },
          { time: '08:30 PM', activity: 'Dinner buffet' }
        ]
      },
      {
        dayNum: 6, location: 'mecca',
        activity: 'Free day for shopping, visiting local historic exhibitions, or performing optional second Umrah from Masjid Aisha.',
        note: 'Taxis available to Masjid Aisha for Ihram.',
        timetable: [
          { time: '08:00 AM', activity: 'Optional group coach to Masjid Aisha for second Umrah' },
          { time: '01:00 PM', activity: 'Dhuhr prayer at Haram' },
          { time: '05:00 PM', activity: 'Shopping at Clock Tower Souq' },
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
          { time: '01:00 PM', activity: 'Check-in at Dar Al Taqwa Hotel' },
          { time: '04:30 PM', activity: 'First group walk to Al-Masjid an-Nabawi' }
        ]
      },
      {
        dayNum: 9, location: 'medina',
        activity: 'Visiting the Rawdah Sharif (Permit scheduled via Nusuk app). Salam upon the Prophet (PBUH) and Abu Bakr & Umar (RA).',
        note: 'Ensure Nusuk app permit QR codes are downloaded on phone.',
        timetable: [
          { time: '04:30 AM', activity: 'Tahajjud and Fajr prayer at Masjid an-Nabawi' },
          { time: '08:30 AM', activity: 'Brothers Rawdah entry (Gate 38 / As-Salam)' },
          { time: '02:00 PM', activity: 'Sisters Rawdah entry (Gate 24 / Usman)' },
          { time: '08:30 PM', activity: 'Group dinner at hotel' }
        ]
      },
      {
        dayNum: 10, location: 'medina',
        activity: 'Historical Madinah Ziyarat: Masjid Quba (perform 2 rak\'ah for Umrah reward), Mount Uhud & Martyrs Cemetery, and Masjid al-Qiblatain.',
        note: 'Perform Wudhu in hotel before leaving for Quba.',
        timetable: [
          { time: '07:00 AM', activity: 'Breakfast buffet' },
          { time: '07:45 AM', activity: 'Board coaches for Madinah Ziyarat' },
          { time: '08:15 AM', activity: 'Masjid Quba visit & 2 Rak\'ah Tahiyyatul Masjid' },
          { time: '09:45 AM', activity: 'Mount Uhud & Shuhada cemetery Dua' },
          { time: '11:15 AM', activity: 'Masjid al-Qiblatain (Two Qiblas)' },
          { time: '01:00 PM', activity: 'Return for Dhuhr at Prophet\'s Mosque' }
        ]
      },
      {
        dayNum: 11, location: 'medina',
        activity: 'Visit Seven Mosques (Battle of the Trench / Khandaq site) and Madinah Dates Market. Evening Seerah lecture.',
        note: 'Wholesale Ajwa & Sukari dates available at market.',
        timetable: [
          { time: '09:00 AM', activity: 'Visit Khandaq (Battle of Trench) site' },
          { time: '10:30 AM', activity: 'Visit Central Madinah Dates Market' },
          { time: '01:00 PM', activity: 'Dhuhr at Prophet\'s Mosque' },
          { time: '05:30 PM', activity: 'Seerah Lecture: Lessons from the Prophet\'s Life in Madinah' }
        ]
      },
      {
        dayNum: 12, location: 'medina',
        activity: 'Day of worship, Quran memorization circle, and personal prayers at Al-Masjid an-Nabawi.',
        note: 'Spend maximum time in the Prophet\'s Mosque.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr & Morning Adhkar at Prophet\'s Mosque' },
          { time: '01:00 PM', activity: 'Dhuhr prayer' },
          { time: '04:00 PM', activity: 'Asr and group Quran circle in courtyard' },
          { time: '08:00 PM', activity: 'Isha and dinner' }
        ]
      },
      {
        dayNum: 13, location: 'medina',
        activity: 'Final full day in Madinah. Farewell Salam at Rawdah. Luggage weighing and packing of 5L Zamzam containers.',
        note: 'Check baggage weight (max 23kg x 2).',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr prayer at Masjid an-Nabawi' },
          { time: '11:00 AM', activity: 'Luggage weigh-in & Zamzam water sealing' },
          { time: '05:00 PM', activity: 'Final Farewell Salam at the Prophet\'s Holy Rawdah' },
          { time: '08:00 PM', activity: 'Closing dinner & group reflection session' }
        ]
      },
      {
        dayNum: 14, location: 'travel',
        activity: 'Hotel check-out. Coach transfer to Prince Mohammad Bin Abdulaziz International Airport (Madinah). Return flight departure.',
        note: 'Keep passports and boarding passes accessible.',
        timetable: [
          { time: '09:00 AM', activity: 'Breakfast and hotel check-out' },
          { time: '11:00 AM', activity: 'Board chartered bus to Madinah Airport' },
          { time: '01:00 PM', activity: 'Airport check-in, Zamzam tagging & security' },
          { time: '05:00 PM', activity: 'Boarding & departure flight home' }
        ]
      }
    ]
  },
  hajj21: {
    id: 'hajj21',
    name: '21-Day Complete Hajj Itinerary',
    badge: '21 Days • Hajj Tamattu',
    description: 'Comprehensive Hajj Tamattu itinerary covering initial Umrah, Tarwiyah Day at Mina, Day of Arafah (Wuquf), Muzdalifah night under the stars, Rami Jamarat, Eid al-Adha Qurbani, and post-Hajj Madinah Ziyarat with full prayer timetables.',
    days: [
      {
        dayNum: 1, location: 'travel',
        activity: 'Arrival at King Abdulaziz International Airport Jeddah (Hajj Terminal). Bus transfer to Makkah Azizia hotel.',
        note: 'Enter Ihram for Umrah at departure airport or Miqat.',
        timetable: [
          { time: '10:00 AM', activity: 'Arrival at Jeddah Hajj Terminal' },
          { time: '01:00 PM', activity: 'Customs & Ministry of Hajj biometric clearance' },
          { time: '03:30 PM', activity: 'Chartered coach transfer to Makkah Azizia base' },
          { time: '06:00 PM', activity: 'Room assignment and rest' }
        ]
      },
      {
        dayNum: 2, location: 'mecca',
        activity: 'Perform Welcome Umrah (Tawaf, Sa\'ee, Halq) as part of Hajj Tamattu.',
        note: 'After hair cut, exit Ihram into normal clothes until 8th Dhul Hijjah.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr prayer' },
          { time: '08:00 AM', activity: 'Board coach to Haram for Welcome Umrah' },
          { time: '09:00 AM', activity: 'Guided Tawaf and Sa\'ee' },
          { time: '01:00 PM', activity: 'Halq/Taqseer and return to Azizia hotel' }
        ]
      },
      {
        dayNum: 3, location: 'mecca',
        activity: 'Pre-Hajj preparation workshop and spiritual lecture on the rites of Hajj.',
        note: 'Pack light backpack for 5 days of Hajj in Mina/Arafat.',
        timetable: [
          { time: '09:00 AM', activity: 'Hajj logistics, Mina tent layout & safety briefing' },
          { time: '04:00 PM', activity: 'Spiritual lecture: The Journey of a Lifetime' },
          { time: '08:00 PM', activity: 'Bag check & distribution of sleeping mats and pebbles pouch' }
        ]
      },
      {
        dayNum: 4, location: 'mina',
        activity: '8th Dhul Hijjah (Yawm at-Tarwiyah): Enter Ihram for Hajj. Transfer to air-conditioned European tents in Mina.',
        note: 'Pray Dhuhr, Asr, Maghrib, Isha, and Fajr of 9th in Mina (Qasr without combining).',
        timetable: [
          { time: '06:00 AM', activity: 'Ghusl & enter Ihram for Hajj at hotel' },
          { time: '08:00 AM', activity: 'Transfer to Mina Tents via chartered coach' },
          { time: '01:00 PM', activity: 'Dhuhr prayer in Mina (2 Rak\'ahs)' },
          { time: '04:30 PM', activity: 'Asr prayer in Mina (2 Rak\'ahs)' },
          { time: '08:30 PM', activity: 'Isha prayer and rest for Arafah day' }
        ]
      },
      {
        dayNum: 5, location: 'arafat',
        activity: '9th Dhul Hijjah (Yawm Arafah): Move from Mina to Mount Arafat. The pinnacle day of Hajj (Wuquf Arafat). Combined Dhuhr & Asr prayers. Intensive Dua and repentance until sunset. Sunset departure to Muzdalifah.',
        note: 'Greatest day of the year. Spend every moment in Dua, Istighfar, and Talbiyah.',
        timetable: [
          { time: '05:30 AM', activity: 'Fajr in Mina and move to Arafat' },
          { time: '08:30 AM', activity: 'Arrival in Arafat tents & orientation' },
          { time: '12:30 PM', activity: 'Arafah Khutbah and combined Dhuhr/Asr prayer' },
          { time: '02:00 PM', activity: 'Intensive Wuquf Dua session led by Sheikh' },
          { time: '06:45 PM', activity: 'Sunset: Depart Arafat for Muzdalifah without praying Maghrib' },
          { time: '09:00 PM', activity: 'Arrive Muzdalifah: Combine Maghrib & Isha prayers (Qasr)' },
          { time: '10:30 PM', activity: 'Collect pebbles for Jamarat & sleep under the open sky' }
        ]
      },
      {
        dayNum: 6, location: 'mina',
        activity: '10th Dhul Hijjah (Yawm an-Nahr / Eid Day): Fajr in Muzdalifah, move to Mina. Stone the Large Jamarah (Jamarah al-Aqabah). Perform Qurbani (sacrifice), Halq/Taqseer (hair cut), exit initial Ihram (Tahallul al-Asghar). Perform Tawaf al-Ifadah & Hajj Sa\'ee at Haram.',
        note: 'Celebrate Eid al-Adha. Major milestones of Hajj completed today.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr at Mash\'ar al-Haram (Muzdalifah)' },
          { time: '06:00 AM', activity: 'Move to Mina' },
          { time: '08:30 AM', activity: 'Rami of Jamarah al-Aqabah (7 pebbles)' },
          { time: '11:00 AM', activity: 'Qurbani confirmation & Halq/Taqseer' },
          { time: '02:00 PM', activity: 'Transfer to Haram for Tawaf al-Ifadah & Sa\'ee' },
          { time: '09:00 PM', activity: 'Return to Mina tents for overnight stay' }
        ]
      },
      {
        dayNum: 7, location: 'mina',
        activity: '11th Dhul Hijjah (First Day of Tashreeq): Stay in Mina. Stoning all three Jamarat (Sughra, Wusta, Kubra - 7 pebbles each, total 21). Group lectures and Ibadah in tents.',
        note: 'Stoning starts after Zawal (Dhuhr time).',
        timetable: [
          { time: '01:00 PM', activity: 'Dhuhr in Mina tents' },
          { time: '02:30 PM', activity: 'Walk to Jamarat for Rami (21 pebbles)' },
          { time: '06:00 PM', activity: 'Evening Dhikr circle & reflections' },
          { time: '08:30 PM', activity: 'Dinner in Mina' }
        ]
      },
      {
        dayNum: 8, location: 'mina',
        activity: '12th Dhul Hijjah (Second Day of Tashreeq): Stone all three Jamarat after Dhuhr. Option for early departure from Mina before sunset (Ta\'ajjul) back to Azizia hotel.',
        note: 'Leave Mina before Maghrib if performing early exit.',
        timetable: [
          { time: '01:00 PM', activity: 'Dhuhr in Mina' },
          { time: '02:00 PM', activity: 'Rami of three Jamarat (21 pebbles)' },
          { time: '05:00 PM', activity: 'Chartered coach departure from Mina to Azizia hotel' },
          { time: '08:00 PM', activity: 'Celebratory Hajj dinner at hotel' }
        ]
      },
      {
        dayNum: 9, location: 'mecca',
        activity: 'Rest and recovery in Makkah. Group congratulations and certificate distribution.',
        note: 'Rest after the strenuous physical days of Hajj.',
        timetable: [
          { time: '10:00 AM', activity: 'Late breakfast buffet' },
          { time: '01:00 PM', activity: 'Dhuhr at Masjid al-Haram' },
          { time: '08:00 PM', activity: 'Hajj Mabrur ceremony & gift presentation' }
        ]
      },
      {
        dayNum: 10, location: 'mecca',
        activity: 'Farewell Tawaf (Tawaf al-Wada) around the Holy Kaaba. Prepare luggage for Madinah transfer.',
        note: 'Must be the final action in Makkah before departing.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr & Farewell Tawaf (Tawaf al-Wada)' },
          { time: '02:00 PM', activity: 'Luggage loading and check-out' }
        ]
      },
      {
        dayNum: 11, location: 'travel',
        activity: 'Travel to Madinah Munawwarah via Haramain High-Speed Rail. Hotel check-in facing Prophet\'s Mosque.',
        note: 'Prepare for peaceful days in the City of the Prophet (PBUH).',
        timetable: [
          { time: '09:00 AM', activity: 'Board Haramain Bullet Train' },
          { time: '11:30 AM', activity: 'Arrive Madinah and check-in to Dar Al Taqwa Hotel' },
          { time: '04:30 PM', activity: 'First group walk and Salam at Al-Masjid an-Nabawi' }
        ]
      },
      {
        dayNum: 12, location: 'medina',
        activity: 'Rawdah Sharif entry permits via Nusuk. Salam on the Prophet (PBUH) and Companions.',
        note: 'Keep permit barcodes ready.',
        timetable: [
          { time: '08:30 AM', activity: 'Brothers Rawdah entry' },
          { time: '02:00 PM', activity: 'Sisters Rawdah entry' },
          { time: '08:30 PM', activity: 'Group dinner' }
        ]
      },
      {
        dayNum: 13, location: 'medina',
        activity: 'Madinah Historical Ziyarat: Masjid Quba, Mount Uhud, and Qiblatain.',
        note: 'Wudhu in hotel for Quba reward.',
        timetable: [
          { time: '07:30 AM', activity: 'VIP coach departure for Madinah Ziyarat' },
          { time: '08:15 AM', activity: 'Masjid Quba & Mount Uhud visits' },
          { time: '01:00 PM', activity: 'Dhuhr at Prophet\'s Mosque' }
        ]
      },
      {
        dayNum: 14, location: 'medina',
        activity: 'Personal worship, Quran circles, and resting in the Prophet\'s Mosque.',
        note: 'Utilize time for personal reflection.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr in Rawdah/Haram' },
          { time: '01:00 PM', activity: 'Dhuhr' },
          { time: '08:00 PM', activity: 'Isha' }
        ]
      },
      {
        dayNum: 15, location: 'medina',
        activity: 'Khandaq (Battle of Trench) site, Dates market, and Seerah lecture.',
        note: 'Shopping for dates and souvenirs.',
        timetable: [
          { time: '09:00 AM', activity: 'Visit Khandaq and Dates Souq' },
          { time: '05:30 PM', activity: 'Seerah Lecture by Sheikh' }
        ]
      },
      {
        dayNum: 16, location: 'medina',
        activity: 'Jummah prayer at Al-Masjid an-Nabawi.',
        note: 'Reach mosque early for Jummah.',
        timetable: [
          { time: '09:30 AM', activity: 'Early departure for Jummah' },
          { time: '12:30 PM', activity: 'Jummah Khutbah & Prayer' }
        ]
      },
      {
        dayNum: 17, location: 'medina',
        activity: 'Day of worship and Quran completion circles.',
        note: 'Group Khatmul Quran.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr & Quran circle' },
          { time: '08:00 PM', activity: 'Isha and dinner' }
        ]
      },
      {
        dayNum: 18, location: 'medina',
        activity: 'Visit King Fahd Quran Printing Complex (subject to appointment).',
        note: 'Free Quran gift presented to visitors.',
        timetable: [
          { time: '08:30 AM', activity: 'Quran Printing Complex visit' },
          { time: '01:00 PM', activity: 'Dhuhr at Haram' }
        ]
      },
      {
        dayNum: 19, location: 'medina',
        activity: 'Final full day of worship. Luggage packing and 5L Zamzam water container allocation.',
        note: 'Weigh bags and attach Amja Travels tags.',
        timetable: [
          { time: '10:00 AM', activity: 'Baggage weighing and tagging' },
          { time: '08:00 PM', activity: 'Farewell group dinner' }
        ]
      },
      {
        dayNum: 20, location: 'medina',
        activity: 'Farewell Salam at the Prophet\'s Holy Rawdah. Hotel check-out.',
        note: 'Final Salam before departure.',
        timetable: [
          { time: '04:30 AM', activity: 'Fajr & Farewell Salam' },
          { time: '11:00 AM', activity: 'Check-out & coach transfer to Madinah Airport' }
        ]
      },
      {
        dayNum: 21, location: 'travel',
        activity: 'Departure from Prince Mohammad Bin Abdulaziz Airport (Madinah). Return flight arrival home.',
        note: 'Welcome home Hajjis & Hajjahs! May Allah accept your Hajj.',
        timetable: [
          { time: '01:00 AM', activity: 'Flight departure from Madinah' },
          { time: '10:30 AM', activity: 'Arrival at Colombo International Airport' }
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

    const selectedGroup = groupList.find(g => g.id === selectedGroupId) || groupList[0] || null;
    const itinerary = selectedGroup?.itinerary || [];
    const members = selectedGroup ? customerList.filter(c => c.groupId === selectedGroup.id && c.status !== 'cancelled') : [];

    container.innerHTML = `
      <!-- TOP ACTION BAR & COHORT SELECTOR -->
      <div class="filter-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 600; font-size: 0.875rem; color: var(--text-main);">Select Tour Cohort:</span>
              <select id="itinerary-cohort-select" style="padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color); font-weight: 600; font-size: 0.875rem; background: #ffffff; color: #065f46;">
                ${groupList.length === 0 ? '<option value="">No Tour Cohorts Available</option>' : groupList.map(g => `
                  <option value="${g.id}" ${selectedGroup && selectedGroup.id === g.id ? 'selected' : ''}>
                    ${g.name} (${(g.type || 'hajj').toUpperCase()})
                  </option>
                `).join('')}
              </select>
            </div>

            ${selectedGroup ? `
              <div style="display: flex; gap: 0.5rem; font-size: 0.78rem; color: var(--text-muted);">
                <span>📅 <strong>Departure:</strong> ${selectedGroup.departureDate || 'TBD'}</span>
                <span>🧕 <strong>Tour Leader:</strong> ${selectedGroup.guide || 'Assigned Sheikh'}</span>
                <span>👥 <strong>Pilgrims:</strong> ${members.length} Pax</span>
              </div>
            ` : ''}
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-print-leaflet" ${!selectedGroup ? 'disabled' : ''} style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Tour Timetable Leaflet
            </button>
            <button class="btn btn-secondary" id="btn-open-templates" ${!selectedGroup ? 'disabled' : ''} style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              1-Click Itinerary Templates
            </button>
            <button class="btn btn-primary" id="btn-add-itinerary-day" ${!selectedGroup ? 'disabled' : ''} style="display: inline-flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Add Custom Day
            </button>
          </div>

        </div>
      </div>

      <!-- MAIN ITINERARY TIMELINE VIEW -->
      ${!selectedGroup ? `
        <div class="card" style="text-align: center; padding: 4rem; color: var(--text-muted);">
          <h3>No Tour Cohorts Established Yet</h3>
          <p>Please establish a tour cohort in the "Tour Groups" section before building daily itineraries.</p>
        </div>
      ` : `
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">
                ${selectedGroup.name} &mdash; Day-by-Day Chronological Schedule
              </h2>
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                ${itinerary.length} Days configured &bull; Includes prayer times, guided Ziyarat tours, and logistics
              </span>
            </div>
            <span class="badge ${selectedGroup.type === 'umrah' ? 'badge-umrah' : 'badge-hajj'}" style="font-size: 0.75rem;">
              ${(selectedGroup.type || 'hajj').toUpperCase()} TOUR
            </span>
          </div>

          <!-- Timeline Days Grid -->
          <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            ${itinerary.length === 0 ? `
              <div style="text-align: center; padding: 3rem 1.5rem; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px;">
                <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
                  No itinerary days configured yet for <strong>${selectedGroup.name}</strong>.
                </p>
                <div style="display: flex; justify-content: center; gap: 0.75rem;">
                  <button class="btn btn-primary" id="btn-empty-load-template" style="display: inline-flex; align-items: center; gap: 6px;">
                    Apply 1-Click Predefined Template
                  </button>
                  <button class="btn btn-secondary" id="btn-empty-add-day">
                    + Add Custom Day 1
                  </button>
                </div>
              </div>
            ` : itinerary.map((d, index) => {
              const locationColors = {
                mecca: '#065f46',
                medina: '#0284c7',
                mina: '#d97706',
                arafat: '#b45309',
                travel: '#475569'
              };
              const locColor = locationColors[d.location] || '#065f46';
              const timetable = d.timetable || [];

              return `
                <div style="background: #f8fafc; border: 1px solid var(--border-color); border-left: 4px solid ${locColor}; border-radius: 6px; padding: 1rem;">
                  
                  <!-- Day Header -->
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">Day ${d.dayNum || (index + 1)}</span>
                        ${d.date ? `<span style="font-size: 0.78rem; color: var(--text-muted); font-family: monospace;">(${d.date})</span>` : ''}
                        <span class="badge" style="background: #ffffff; border: 1px solid #cbd5e1; font-size: 0.68rem; text-transform: uppercase; color: ${locColor}; font-weight: 700;">
                          ${d.location || 'Makkah'}
                        </span>
                      </div>
                      <p style="font-size: 0.8125rem; color: var(--text-main); margin: 0.35rem 0 0 0; font-weight: 500;">
                        ${d.activity}
                      </p>
                    </div>

                    <div style="display: flex; gap: 0.35rem;">
                      <button class="btn btn-secondary btn-auto-schedule" data-day-index="${index}" style="padding: 3px 8px; font-size: 0.7rem;" title="Auto-fill prayer & activity slots">
                        Auto-Timetable
                      </button>
                      <button class="btn btn-secondary btn-edit-day" data-day-index="${index}" style="padding: 3px 8px; font-size: 0.7rem;">
                        Edit
                      </button>
                      <button class="btn btn-secondary btn-delete-day" data-day-index="${index}" style="padding: 3px 8px; font-size: 0.7rem; color: #dc2626;">
                        ✕
                      </button>
                    </div>
                  </div>

                  ${d.note ? `
                    <div style="font-size: 0.75rem; color: #64748b; background: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); margin-bottom: 0.6rem; font-style: italic;">
                      💡 Note: ${d.note}
                    </div>
                  ` : ''}

                  <!-- Hourly Timetable Grid -->
                  ${timetable.length > 0 ? `
                    <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem 0.75rem; margin-top: 0.5rem;">
                      <div style="font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 0.35rem; letter-spacing: 0.03em;">
                        Hourly Prayer & Activity Schedule:
                      </div>
                      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.35rem; font-size: 0.75rem;">
                        ${timetable.map(slot => `
                          <div style="display: flex; gap: 6px; align-items: center; background: #f8fafc; padding: 3px 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
                            <span style="font-family: monospace; font-weight: 700; color: #065f46; font-size: 0.72rem; min-width: 60px;">${slot.time}</span>
                            <span style="color: var(--text-main); font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${slot.activity}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : `
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic; margin-top: 0.25rem;">
                      No hourly timetable added yet. Click "Auto-Timetable" to generate standard prayer and tour times.
                    </div>
                  `}

                </div>
              `;
            }).join('')}
          </div>
        </div>
      `}

      <!-- MODAL: 1-CLICK PREDEFINED TEMPLATES -->
      <div class="modal" id="modal-templates" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Apply Predefined Itinerary Template</h3>
            <button class="modal-close" id="btn-close-templates-modal">&times;</button>
          </div>
          
          <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">
            Select an expert-crafted pilgrimage itinerary template to automatically populate this tour cohort with complete daily activities and prayer timetables.
          </p>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${Object.values(PREDEFINED_TEMPLATES).map(tmpl => `
              <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                    <strong style="font-size: 0.95rem; color: #065f46;">${tmpl.name}</strong>
                    <span class="badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 0.7rem;">${tmpl.badge}</span>
                  </div>
                  <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.75rem;">
                    ${tmpl.description}
                  </p>
                </div>
                <button class="btn btn-primary btn-apply-template" data-template-id="${tmpl.id}" style="align-self: flex-start; padding: 4px 12px; font-size: 0.75rem;">
                  Apply Template to Cohort
                </button>
              </div>
            `).join('')}
          </div>

          <div class="modal-actions" style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-templates">Cancel</button>
          </div>
        </div>
      </div>

      <!-- MODAL: ADD / EDIT ITINERARY DAY -->
      <div class="modal" id="modal-day" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3 id="modal-day-title" style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Add Itinerary Day</h3>
            <button class="modal-close" id="btn-close-day-modal">&times;</button>
          </div>
          <form id="form-day">
            <input type="hidden" id="day-edit-index" value="" />

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Day Number *</label>
                <input type="number" id="day-number" required min="1" />
              </div>
              <div class="form-group">
                <label>Date (Optional)</label>
                <input type="date" id="day-date" />
              </div>
            </div>

            <div class="form-group">
              <label>Location / Stage *</label>
              <select id="day-location">
                <option value="mecca">Makkah Al-Mukarramah</option>
                <option value="medina">Madinah Al-Munawwarah</option>
                <option value="mina">Mina Tents</option>
                <option value="arafat">Mount Arafat</option>
                <option value="travel">Transit / Flight / Train</option>
              </select>
            </div>

            <div class="form-group">
              <label>Day Activity / Description *</label>
              <textarea id="day-activity" rows="3" required placeholder="e.g. Guided Tawaf and Sa'ee rituals for complete Umrah..."></textarea>
            </div>

            <div class="form-group">
              <label>Special Instructions / Tips</label>
              <input type="text" id="day-note" placeholder="e.g. Wear comfortable walking sandals, bring Zamzam bottle" />
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-day">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Day Schedule</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.bindEvents(container, selectedGroup);
  },

  bindEvents(container, selectedGroup) {
    // Cohort selector
    const cohortSelect = container.querySelector('#itinerary-cohort-select');
    if (cohortSelect) {
      cohortSelect.addEventListener('change', (e) => {
        selectedGroupId = e.target.value;
        this.render(container);
      });
    }

    // Templates Modal
    const tmplModal = container.querySelector('#modal-templates');
    const openTmpl = () => { if (tmplModal) tmplModal.style.display = 'flex'; };
    const closeTmpl = () => { if (tmplModal) tmplModal.style.display = 'none'; };
    
    const btnOpenTmpl = container.querySelector('#btn-open-templates');
    if (btnOpenTmpl) btnOpenTmpl.addEventListener('click', openTmpl);
    const btnEmptyTmpl = container.querySelector('#btn-empty-load-template');
    if (btnEmptyTmpl) btnEmptyTmpl.addEventListener('click', openTmpl);
    const btnCloseTmpl = container.querySelector('#btn-close-templates-modal');
    if (btnCloseTmpl) btnCloseTmpl.addEventListener('click', closeTmpl);
    const btnCancelTmpl = container.querySelector('#btn-cancel-templates');
    if (btnCancelTmpl) btnCancelTmpl.addEventListener('click', closeTmpl);

    // Apply template
    container.querySelectorAll('.btn-apply-template').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tmplId = e.currentTarget.getAttribute('data-template-id');
        const tmpl = PREDEFINED_TEMPLATES[tmplId];
        if (!tmpl || !selectedGroup) return;

        if (confirm(`Apply "${tmpl.name}" to ${selectedGroup.name}? This will overwrite the daily schedule with the complete template.`)) {
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
          closeTmpl();
          this.render(container);
        }
      });
    });

    // Day Modal Handling
    const dayModal = container.querySelector('#modal-day');
    const openDayModal = () => { if (dayModal) dayModal.style.display = 'flex'; };
    const closeDayModal = () => { if (dayModal) dayModal.style.display = 'none'; };

    const btnAddDay = container.querySelector('#btn-add-itinerary-day');
    if (btnAddDay) {
      btnAddDay.addEventListener('click', () => {
        container.querySelector('#modal-day-title').innerText = 'Add Itinerary Day';
        container.querySelector('#day-edit-index').value = '';
        container.querySelector('#day-number').value = (selectedGroup?.itinerary?.length || 0) + 1;
        container.querySelector('#day-date').value = '';
        container.querySelector('#day-activity').value = '';
        container.querySelector('#day-note').value = '';
        openDayModal();
      });
    }

    const btnEmptyDay = container.querySelector('#btn-empty-add-day');
    if (btnEmptyDay) {
      btnEmptyDay.addEventListener('click', () => {
        if (btnAddDay) btnAddDay.click();
      });
    }

    const btnCloseDay = container.querySelector('#btn-close-day-modal');
    if (btnCloseDay) btnCloseDay.addEventListener('click', closeDayModal);
    const btnCancelDay = container.querySelector('#btn-cancel-day');
    if (btnCancelDay) btnCancelDay.addEventListener('click', closeDayModal);

    // Edit Day
    container.querySelectorAll('.btn-edit-day').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-day-index'));
        const day = selectedGroup.itinerary[idx];
        if (!day) return;

        container.querySelector('#modal-day-title').innerText = `Edit Day ${day.dayNum || (idx + 1)}`;
        container.querySelector('#day-edit-index').value = idx;
        container.querySelector('#day-number').value = day.dayNum || (idx + 1);
        container.querySelector('#day-date').value = day.date || '';
        container.querySelector('#day-location').value = day.location || 'mecca';
        container.querySelector('#day-activity').value = day.activity || '';
        container.querySelector('#day-note').value = day.note || '';
        openDayModal();
      });
    });

    // Save Day Form
    const formDay = container.querySelector('#form-day');
    if (formDay) {
      formDay.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedGroup) return;

        const editIndex = container.querySelector('#day-edit-index').value;
        const dayNum = Number(container.querySelector('#day-number').value);
        const date = container.querySelector('#day-date').value;
        const location = container.querySelector('#day-location').value;
        const activity = container.querySelector('#day-activity').value;
        const note = container.querySelector('#day-note').value;

        const updatedItinerary = selectedGroup.itinerary ? [...selectedGroup.itinerary] : [];

        if (editIndex !== '') {
          const idx = Number(editIndex);
          updatedItinerary[idx] = {
            ...updatedItinerary[idx],
            dayNum,
            date,
            location,
            activity,
            note
          };
        } else {
          updatedItinerary.push({
            dayNum,
            date,
            location,
            activity,
            note,
            timetable: []
          });
        }

        selectedGroup.itinerary = updatedItinerary;
        await saveGroup(selectedGroup);
        window.showNotification('Itinerary day saved successfully!', 'success');
        closeDayModal();
        this.render(container);
      });
    }

    // Delete Day
    container.querySelectorAll('.btn-delete-day').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-day-index'));
        if (confirm(`Delete Day ${idx + 1} from itinerary?`)) {
          selectedGroup.itinerary.splice(idx, 1);
          await saveGroup(selectedGroup);
          window.showNotification('Day deleted.', 'info');
          this.render(container);
        }
      });
    });

    // Auto-generate hourly timetable
    container.querySelectorAll('.btn-auto-schedule').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-day-index'));
        const day = selectedGroup.itinerary[idx];
        if (!day) return;

        const defaultSlots = [
          { time: '04:30 AM', activity: `Fajr prayer at ${day.location === 'medina' ? 'Masjid an-Nabawi' : 'Masjid al-Haram'}` },
          { time: '07:30 AM', activity: 'Buffet breakfast at hotel restaurant' },
          { time: '09:00 AM', activity: day.activity.length > 50 ? day.activity.substring(0, 50) + '...' : day.activity },
          { time: '01:00 PM', activity: 'Dhuhr prayer and lunch break' },
          { time: '04:15 PM', activity: 'Asr prayer and group spiritual circle' },
          { time: '06:30 PM', activity: 'Maghrib prayer and evening Dua' },
          { time: '08:00 PM', activity: 'Isha prayer and hotel dinner buffet' }
        ];

        day.timetable = defaultSlots;
        await saveGroup(selectedGroup);
        window.showNotification(`Auto-generated prayer & activity schedule for Day ${idx + 1}!`, 'success');
        this.render(container);
      });
    });

    // Print Timetable Leaflet
    const btnPrint = container.querySelector('#btn-print-leaflet');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        if (selectedGroup) this.printLeaflet(selectedGroup);
      });
    }
  },

  // Direct In-page Print Leaflet
  printLeaflet(selectedGroup) {
    const itinerary = selectedGroup.itinerary || [];
    const members = customerList.filter(c => c.groupId === selectedGroup.id && c.status !== 'cancelled');

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedGroup.name} - Tour Timetable</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 800; color: #065f46; margin: 0; }
          .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; background: #f9fafb; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.25rem; font-size: 12px; border: 1px solid #e5e7eb; }
          .meta-label { color: #6b7280; font-size: 10px; text-transform: uppercase; font-weight: 600; }
          .meta-val { font-weight: 700; color: #111827; margin-top: 2px; }
          .day-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.85rem; margin-bottom: 0.85rem; page-break-inside: avoid; }
          .day-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e5e7eb; padding-bottom: 0.4rem; margin-bottom: 0.4rem; }
          .day-title { font-size: 14px; font-weight: 700; color: #065f46; }
          .day-loc { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 7px; background: #ecfdf5; color: #065f46; border-radius: 4px; }
          .day-act { font-size: 12px; margin: 0 0 0.4rem 0; }
          .tt-table { width: 100%; border-collapse: collapse; margin-top: 0.4rem; font-size: 11px; }
          .tt-table td { padding: 4px 6px; border-bottom: 1px solid #f3f4f6; }
          .tt-time { width: 85px; font-weight: 700; color: #374151; font-family: monospace; }
          .footer { margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 0.75rem; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AMJA TRAVELS</h1>
            <div class="subtitle">Official Pilgrimage Tour Schedule & Day-wise Timetable</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 700; color: #111827;">${selectedGroup.name}</div>
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

        <h3 style="font-size: 14px; color: #111827; margin-bottom: 0.75rem;">Chronological Tour Schedule</h3>

        ${itinerary.length === 0 ? `
          <p style="color: #6b7280; font-size: 12px;">No itinerary days have been configured for this group.</p>
        ` : itinerary.map(d => `
          <div class="day-box">
            <div class="day-header">
              <span class="day-title">Day ${d.dayNum} (${d.date || 'Date TBD'})</span>
              <span class="day-loc">${d.location}</span>
            </div>
            <p class="day-act">${d.activity}</p>
            ${d.note ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 0.4rem; font-style: italic;">Note: ${d.note}</div>` : ''}
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
          Amja Travels (Pvt) Ltd &bull; 24/7 Pilgrim Assistance &bull; Hotline: +94 11 234 5678 / KSA: +966 50 123 4567
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
