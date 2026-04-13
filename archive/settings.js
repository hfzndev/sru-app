// Clock Update Loop
function updateClock() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var clk = document.getElementById('clock-settings');
    if (clk) clk.textContent = h + ':' + m;
}
setInterval(updateClock, 1000);
updateClock();

// UI Logic
function toggleNotif() {
  var t = document.getElementById('notif-toggle');
  localStorage.setItem('sru_app_notifications', t.checked ? 'on' : 'off');
}

function clearStorage() {
  if (confirm("WARNING: Are you sure you want to completely erase your app data? This will reset all your material stocks and crew attendances back to the factory defaults.")) {
    // Completely clear all stored variables
    localStorage.removeItem('sru_stock_data_v3');
    localStorage.removeItem('sru_crew_status_v1');
    localStorage.removeItem('sru_crew_status_v2');
    localStorage.removeItem('sru_app_notifications');
    
    alert("Cache Successfully Cleared! Returning to Data Dashboard...");
    window.location.href = 'index.html';
  }
}

// On Load init
document.addEventListener("DOMContentLoaded", function() {
  var nToggle = localStorage.getItem('sru_app_notifications');
  if (nToggle === 'on') {
    document.getElementById('notif-toggle').checked = true;
  }
});
