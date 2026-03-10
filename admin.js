/**
 * Nexus Gaming — Admin Dashboard
 * Manages buy requests / orders from localStorage
 */

const ORDERS_KEY = 'nexus-orders';
const ADMIN_KEY = 'nexus-admin';
const CURRENCY = '$';

// Demo credentials (client-side only – use proper auth in production)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'nexus123';

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

document.addEventListener('DOMContentLoaded', () => {
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
    renderOrders();
    initStatusFilter();
    initOrderDetail();
}

function getFilteredOrders(statusFilter) {
    const orders = getOrders();
    if (statusFilter === 'all') return orders;
    return orders.filter(o => o.status === statusFilter);
}

function renderStats() {
    const orders = getOrders();
    const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;

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
            <button type="button" class="btn btn-outline btn-sm" id="logout-btn">Log out</button>
        </div>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        setAuthenticated(false);
        location.reload();
    });
}

function initStatusFilter() {
    document.querySelectorAll('.filter-status .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-status .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderOrders(btn.dataset.status);
        });
    });
}

function renderOrders(statusFilter = 'all') {
    const orders = getFilteredOrders(statusFilter);
    const tbody = document.getElementById('orders-tbody');
    const noOrders = document.getElementById('no-orders');

    if (orders.length === 0) {
        tbody.innerHTML = '';
        noOrders.style.display = 'block';
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
                                <option value="">Update status</option>
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
                renderOrders(statusFilter);
                renderStats();
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

function openOrderDetail(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

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
    `;

    document.getElementById('order-detail-modal').classList.add('is-open');
    document.body.style.overflow = 'hidden';

    document.getElementById('order-detail-body').querySelectorAll('.status-update-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateOrderStatus(order.id, btn.dataset.status);
            openOrderDetail(order.id);
            renderOrders();
            renderStats();
        });
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
