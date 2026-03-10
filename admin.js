/**
 * Nexus Gaming — Advanced Admin Dashboard
 * Manages buy requests, analytics, demo data seeding
 */

const ORDERS_KEY = 'nexus-orders';
const SEED_FLAG_KEY = 'nexus-seeded';
const ADMIN_KEY = 'nexus-admin';
const CURRENCY = '$';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'nexus123';

// Products matching the store catalog (for seed data)
const SEED_PRODUCTS = [
    { id: 1, name: 'Pro X Mechanical Keyboard', price: 149 },
    { id: 2, name: 'Ultra Light Gaming Mouse', price: 89 },
    { id: 3, name: 'Immersive 7.1 Headset', price: 129 },
    { id: 4, name: '27" 240Hz Gaming Monitor', price: 399 },
    { id: 5, name: 'Pro Racing Chair', price: 349 },
    { id: 6, name: 'RGB Mouse Pad XL', price: 35 },
    { id: 7, name: 'Stream Webcam 1080p', price: 99 },
    { id: 8, name: 'Wired Pro Controller', price: 59 },
    { id: 9, name: 'TKL RGB Keyboard', price: 119 },
    { id: 10, name: 'Wireless Gaming Headset', price: 159 },
    { id: 11, name: '32" Curved Gaming Monitor', price: 449 },
    { id: 12, name: 'Desk Mount Monitor Arm', price: 79 }
];

const DEMO_CUSTOMERS = [
    { firstName: 'Alex', lastName: 'Chen', email: 'alex.chen@email.com', phone: '+1 555-0123' },
    { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.m@outlook.com', phone: '+1 555-0124' },
    { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@gmail.com', phone: '+1 555-0125' },
    { firstName: 'Emma', lastName: 'Williams', email: 'emma.w@yahoo.com', phone: '+1 555-0126' },
    { firstName: 'James', lastName: 'Rodriguez', email: 'j.rodriguez@email.com', phone: '+1 555-0127' },
    { firstName: 'Olivia', lastName: 'Davis', email: 'olivia.d@proton.me', phone: '+1 555-0128' },
    { firstName: 'Lucas', lastName: 'Martinez', email: 'lucas.m@gmail.com', phone: '+1 555-0129' },
    { firstName: 'Sophia', lastName: 'Anderson', email: 'sophia.a@email.com', phone: '+1 555-0130' },
    { firstName: 'Noah', lastName: 'Thompson', email: 'noah.t@outlook.com', phone: '+1 555-0131' },
    { firstName: 'Ava', lastName: 'Garcia', email: 'ava.garcia@gmail.com', phone: '+1 555-0132' }
];

const DEMO_ADDRESSES = [
    { address: '123 Gaming Lane', city: 'Los Angeles', postalCode: '90001', country: 'United States' },
    { address: '456 Stream Blvd', city: 'New York', postalCode: '10001', country: 'United States' },
    { address: '789 Esports Ave', city: 'Chicago', postalCode: '60601', country: 'United States' },
    { address: '321 RGB Street', city: 'San Francisco', postalCode: '94102', country: 'United States' },
    { address: '654 Pro Lane', city: 'Seattle', postalCode: '98101', country: 'United States' },
    { address: '987 Setup Rd', city: 'Austin', postalCode: '78701', country: 'United States' }
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
}

function generateDemoOrders() {
    const orders = [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const statuses = ['pending', 'pending', 'processing', 'processing', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled'];

    for (let i = 0; i < 18; i++) {
        const itemCount = 1 + Math.floor(Math.random() * 3);
        const items = pickN(SEED_PRODUCTS, itemCount).map(p => ({
            id: p.id, name: p.name, price: p.price,
            qty: Math.floor(Math.random() * 2) + 1
        }));
        const total = items.reduce((s, it) => s + it.price * it.qty, 0);
        const daysAgo = Math.floor(Math.random() * 14);
        const hourOffset = Math.floor(Math.random() * 12) * 60 * 60 * 1000;
        const date = now - (daysAgo * day) - hourOffset;

        const customer = pick(DEMO_CUSTOMERS);
        const shipping = pick(DEMO_ADDRESSES);
        const status = statuses[i % statuses.length];

        orders.push({
            id: 'NX' + date.toString(36).toUpperCase(),
            date,
            status,
            contact: { ...customer },
            shipping: { ...shipping },
            payment: Math.random() > 0.5 ? 'card' : 'paypal',
            items,
            total,
            notes: (status === 'processing' || status === 'shipped') && Math.random() > 0.6
                ? ['Preparing shipment', 'Tracking added', 'Customer requested express'][Math.floor(Math.random() * 3)]
                : ''
        });
    }

    return orders.sort((a, b) => b.date - a.date);
}

function seedDemoData() {
    if (localStorage.getItem(SEED_FLAG_KEY)) return;
    const existing = getOrders();
    if (existing.length >= 3) return;
    const demo = generateDemoOrders();
    const merged = [...demo, ...existing].sort((a, b) => b.date - a.date);
    saveOrders(merged);
    localStorage.setItem(SEED_FLAG_KEY, '1');
}

function getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function isAuthenticated() {
    return sessionStorage.getItem(ADMIN_KEY) === '1';
}

function setAuthenticated(val) {
    sessionStorage.setItem(ADMIN_KEY, val ? '1' : '0');
}

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTotal(n) {
    return CURRENCY + n;
}

const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

const statusFlow = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
};

// State
let currentStatusFilter = 'all';
let currentSearchQuery = '';
let currentDateRange = 'all';
let revenueChart = null;

document.addEventListener('DOMContentLoaded', () => {
    seedDemoData();
    if (isAuthenticated()) {
        showDashboard();
    } else {
        document.getElementById('login-gate').style.display = 'flex';
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    }
});

function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const user = form.querySelector('[name="username"]').value.trim();
    const pass = form.querySelector('[name="password"]').value;
    const errEl = document.getElementById('login-error');
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        setAuthenticated(true);
        document.getElementById('login-gate').style.display = 'none';
        showDashboard();
    } else {
        errEl.style.display = 'block';
        errEl.textContent = 'Invalid credentials';
    }
}

function showDashboard() {
    document.getElementById('admin-dashboard').style.display = 'block';
    renderStats();
    renderAnalytics();
    renderTopProducts();
    renderRecentActivity();
    renderOrders();
    initStatusFilter();
    initSearch();
    initDateRange();
    initExport();
    initLoadDemo();
    initRefresh();
    initOrderDetail();
    initCharts();
}

function getFilteredOrders(statusFilter, searchQuery, dateRange) {
    let orders = [...getOrders()].sort((a, b) => b.date - a.date);

    if (statusFilter !== 'all') orders = orders.filter(o => o.status === statusFilter);

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        orders = orders.filter(o =>
            (o.id || '').toLowerCase().includes(q) ||
            (o.contact?.firstName || '').toLowerCase().includes(q) ||
            (o.contact?.lastName || '').toLowerCase().includes(q) ||
            (o.contact?.email || '').toLowerCase().includes(q)
        );
    }

    if (dateRange !== 'all') {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const cutoff = dateRange === '7' ? now - 7 * day : now - 30 * day;
        orders = orders.filter(o => o.date >= cutoff);
    }

    return orders;
}

function renderStats() {
    const orders = getOrders();
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const aov = validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0;

    document.getElementById('admin-stats').innerHTML = `
        <div class="stat-card">
            <h3>${orders.length}</h3>
            <p>Total Orders</p>
        </div>
        <div class="stat-card">
            <h3>${formatTotal(totalRevenue)}</h3>
            <p>Revenue</p>
        </div>
        <div class="stat-card">
            <h3>${pendingCount}</h3>
            <p>Pending</p>
        </div>
        <div class="stat-card">
            <h3>${formatTotal(aov)}</h3>
            <p>Avg. Order</p>
        </div>
        <div class="stat-card stat-card-actions">
            <button type="button" class="btn btn-outline btn-sm" id="logout-btn">Log out</button>
        </div>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        setAuthenticated(false);
        location.reload();
    });
}

function renderAnalytics() {
    const container = document.getElementById('admin-analytics');
    if (!container) return;

    const orders = getOrders().filter(o => o.status !== 'cancelled');
    const last7Days = [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * day);
        const start = new Date(date).setHours(0, 0, 0, 0);
        const end = start + day;
        const dayOrders = orders.filter(o => o.date >= start && o.date < end);
        const revenue = dayOrders.reduce((s, o) => s + o.total, 0);
        last7Days.push({
            label: date.toLocaleDateString('en', { weekday: 'short' }),
            revenue,
            count: dayOrders.length
        });
    }

    const maxRev = Math.max(...last7Days.map(d => d.revenue), 1);
    container.innerHTML = `
        <h4>Revenue (last 7 days)</h4>
        <div class="chart-bars">
            ${last7Days.map(d => `
                <div class="chart-bar-wrap">
                    <div class="chart-bar" style="height: ${(d.revenue / maxRev) * 100}%" title="${formatTotal(d.revenue)}"></div>
                    <span class="chart-label">${d.label}</span>
                    <span class="chart-value">${formatTotal(d.revenue)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTopProducts() {
    const container = document.getElementById('admin-top-products');
    if (!container) return;

    const orders = getOrders().filter(o => o.status !== 'cancelled');
    const productSales = {};

    orders.forEach(o => {
        (o.items || []).forEach(it => {
            productSales[it.name] = (productSales[it.name] || 0) + it.qty;
        });
    });

    const top = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (top.length === 0) {
        container.innerHTML = '<p class="empty-hint">No sales data yet.</p>';
        return;
    }

    container.innerHTML = `
        <h4>Top Products</h4>
        <ul class="top-products-list">
            ${top.map(([name, qty], i) => `
                <li>
                    <span class="rank">#${i + 1}</span>
                    <span class="name">${escapeHtml(name)}</span>
                    <span class="qty">${qty} sold</span>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderRecentActivity() {
    const container = document.getElementById('admin-activity');
    if (!container) return;

    const orders = getOrders()
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-hint">No recent activity.</p>';
        return;
    }

    container.innerHTML = orders.map(o => {
        const customer = `${o.contact?.firstName || ''} ${o.contact?.lastName || ''}`.trim() || 'Customer';
        const timeAgo = getTimeAgo(o.date);
        return `
            <div class="activity-item">
                <span class="status-badge status-${o.status}">${statusLabels[o.status]}</span>
                <div>
                    <strong>${escapeHtml(o.id)}</strong> — ${escapeHtml(customer)}
                    <span class="activity-meta">${formatTotal(o.total)} · ${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getTimeAgo(ts) {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
    return Math.floor(sec / 86400) + 'd ago';
}

function initCharts() {
    // Chart is now CSS-based in renderAnalytics
}

function initStatusFilter() {
    document.querySelectorAll('.filter-status .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-status .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.dataset.status;
            renderOrders();
        });
    });
}

function initSearch() {
    const input = document.getElementById('orders-search');
    if (!input) return;
    input.addEventListener('input', () => {
        currentSearchQuery = input.value.trim();
        renderOrders();
    });
}

function initDateRange() {
    const select = document.getElementById('date-range');
    if (!select) return;
    select.addEventListener('change', () => {
        currentDateRange = select.value;
        renderOrders();
    });
}

function initExport() {
    document.getElementById('export-csv')?.addEventListener('click', () => {
        const orders = getFilteredOrders(currentStatusFilter, currentSearchQuery, currentDateRange);
        const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Total', 'Status'];
        const rows = orders.map(o => [
            o.id,
            formatDate(o.date),
            `${o.contact?.firstName || ''} ${o.contact?.lastName || ''}`.trim(),
            o.contact?.email || '',
            o.total,
            o.status
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `nexus-orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
}

function initLoadDemo() {
    document.getElementById('load-demo')?.addEventListener('click', () => {
        const demo = generateDemoOrders();
        saveOrders(demo);
        localStorage.setItem(SEED_FLAG_KEY, '1');
        renderStats();
        renderAnalytics();
        renderTopProducts();
        renderRecentActivity();
        renderOrders();
    });
}

function initRefresh() {
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        renderStats();
        renderAnalytics();
        renderTopProducts();
        renderRecentActivity();
        renderOrders();
    });
}

function renderOrders() {
    const orders = getFilteredOrders(currentStatusFilter, currentSearchQuery, currentDateRange);
    const tbody = document.getElementById('orders-tbody');
    const noOrders = document.getElementById('no-orders');

    if (orders.length === 0) {
        tbody.innerHTML = '';
        noOrders.style.display = 'block';
        noOrders.textContent = currentSearchQuery || currentDateRange !== 'all'
            ? 'No orders match your filters.'
            : 'No orders yet. Place orders from the store or load demo data.';
        return;
    }
    noOrders.style.display = 'none';

    tbody.innerHTML = orders.map(order => {
        const itemsSummary = order.items?.map(i => `${i.name} × ${i.qty}`).join(', ') || '-';
        const shortItems = itemsSummary.length > 40 ? itemsSummary.slice(0, 37) + '...' : itemsSummary;
        const customer = `${order.contact?.firstName || ''} ${order.contact?.lastName || ''}`.trim() || order.contact?.email || '-';
        const nextStatuses = statusFlow[order.status] || [];

        return `
            <tr data-order-id="${order.id}">
                <td><strong>${order.id}</strong></td>
                <td>${formatDate(order.date)}</td>
                <td>${customer}</td>
                <td title="${escapeHtml(itemsSummary)}">${escapeHtml(shortItems)}</td>
                <td>${formatTotal(order.total)}</td>
                <td><span class="status-badge status-${order.status}">${statusLabels[order.status] || order.status}</span></td>
                <td>
                    <div class="order-actions">
                        <button type="button" class="btn-view" data-id="${order.id}">View</button>
                        ${nextStatuses.length ? `
                            <select class="status-select" data-id="${order.id}">
                                <option value="">Update</option>
                                ${nextStatuses.map(s => `<option value="${s}">→ ${statusLabels[s]}</option>`).join('')}
                            </select>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => openOrderDetail(btn.dataset.id));
    });
    tbody.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                updateOrderStatus(sel.dataset.id, val);
                sel.value = '';
                renderOrders();
                renderStats();
                renderAnalytics();
                renderTopProducts();
                renderRecentActivity();
            }
        });
    });
}

function escapeHtml(s) {
    if (!s) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveOrders(orders);
    }
}

function addOrderNote(orderId, note) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.notes = Array.isArray(order.notes) ? order.notes : (order.notes ? [order.notes] : []);
        order.notes.push(note);
        saveOrders(orders);
    }
}

function openOrderDetail(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const notes = Array.isArray(order.notes) ? order.notes : (order.notes ? [order.notes] : []);

    document.getElementById('order-detail-id').textContent = order.id;
    document.getElementById('order-detail-body').innerHTML = `
        <div class="order-detail-grid">
            <div class="order-detail-section">
                <h4>Contact</h4>
                <p><strong>${escapeHtml(order.contact?.firstName)} ${escapeHtml(order.contact?.lastName)}</strong></p>
                <p>${escapeHtml(order.contact?.email)}</p>
                <p>${escapeHtml(order.contact?.phone) || '-'}</p>
            </div>
            <div class="order-detail-section">
                <h4>Shipping</h4>
                <p>${escapeHtml(order.shipping?.address)}</p>
                <p>${escapeHtml(order.shipping?.city)}, ${escapeHtml(order.shipping?.postalCode)}</p>
                <p>${escapeHtml(order.shipping?.country)}</p>
            </div>
        </div>
        <div class="order-detail-section">
            <h4>Items</h4>
            <ul class="order-items-list">
                ${(order.items || []).map(i => `
                    <li>
                        <span>${escapeHtml(i.name)} × ${i.qty}</span>
                        <span>${formatTotal(i.price * i.qty)}</span>
                    </li>
                `).join('')}
            </ul>
            <p class="order-total"><strong>Total: ${formatTotal(order.total)}</strong></p>
        </div>
        <div class="order-detail-section">
            <h4>Status</h4>
            <p><span class="status-badge status-${order.status}">${statusLabels[order.status] || order.status}</span></p>
            ${(statusFlow[order.status] || []).length ? `
                <div class="status-update-btns">
                    ${(statusFlow[order.status] || []).map(s => `
                        <button type="button" class="btn btn-outline btn-sm status-update-btn" data-status="${s}">→ ${statusLabels[s]}</button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        <div class="order-detail-section">
            <h4>Notes</h4>
            <div class="order-notes-list">
                ${notes.length ? notes.map(n => `<p class="order-note">${escapeHtml(n)}</p>`).join('') : '<p class="empty-hint">No notes.</p>'}
            </div>
            <div class="order-note-form">
                <input type="text" id="order-note-input" placeholder="Add internal note..." class="note-input">
                <button type="button" class="btn btn-primary btn-sm" id="add-note-btn">Add</button>
            </div>
        </div>
    `;

    document.getElementById('order-detail-modal').classList.add('is-open');
    document.body.style.overflow = 'hidden';

    document.getElementById('order-detail-body').querySelectorAll('.status-update-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateOrderStatus(order.id, btn.dataset.status);
            openOrderDetail(order.id);
            renderOrders();
            renderStats();
            renderAnalytics();
            renderTopProducts();
            renderRecentActivity();
        });
    });

    document.getElementById('add-note-btn')?.addEventListener('click', () => {
        const input = document.getElementById('order-note-input');
        const text = input?.value?.trim();
        if (text) {
            addOrderNote(order.id, text);
            input.value = '';
            openOrderDetail(order.id);
        }
    });
    document.getElementById('order-note-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('add-note-btn')?.click();
    });
}

function initOrderDetail() {
    const modal = document.getElementById('order-detail-modal');
    document.getElementById('order-modal-close').addEventListener('click', closeOrderDetail);
    document.getElementById('order-modal-backdrop').addEventListener('click', closeOrderDetail);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeOrderDetail();
    });
}

function closeOrderDetail() {
    document.getElementById('order-detail-modal').classList.remove('is-open');
    document.body.style.overflow = '';
}
