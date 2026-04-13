(function() {
  var currentPath = window.location.pathname.toLowerCase();
  var isFurnace = currentPath.includes('furnace.html');
  var isStock = currentPath.includes('stock.html');
  var isCrew = currentPath.includes('crew.html');
  var isSettings = currentPath.includes('settings.html');
  var isIndex = currentPath.includes('index.html') || currentPath.endsWith('/') || (!isFurnace && !isStock && !isCrew && !isSettings);

  var navHtml = '<div class="bottom-nav">' +
    '<div class="nav-item ' + (isFurnace ? 'active' : '') + '" onclick="window.location.href=\'furnace.html\'">' +
      '<div class="nav-icon">🔥</div>' +
      '<div class="nav-label">Furnace</div>' +
    '</div>' +
    '<div class="nav-item ' + (isStock ? 'active' : '') + '" onclick="window.location.href=\'stock.html\'">' +
      '<div class="nav-icon">📦</div>' +
      '<div class="nav-label">Stock</div>' +
    '</div>' +
    '<div class="nav-item highlight-dash ' + (isIndex ? 'active' : '') + '" onclick="window.location.href=\'index.html\'">' +
      '<div class="nav-icon">📊</div>' +
      '<div class="nav-label">Dashboard</div>' +
    '</div>' +
    '<div class="nav-item ' + (isCrew ? 'active' : '') + '" onclick="window.location.href=\'crew.html\'">' +
      '<div class="nav-icon">👷</div>' +
      '<div class="nav-label">Crew</div>' +
    '</div>' +
    '<div class="nav-item ' + (isSettings ? 'active' : '') + '" onclick="window.location.href=\'settings.html\'">' +
      '<div class="nav-icon">⚙️</div>' +
      '<div class="nav-label">Settings</div>' +
    '</div>' +
  '</div>';

  var placeholder = document.getElementById('nav-placeholder');
  if (placeholder) {
    placeholder.outerHTML = navHtml;
  }
})();
