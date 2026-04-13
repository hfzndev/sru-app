// Clock script for stock page
function updateClockStock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('clock-stock');
    if (clockEl) clockEl.textContent = h + ':' + m;
}
updateClockStock();
setInterval(updateClockStock, 30000);

// Initialize stock data. We will store it in localStorage so additions/reductions persist locally.
const defaultStockData = [
    {
        id: 'sru', name: 'UNIT 90', sub: 'Sulfur Recovery Unit',
        items: [
            { id: 'sru_1', name: 'MDEA', qty: 1100, unit: 'L' },
            { id: 'sru_2', name: 'Xaerus', qty: 4.4, unit: 'L' },
            { id: 'sru_3', name: 'Turbo 46', qty: 4.4, unit: 'L' },
            { id: 'sru_4', name: 'MASRI', qty: 0, unit: 'L' },
        ]
    },
    {
        id: 'ipal', name: 'UNIT 47', sub: 'IPAL',
        items: [
            { id: 'ipal_0', name: 'PAC', qty: 51, unit: 'bag' },
            { id: 'ipal_1', name: 'Caustic', qty: 380, unit: 'bag' },
            { id: 'ipal_2', name: 'Flocculant BFP', qty: 126, unit: 'bag' },
            { id: 'ipal_3', name: 'TSP', qty: 275, unit: 'bag' },
            { id: 'ipal_4', name: 'Sodium Bicarbonat', qty: 225, unit: 'bag' } // simulated empty
        ]
    },
    {
        id: 'wwt', name: 'UNIT 166', sub: 'Waste Water Treatment',
        items: [
            { id: 'wwt_0', name: 'Klorin 12%', qty: 390, unit: 'L' },
            { id: 'wwt_1', name: 'Anti-Foam Agent', qty: 66, unit: 'L' },
            { id: 'wwt_2', name: 'pH Adjuster NaHCO3', qty: 455, unit: 'kg' },
            { id: 'wwt_3', name: 'Activated Carbon', qty: 300, unit: 'kg' },
            { id: 'wwt_4', name: 'Biocide WT-202', qty: 44, unit: 'L' }
        ]
    }
];

let currentStock = JSON.parse(localStorage.getItem('sru_stock_data_v3')) || defaultStockData;

function saveStock() {
    localStorage.setItem('sru_stock_data_v3', JSON.stringify(currentStock));
}

function renderStockList() {
    const container = document.getElementById('stock-manage-list');
    if (!container) return;
    container.innerHTML = '';

    currentStock.forEach(category => {
        const catDiv = document.createElement('div');
        catDiv.className = 'stock-category';

        const title = document.createElement('div');
        title.className = 'stock-category-title';
        title.textContent = `${category.name} - ${category.sub}`;
        catDiv.appendChild(title);

        category.items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'stock-item-card';

            const isAvailable = item.qty > 0;
            const availClass = isAvailable ? 'available' : 'empty';
            const availText = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';

            let extraText = '';
            if (category.id === 'ipal' && item.unit === 'bag') {
                const kgConverted = item.qty * 25;
                extraText = ` <span style="font-size: 14px; font-family: 'DM Mono', monospace; color: rgba(255,255,255,0.4); margin-left: 6px; font-weight: normal;">≈ ${parseFloat(kgConverted).toFixed(1).replace(/\.0$/, '')} kg</span>`;
            }

            card.innerHTML = `
                <div class="stock-header-row">
                    <span class="stock-name">${item.name}</span>
                    <span class="stock-avail ${availClass}">${availText}</span>
                </div>
                <div class="stock-qty">${parseFloat(item.qty).toFixed(1).replace(/\.0$/, '')} <span>${item.unit}</span>${extraText}</div>
                <form class="stock-action-form" onsubmit="handleStockUpdate(event, '${category.id}', '${item.id}')">
                    <input type="number" step="any" required placeholder="Amt" id="input-${item.id}">
                    <select id="action-${item.id}">
                        <option value="add">Add (+)</option>
                        <option value="reduce">Reduce (-)</option>
                    </select>
                    <button type="submit">Update</button>
                </form>
            `;
            catDiv.appendChild(card);
        });

        container.appendChild(catDiv);
    });
}

window.handleStockUpdate = function (e, categoryId, itemId) {
    e.preventDefault();
    const amountVal = document.getElementById(`input-${itemId}`).value;
    const action = document.getElementById(`action-${itemId}`).value;

    let amount = parseFloat(amountVal);
    if (isNaN(amount) || amount <= 0) return;

    // find item
    currentStock.forEach(cat => {
        if (cat.id === categoryId) {
            cat.items.forEach(it => {
                if (it.id === itemId) {
                    if (action === 'add') {
                        it.qty += amount;
                    } else if (action === 'reduce') {
                        it.qty = Math.max(0, it.qty - amount);
                    }
                }
            });
        }
    });

    saveStock();
    renderStockList();
};

// Initial Render
renderStockList();
