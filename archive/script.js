/* ── CLOCK & DATE ── */
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = h + ':' + m;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = days[now.getDay()] + ', ' + String(now.getDate()).padStart(2, '0') + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  document.getElementById('today-date').textContent = dateStr;
}
updateClock();
setInterval(updateClock, 30000);

/* ── ACTIVE SHIFT DETECTION ── */
function detectShift() {
  const h = new Date().getHours();
  if (h >= 8 && h < 16) return 'A';
  if (h >= 16 && h < 24) return 'B';
  return 'C';
}

/* ── ANIMATE NUMBER ── */
function animateNum(el, target, duration, onUpdate) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const prog = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    const val = Math.floor(ease * target);
    el.textContent = val;
    if (onUpdate) onUpdate(val);
    if (prog < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── ANIMATE BAR ── */
function animateBar(el, pct, delay) {
  if (!el) return;
  setTimeout(function () { el.style.width = pct + '%'; }, delay);
}

/* ── RATIO NEEDLE ── */
function ratioToPercent(v) {
  return Math.min(Math.max(((v - 1.0) / 0.7) * 100, 0), 100);
}

/* ── STOCK DATA (Integrated from stock.js) ── */
var stockData = typeof currentStock !== 'undefined' ? currentStock.map(function (cat) {
  var defaultPct = 65;
  return {
    id: cat.id, name: cat.name, sub: cat.sub, avgPct: defaultPct,
    items: cat.items.map(function (it) {
      return {
        name: it.name,
        pct: it.qty > 0 ? defaultPct : 0,
        qty: parseFloat(it.qty).toFixed(1).replace(/\.0$/, '') + ' ' + it.unit
      };
    })
  };
}) : [];

function getClass(pct) {
  if (pct >= 50) return 'high';
  if (pct >= 25) return 'mid';
  return 'low';
}

/* ── BUILD STOCK CONTAINERS ── */
function buildStockContainers() {
  var wrap = document.getElementById('stock-containers');
  stockData.forEach(function (section, si) {
    var cls = getClass(section.avgPct);
    var pillDots = section.items.map(function (it) {
      return '<div class="stock-pill ' + getClass(it.pct) + '"></div>';
    }).join('');

    var detailRows = section.items.map(function (it, i) {
      var c = getClass(it.pct);
      var qtyText = parseFloat(it.qty) > 0 ? it.qty : 'Out of Stock';
      return '<div class="stock-item">' +
        '<div class="stock-item-top">' +
        '<span class="sname">' + it.name + '</span>' +
        '<span class="spct ' + c + '" id="' + section.id + '-pct-' + i + '">' + qtyText + '</span>' +
        '</div>' +
        '<div class="sbar"><div class="sbar-fill ' + c + '" id="' + section.id + '-bar-' + i + '"></div></div>' +
        '</div>';
    }).join('');

    var box = document.createElement('div');
    box.className = 'stock-box';
    box.id = 'box-' + section.id;
    box.innerHTML =
      '<div class="stock-box-header" onclick="toggleBox(\'' + section.id + '\')">' +
      '<div class="stock-box-left">' +
      '<div class="stock-box-name">' + section.name + '</div>' +
      '<div class="stock-box-sub">' + section.sub + ' · ' + section.items.length + ' materials</div>' +
      '</div>' +
      '<div class="stock-box-right">' +
      '<div class="expand-btn" onclick="event.stopPropagation(); toggleBox(\'' + section.id + '\')">' +
      'Expand <span class="expand-icon">&#9660;</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="stock-detail" id="detail-' + section.id + '">' +
      '<div class="stock-detail-inner">' + detailRows + '</div>' +
      '</div>';

    wrap.appendChild(box);
  });
}

/* ── TOGGLE STOCK BOX ── */
function toggleBox(id) {
  var box = document.getElementById('box-' + id);
  var isOpen = box.classList.contains('expanded');
  if (isOpen) {
    box.classList.remove('expanded');
  } else {
    box.classList.add('expanded');
    var section = stockData.find(function (s) { return s.id === id; });
    section.items.forEach(function (it, i) {
      setTimeout(function () {
        var bar = document.getElementById(id + '-bar-' + i);
        if (bar) bar.style.width = it.pct + '%';
      }, i * 80);
    });
  }
}

/* ── BUILD SHIFTS ── */
function buildShifts() {
  var activeShift = detectShift();
  var shifts = [
    { id: 'A', time: '08–16', present: 8, total: 8 },
    { id: 'B', time: '16–24', present: 7, total: 8 },
    { id: 'C', time: '00–08', present: 8, total: 8 },
    { id: 'D', time: 'Stand', present: 6, total: 8 }
  ];

  var grid = document.getElementById('shift-grid');
  shifts.forEach(function (s, si) {
    var isActive = s.id === activeShift;
    var div = document.createElement('div');
    div.className = 'shift-card' + (isActive ? ' active' : '');
    var dots = Array.from({ length: s.total }, function (_, i) {
      var cls = i < s.present ? 'sdot' : 'sdot stand';
      return '<div class="' + cls + '" style="animation-delay:' + ((si * 8 + i) * 18) + 'ms"></div>';
    }).join('');
    div.innerHTML =
      '<div class="shift-card-label">Shift ' + s.id + '</div>' +
      '<div class="shift-card-sub">' + s.time + ' WIB · ' + s.present + '/' + s.total + ' pax</div>' +
      '<div class="shift-dots">' + dots + '</div>';
    grid.appendChild(div);
  });

  document.getElementById('shift-name').textContent = 'SHIFT ' + activeShift;
}

/* ── NAV ── */
function setNav(el) {
  document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
  el.classList.add('active');
}

/* ── INIT ALL ── */
setTimeout(function () {
  /* Furnace temperature */
  animateNum(document.getElementById('temp-val'), 342, 1200);
  animateBar(document.getElementById('thermo'), 26, 200);

  /* Acid gas feed (furnace section) */
  animateNum(document.getElementById('furnace-ag-val'), 97, 1300);
  animateBar(document.getElementById('furnace-ag-bar'), 81, 300);

  /* Acid gas ratio needle */
  setTimeout(function () {
    document.getElementById('acid-needle').style.left = ratioToPercent(1.52) + '%';
  }, 400);

  /* Sulfur production */
  var prodTarget = 105;
  animateNum(document.getElementById('prod-val'), 84, 1300, function (val) {
    document.getElementById('prod-pct').textContent = Math.round((val / prodTarget) * 100) + '%';
  });
  animateBar(document.getElementById('prod-bar'), 80, 300);

  buildShifts();
  buildStockContainers();
}, 700);
