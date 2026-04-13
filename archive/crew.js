// Clock
function updateClock() {
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  var clk = document.getElementById('clock-crew');
  if (clk) clk.textContent = h + ':' + m;
}
setInterval(updateClock, 1000);
updateClock();

var CREW_CACHE_KEY = 'sru_crew_status_v2';

// Base Data Definition
var defaultCrewData = [
  {
    id: 'harian',
    name: 'Harian',
    sub: 'Daily Workers',
    workers: [
      { id: 'h1', name: 'Gondo Pramono', role: 'Section Head SRU & IPAL', type: 'Organik', status: 'present' },
      { id: 'h2', name: 'Aziz Saefur Rahman', role: 'Sr. Supervisor LPG & SRU', type: 'Organik', status: 'present' },
      { id: 'h3', name: 'Ahmad Djuhaeri', role: 'Sr. Supervisor IPAL & WWT', type: 'Organik', status: 'present' },
      { id: 'h4', name: 'Teguh Asmara', role: 'Sr. Supervisor Facility', type: 'Organik', status: 'present' },
      { id: 'h5', name: 'Ibnu Fadillah', role: 'Administrator', type: 'Organik', status: 'present' },
      { id: 'h6', name: 'Sapto', role: 'Administrator', type: 'TKJP', status: 'present' },
      { id: 'h7', name: 'Eko Wahyu', role: 'HSE Compliance', type: 'Organik', status: 'present' },
      { id: 'h8', name: 'Viki', role: 'Cleaner', type: 'TKJP', status: 'present' },
      { id: 'h9', name: 'Bilal', role: 'Cleaner', type: 'TKJP', status: 'present' },
      { id: 'h10', name: 'Isarotul', role: 'Driver', type: 'TKJP', status: 'present' },
    ]
  },
  {
    id: 'shift-a',
    name: 'Shift A',
    sub: 'Operations Shift',
    workers: [
      { id: 'a1', name: 'Endra Kurniawan', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'a2', name: 'Eka Wahyu Widodo', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'a3', name: 'Inmas Andhika Yomi', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'a4', name: 'M. Sofyan Assauri', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'a5', name: 'Ichsan Adiutomo', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a6', name: 'Antonius Dwi Pamungkas', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a7', name: 'Kutut Bayu Purwoko', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a8', name: 'Alif Nur', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a9', name: 'Sudarno', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'a10', name: 'Karyanto', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  },
  {
    id: 'shift-b',
    name: 'Shift B',
    sub: 'Operations Shift',
    workers: [
      { id: 'b1', name: 'Robit Ichwanudin', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'b2', name: 'Lukman Hakim Maolana', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'b3', name: 'Akhmad Ryan Hutomo', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'b4', name: 'Krisyoto', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'b5', name: 'Nurdiyansari', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b6', name: 'Nik Abdul Aziz Massal', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b7', name: 'Diqa Nanda Abiyasa R.', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b8', name: 'M. Imam Firmansyah', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b9', name: 'Roni Martono', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'b10', name: 'Carmadi', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  },
  {
    id: 'shift-c',
    name: 'Shift C',
    sub: 'Operations Shift',
    workers: [
      { id: 'c1', name: 'Siyam Prayitno', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'c2', name: 'M. Yahya Nashiruddin', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'c3', name: 'Achmad Setyoaji', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'c4', name: 'M. Syakriun Niam', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'c5', name: 'Ripa Mardiana', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'c6', name: 'M. Filza Maulana Fahmi', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'c7', name: 'Hafiz Norman', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'c9', name: 'Zunanto', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'c10', name: 'Suprijadi', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'c11', name: 'Himamudin', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'c12', name: 'Sunarso', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  },
  {
    id: 'shift-d',
    name: 'Shift D',
    sub: 'Operations Shift',
    workers: [
      { id: 'd1', name: 'Driyanto', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'd2', name: 'Yusuf Supriadi', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'd3', name: 'M. Dede Abdurakhman', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'd4', name: 'Adtya Permana I.', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'd5', name: 'Fariz Rachman Hakim', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd6', name: 'M. Dio Fajar Sidik', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd7', name: 'Rizki Nur Aziz', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd8', name: 'Pandu Dian Nugraha', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd9', name: 'Robertus Prasetyo', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'd10', name: 'Yatiman', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  }
];

// Load from cache or default fallback
var currentCrew = JSON.parse(localStorage.getItem(CREW_CACHE_KEY));
if (!currentCrew) {
  currentCrew = defaultCrewData;
  localStorage.setItem(CREW_CACHE_KEY, JSON.stringify(currentCrew));
}

// Function triggered when dropdown value changes
window.changeWorkerStatus = function (sectionIndex, workerIndex, selectObj) {
  var newStatus = selectObj.value;
  // Update the array state
  currentCrew[sectionIndex].workers[workerIndex].status = newStatus;
  // Push to local storage
  localStorage.setItem(CREW_CACHE_KEY, JSON.stringify(currentCrew));
  // Update select input CSS class
  selectObj.className = 'status-select ' + newStatus;
};

// Main DOM rendering function
function buildCrewContainers() {
  var wrap = document.getElementById('crew-list-container');
  if (!wrap) return;
  wrap.innerHTML = '';

  currentCrew.forEach(function (section, sIdx) {

    var detailRows = section.workers.map(function (w, wIdx) {

      var badgeCls = w.type === 'Organik' ? 'org' : 'tkjp';
      var presentSel = w.status === 'present' ? 'selected' : '';
      var leaveSel = w.status === 'leave' ? 'selected' : '';
      var tripSel = w.status === 'trip' ? 'selected' : '';

      return '<div class="worker-card">' +
        '<div class="worker-info">' +
        '<div class="w-name">' + w.name + ' <span class="w-badge ' + badgeCls + '">' + w.type + '</span></div>' +
        '<div class="w-role">' + w.role + '</div>' +
        '</div>' +
        '<select class="status-select ' + w.status + '" onchange="changeWorkerStatus(' + sIdx + ', ' + wIdx + ', this)">' +
        '<option value="present" ' + presentSel + '>Present</option>' +
        '<option value="leave" ' + leaveSel + '>On Leave</option>' +
        '<option value="trip" ' + tripSel + '>Bus. Trip</option>' +
        '</select>' +
        '</div>';
    }).join('');

    var box = document.createElement('div');
    box.className = 'crew-box';
    box.id = 'cbox-' + section.id;
    box.innerHTML =
      '<div class="crew-box-header" onclick="toggleCrewBox(\'' + section.id + '\')">' +
      '<div>' +
      '<div class="crew-box-name">' + section.name + '</div>' +
      '<div class="crew-box-sub">' + section.sub + ' · ' + section.workers.length + ' Personnel</div>' +
      '</div>' +
      '<div class="crew-expand-btn">' +
      'Personnel <span class="expand-icon">&#9660;</span>' +
      '</div>' +
      '</div>' +
      '<div class="crew-detail">' +
      '<div class="crew-detail-inner">' + detailRows + '</div>' +
      '</div>';

    wrap.appendChild(box);
  });
}

// Logic to snap accordion dropdowns
window.toggleCrewBox = function (id) {
  var box = document.getElementById('cbox-' + id);
  if (box.classList.contains('expanded')) {
    box.classList.remove('expanded');
  } else {
    // Optionally close all others: 
    // document.querySelectorAll('.crew-box.expanded').forEach(function(b) { b.classList.remove('expanded'); });
    box.classList.add('expanded');
  }
};

// Initialize render
document.addEventListener("DOMContentLoaded", function () {
  buildCrewContainers();
});
