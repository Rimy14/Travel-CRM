// ----------------------------------------------------
// Amja Travels CRM - Itinerary Planner (itinerary.js)
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

    container.innerHTML = `
      <div class="itinerary-container">
        <!-- Left Side: Group List Selector -->
        <div class="itinerary-groups-list">
          <h3 style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.85rem; letter-spacing: 0.05em;">
            Select Tour Cohort
          </h3>
          ${groupList.length === 0 ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 2rem 0;">
              No groups available. Please create a group first.
            </div>
          ` : groupList.map(g => {
            const isSelected = selectedGroup && g.id === selectedGroup.id;
            const count = customerList.filter(c => c.groupId === g.id && c.status !== 'cancelled').length;
            const typeBadge = g.type === 'umrah' ? 'badge-umrah' : 'badge-hajj';
            return `
              <div class="group-selector-item ${isSelected ? 'selected' : ''}" data-id="${g.id}">
                <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                  <h4 style="font-size: 0.88rem; font-weight: 700; margin: 0; color: ${isSelected ? 'var(--primary)' : 'var(--text-main)'};">${g.name}</h4>
                  <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 2px;">
                    <span class="badge ${typeBadge}" style="font-size: 0.62rem; padding: 1px 5px; text-transform: uppercase;">${g.type || 'Hajj'}</span>
                    <span style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${g.departureDate || 'Date TBD'}</span>
                  </div>
                </div>
                <span class="badge" style="background-color: ${isSelected ? 'var(--primary)' : '#f1f5f9'}; color: ${isSelected ? 'white' : 'var(--text-main)'}; font-size: 0.7rem; font-weight: 600;">
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
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--primary); margin: 0;">${selectedGroup.name} Itinerary</h2>
                  <span class="badge ${selectedGroup.type === 'umrah' ? 'badge-umrah' : 'badge-hajj'}" style="font-size: 0.7rem; text-transform: uppercase;">
                    ${selectedGroup.type || 'hajj'} Package
                  </span>
                </div>
                <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Departure: <strong>${selectedGroup.departureDate || 'N/A'}</strong> &bull; Arrival: <strong>${selectedGroup.arrivalDate || 'N/A'}</strong> &bull; Leader: <strong>${selectedGroup.guide || 'Sheikh'}</strong>
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

    this.bindEvents(container, selectedGroup);
  },

  // Helper: Generates vertical timeline item days based on dates or configured itinerary
  generateItineraryDaysList(group) {
    const itinerary = group.itinerary || [];
    
    // Calculate total days from dates if present
    let dayCount = itinerary.length;
    let start = group.departureDate ? new Date(group.departureDate) : null;
    let end = group.arrivalDate ? new Date(group.arrivalDate) : null;

    if (start && end) {
      const calcDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (!isNaN(calcDays) && calcDays > 0 && calcDays <= 60) {
        dayCount = Math.max(dayCount, calcDays);
      }
    }

    if (dayCount === 0) {
      return `
        <div style="padding: 3rem 1rem; text-align: center; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px;">
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
            No itinerary schedule generated yet for <strong>${group.name}</strong>.
          </p>
          <button class="btn btn-primary" id="btn-empty-apply-template" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8125rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Apply 1-Click Predefined Template
          </button>
        </div>
      `;
    }

    const timelineHtml = [];

    for (let i = 0; i < dayCount; i++) {
      let dateString = '';
      if (start) {
        const currentDayDate = new Date(start);
        currentDayDate.setDate(start.getDate() + i);
        dateString = currentDayDate.toISOString().substring(0, 10);
      }

      // Find saved day config, or fallback to default
      let dayData = itinerary.find(d => d.dayNum === i + 1 || (dateString && d.date === dateString));
      if (!dayData) {
        dayData = {
          dayNum: i + 1,
          date: dateString,
          location: 'travel',
          activity: 'Travel details not defined. Click Edit Plan to customize this day.',
          note: '',
          timetable: []
        };
      }

      // Location Label Styling
      let locationBadgeClass = 'badge-hajj';
      if (dayData.location === 'mecca') locationBadgeClass = 'badge-active';
      if (dayData.location === 'medina') locationBadgeClass = 'badge-umrah';
      if (dayData.location === 'mina') locationBadgeClass = 'badge-completed';
      if (dayData.location === 'arafat') locationBadgeClass = 'badge-hajj';

      timelineHtml.push(`
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <div>
                <span class="timeline-day">Day ${dayData.dayNum}</span>
                <span class="timeline-date">(${dayData.date || dateString || 'Date TBD'})</span>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="badge ${locationBadgeClass}" style="font-size: 0.65rem; text-transform: uppercase;">
                  ${dayData.location}
                </span>
                <button class="btn btn-secondary btn-auto-schedule" data-day="${dayData.dayNum}" data-date="${dayData.date || dateString}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;" title="Auto-fill prayer & activity slots">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  Auto-Schedule
                </button>
                <button class="btn btn-secondary btn-edit-day" data-day="${dayData.dayNum}" data-date="${dayData.date || dateString}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px;">
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

  bindEvents(container, selectedGroup) {
    // Group Selector item click
    const groupItems = container.querySelectorAll('.group-selector-item');
    groupItems.forEach(item => {
      item.addEventListener('click', () => {
        selectedGroupId = item.getAttribute('data-id');
        this.render(container);
      });
    });

    // Templates Modal
    const btnLoadTmpl = container.querySelector('#btn-load-template');
    if (btnLoadTmpl) {
      btnLoadTmpl.addEventListener('click', () => {
        if (selectedGroup) this.openTemplatesModal(container, selectedGroup);
      });
    }

    const btnEmptyTmpl = container.querySelector('#btn-empty-apply-template');
    if (btnEmptyTmpl) {
      btnEmptyTmpl.addEventListener('click', () => {
        if (selectedGroup) this.openTemplatesModal(container, selectedGroup);
      });
    }

    // Print Timetable Leaflet
    const btnPrint = container.querySelector('#btn-print-itinerary');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        if (selectedGroup) this.openPrintItineraryModal(selectedGroup);
      });
    }

    // Edit Day Plan Trigger
    const editDayBtns = container.querySelectorAll('.btn-edit-day');
    editDayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dayNum = parseInt(btn.getAttribute('data-day'));
        const dateStr = btn.getAttribute('data-date');
        if (selectedGroup) this.openEditDayModal(container, selectedGroup, dayNum, dateStr);
      });
    });

    // Auto-Schedule Day Trigger
    const autoBtns = container.querySelectorAll('.btn-auto-schedule');
    autoBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const dayNum = parseInt(btn.getAttribute('data-day'));
        const dateStr = btn.getAttribute('data-date');
        if (!selectedGroup) return;

        let itinerary = selectedGroup.itinerary ? [...selectedGroup.itinerary] : [];
        let dayIndex = itinerary.findIndex(d => d.dayNum === dayNum);
        
        let existingDay = dayIndex !== -1 ? itinerary[dayIndex] : {
          dayNum,
          date: dateStr,
          location: selectedGroup.type === 'umrah' ? (dayNum <= 7 ? 'mecca' : 'medina') : 'mecca',
          activity: 'Guided group prayers, Tawaf, and spiritual activities.',
          note: ''
        };

        const defaultSlots = [
          { time: '04:30 AM', activity: `Fajr prayer at ${existingDay.location === 'medina' ? 'Masjid an-Nabawi' : 'Masjid al-Haram'}` },
          { time: '07:30 AM', activity: 'Buffet breakfast at hotel restaurant' },
          { time: '09:00 AM', activity: existingDay.activity.length > 50 ? existingDay.activity.substring(0, 50) + '...' : existingDay.activity },
          { time: '01:00 PM', activity: 'Dhuhr prayer and lunch break' },
          { time: '04:15 PM', activity: 'Asr prayer and spiritual recitation circle' },
          { time: '06:30 PM', activity: 'Maghrib prayer and evening Dua' },
          { time: '08:00 PM', activity: 'Isha prayer and hotel dinner buffet' }
        ];

        existingDay.timetable = defaultSlots;

        if (dayIndex !== -1) {
          itinerary[dayIndex] = existingDay;
        } else {
          itinerary.push(existingDay);
        }

        selectedGroup.itinerary = itinerary;
        await saveGroup(selectedGroup);
        window.showNotification(`Auto-generated schedule for Day ${dayNum}!`, 'success');
        this.render(container);
      });
    });
  },

  // Modal: Edit Day Plan & Hourly Timetable
  openEditDayModal(container, selectedGroup, dayNum, dateStr) {
    const itinerary = selectedGroup.itinerary || [];
    const dayData = itinerary.find(d => d.dayNum === dayNum) || {
      dayNum,
      date: dateStr || '',
      location: 'mecca',
      activity: '',
      note: '',
      timetable: []
    };

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">Day ${dayNum} Schedule</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${selectedGroup.name} &bull; ${dateStr || 'Date TBD'}</span>
          </div>
          <button class="btn-close" id="btn-close-day-modal">&times;</button>
        </div>
        <div class="modal-body" style="padding-top: 1rem;">
          <form id="form-edit-day">
            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>Location / Stage</label>
                <select id="edit-day-location" class="form-control">
                  <option value="mecca" ${dayData.location === 'mecca' ? 'selected' : ''}>Makkah Al-Mukarramah</option>
                  <option value="medina" ${dayData.location === 'medina' ? 'selected' : ''}>Madinah Al-Munawwarah</option>
                  <option value="mina" ${dayData.location === 'mina' ? 'selected' : ''}>Mina Tents</option>
                  <option value="arafat" ${dayData.location === 'arafat' ? 'selected' : ''}>Mount Arafat</option>
                  <option value="travel" ${dayData.location === 'travel' ? 'selected' : ''}>Transit / Flight / Train</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date</label>
                <input type="date" id="edit-day-date" class="form-control" value="${dayData.date || dateStr || ''}" />
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <label>Day Activity / Major Milestones</label>
              <textarea id="edit-day-activity" class="form-control" rows="3" required placeholder="e.g. Guided Tawaf and Sa'ee rituals for complete Umrah...">${dayData.activity || ''}</textarea>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <label>Special Instructions / Tips for Pilgrims</label>
              <input type="text" id="edit-day-note" class="form-control" value="${dayData.note || ''}" placeholder="e.g. Wear comfortable walking sandals, bring Zamzam bottle" />
            </div>

            <!-- Timetable Slots Editor -->
            <div style="margin-top: 1.25rem; border-top: 1px solid var(--border-color); padding-top: 0.85rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label style="font-weight: 700; font-size: 0.8125rem; color: var(--text-main); margin: 0;">Hourly Prayer & Activity Timetable</label>
                <button type="button" class="btn btn-secondary" id="btn-add-time-slot" style="font-size: 0.72rem; padding: 2px 8px;">+ Add Slot</button>
              </div>
              <div id="timetable-slots-container" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto; padding-right: 4px;">
                ${(dayData.timetable || []).map((slot, sIdx) => `
                  <div class="time-slot-row" style="display: flex; gap: 0.4rem; align-items: center;">
                    <input type="text" class="form-control slot-time" value="${slot.time}" placeholder="04:30 AM" style="width: 95px; font-family: monospace; font-size: 0.75rem;" />
                    <input type="text" class="form-control slot-activity" value="${slot.activity}" placeholder="Fajr prayer at Haram" style="flex: 1; font-size: 0.78rem;" />
                    <button type="button" class="btn btn-secondary btn-remove-slot" style="padding: 2px 7px; color: #dc2626; font-size: 0.72rem;">✕</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="modal-footer" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-day-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Day Schedule</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('#btn-close-day-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-cancel-day-modal').addEventListener('click', closeModal);

    // Add slot button
    modalOverlay.querySelector('#btn-add-time-slot').addEventListener('click', () => {
      const container = modalOverlay.querySelector('#timetable-slots-container');
      const row = document.createElement('div');
      row.className = 'time-slot-row';
      row.style.cssText = 'display: flex; gap: 0.4rem; align-items: center;';
      row.innerHTML = `
        <input type="text" class="form-control slot-time" value="09:00 AM" placeholder="09:00 AM" style="width: 95px; font-family: monospace; font-size: 0.75rem;" />
        <input type="text" class="form-control slot-activity" value="" placeholder="Activity description" style="flex: 1; font-size: 0.78rem;" />
        <button type="button" class="btn btn-secondary btn-remove-slot" style="padding: 2px 7px; color: #dc2626; font-size: 0.72rem;">✕</button>
      `;
      row.querySelector('.btn-remove-slot').addEventListener('click', () => row.remove());
      container.appendChild(row);
    });

    // Remove slot buttons
    modalOverlay.querySelectorAll('.btn-remove-slot').forEach(btn => {
      btn.addEventListener('click', (e) => e.target.closest('.time-slot-row').remove());
    });

    // Save Form
    modalOverlay.querySelector('#form-edit-day').addEventListener('submit', async (e) => {
      e.preventDefault();
      const location = modalOverlay.querySelector('#edit-day-location').value;
      const date = modalOverlay.querySelector('#edit-day-date').value;
      const activity = modalOverlay.querySelector('#edit-day-activity').value;
      const note = modalOverlay.querySelector('#edit-day-note').value;

      const slots = [];
      modalOverlay.querySelectorAll('.time-slot-row').forEach(row => {
        const time = row.querySelector('.slot-time').value.trim();
        const act = row.querySelector('.slot-activity').value.trim();
        if (time && act) {
          slots.push({ time, activity: act });
        }
      });

      let updatedItinerary = selectedGroup.itinerary ? [...selectedGroup.itinerary] : [];
      let dayIndex = updatedItinerary.findIndex(d => d.dayNum === dayNum);

      const dayObj = {
        dayNum,
        date,
        location,
        activity,
        note,
        timetable: slots
      };

      if (dayIndex !== -1) {
        updatedItinerary[dayIndex] = dayObj;
      } else {
        updatedItinerary.push(dayObj);
      }

      // Sort by dayNum
      updatedItinerary.sort((a, b) => a.dayNum - b.dayNum);

      selectedGroup.itinerary = updatedItinerary;
      await saveGroup(selectedGroup);
      window.showNotification(`Day ${dayNum} schedule saved!`, 'success');
      closeModal();
      this.render(container);
    });
  },

  // Modal: 1-Click Predefined Templates
  openTemplatesModal(container, selectedGroup) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">Predefined Itinerary Templates</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Apply an expert-crafted pilgrimage itinerary to <strong>${selectedGroup.name}</strong></span>
          </div>
          <button class="btn-close" id="btn-close-template">&times;</button>
        </div>
        <div class="modal-body" style="padding-top: 1rem;">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${Object.values(PREDEFINED_TEMPLATES).map(tmpl => `
              <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.15rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <strong style="font-size: 1rem; color: #065f46;">${tmpl.name}</strong>
                  <button class="btn btn-primary btn-apply-tmpl" data-id="${tmpl.id}" style="padding: 4px 12px; font-size: 0.75rem;">Apply Template</button>
                </div>
                <span class="badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 0.68rem; margin-bottom: 0.4rem; display: inline-block;">${tmpl.badge}</span>
                <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin: 0 0 0.5rem 0;">
                  ${tmpl.description}
                </p>
                <div style="font-size: 0.72rem; color: #065f46; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Includes ${tmpl.days.length} days of activities & complete hourly prayer schedules
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer" style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
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
          closeModal();
          this.render(container);
        }
      });
    });
  },

  // Direct In-page Print Leaflet
  openPrintItineraryModal(selectedGroup) {
    const itinerary = selectedGroup.itinerary || [];
    const members = customerList.filter(c => c.groupId === selectedGroup.id && c.status !== 'cancelled');

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedGroup.name} - Tour Timetable</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #065f46; padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; }
          .subtitle { font-size: 11px; color: #6b7280; margin-top: 3px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; background: #f9fafb; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.25rem; font-size: 11px; border: 1px solid #e5e7eb; }
          .meta-label { color: #6b7280; font-size: 10px; text-transform: uppercase; font-weight: 600; }
          .meta-val { font-weight: 700; color: #111827; margin-top: 2px; }
          .day-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.85rem; margin-bottom: 0.85rem; page-break-inside: avoid; }
          .day-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e5e7eb; padding-bottom: 0.4rem; margin-bottom: 0.4rem; }
          .day-title { font-size: 13px; font-weight: 700; color: #065f46; }
          .day-loc { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 7px; background: #ecfdf5; color: #065f46; border-radius: 4px; }
          .day-act { font-size: 11px; margin: 0 0 0.4rem 0; }
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
            <div style="font-size: 14px; font-weight: 700; color: #111827;">${selectedGroup.name}</div>
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

        <h3 style="font-size: 13px; color: #111827; margin-bottom: 0.75rem;">Chronological Tour Schedule</h3>

        ${itinerary.length === 0 ? `
          <p style="color: #6b7280; font-size: 11px;">No itinerary days have been configured for this group.</p>
        ` : itinerary.map(d => `
          <div class="day-box">
            <div class="day-header">
              <span class="day-title">Day ${d.dayNum} (${d.date || 'Date TBD'})</span>
              <span class="day-loc">${d.location}</span>
            </div>
            <p class="day-act">${d.activity}</p>
            ${d.note ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 0.4rem; font-style: italic;">Note: ${d.note}</div>` : ''}
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
