// Local script for time on furnace page
function updateClockF() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const clockEl = document.getElementById('clock-f');
  if (clockEl) clockEl.textContent = h + ':' + m;
}
updateClockF();
setInterval(updateClockF, 30000);
