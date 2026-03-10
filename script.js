/**
 * Nexus Gaming — Gaming Electronics E-Commerce
 * Full cart, checkout, search, filter, product modal
 */

const CURRENCY = '$';

const PRODUCTS = [
    { id: 1, name: 'Pro X Mechanical Keyboard', price: 149, category: 'keyboards', categoryLabel: 'Keyboards', desc: 'Full RGB mechanical keyboard with Cherry MX switches. Programmable keys, aluminum frame. Built for esports.', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600', badge: 'Best Seller', options: { switch: ['Linear', 'Tactile', 'Clicky'] } },
    { id: 2, name: 'Ultra Light Gaming Mouse', price: 89, category: 'mice', categoryLabel: 'Mice', desc: '49g wireless gaming mouse. 25K DPI sensor, 70hr battery. Perfect for competitive FPS.', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', options: { color: ['Black', 'White', 'Pink'] } },
    { id: 3, name: 'Immersive 7.1 Headset', price: 129, category: 'headsets', categoryLabel: 'Headsets', desc: 'Wireless gaming headset with 7.1 surround, 50mm drivers. Noise-canceling mic. 30hr battery.', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600', badge: 'New' },
    { id: 4, name: '27" 240Hz Gaming Monitor', price: 399, category: 'monitors', categoryLabel: 'Monitors', desc: '1ms response, 240Hz refresh. HDR400, G-Sync compatible. IPS panel for vivid colors.', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600' },
    { id: 5, name: 'Pro Racing Chair', price: 349, category: 'chairs', categoryLabel: 'Chairs', desc: 'Ergonomic gaming chair. 4D armrests, lumbar support, recline 155°. Premium leather.', image: 'https://images.unsplash.com/photo-1580480054693-897d289e7ca3?w=600' },
    { id: 6, name: 'RGB Mouse Pad XL', price: 35, category: 'peripherals', categoryLabel: 'Peripherals', desc: 'Extended RGB mouse pad. 900x400mm. 16.8M colors, multiple lighting modes.', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=600' },
    { id: 7, name: 'Stream Webcam 1080p', price: 99, category: 'peripherals', categoryLabel: 'Peripherals', desc: '60fps 1080p streaming webcam. Auto-focus, built-in ring light. Mount included.', image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600' },
    { id: 8, name: 'Wired Pro Controller', price: 59, category: 'peripherals', categoryLabel: 'Peripherals', desc: 'Pro-grade wired controller. Hall-effect sticks, programmable back buttons.', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600' },
    { id: 9, name: 'TKL RGB Keyboard', price: 119, category: 'keyboards', categoryLabel: 'Keyboards', desc: 'Tenkeyless mechanical. Hot-swap sockets, PBT keycaps. Compact for maximum desk space.', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600', options: { color: ['Black', 'White'] } },
    { id: 10, name: 'Wireless Gaming Headset', price: 159, category: 'headsets', categoryLabel: 'Headsets', desc: 'Premium wireless. 40hr battery, low-latency 2.4GHz. Memory foam ear cushions.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
    { id: 11, name: '32" Curved Gaming Monitor', price: 449, category: 'monitors', categoryLabel: 'Monitors', desc: '32" 165Hz curved VA. 1ms MPRT, FreeSync. 1500R curvature for immersion.', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600' },
    { id: 12, name: 'Desk Mount Monitor Arm', price: 79, category: 'peripherals', categoryLabel: 'Peripherals', desc: 'Dual monitor arm. Gas spring, full motion. Supports up to 34" per monitor.', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600' }
];

let cart = JSON.parse(localStorage.getItem('nexus-cart') || '[]');
let currentFilter = 'all';
let searchQuery = '';
let currentSort = 'featured';

const productGrid = document.getElementById('product-grid');
const filterButtons = document.getElementById('filter-buttons');
const productCount = document.getElementById('product-count');
const noResults = document.getElementById('no-results');
const sortSelect = document.getElementById('sort-select');
const clearFiltersBtn = document.getElementById('clear-filters');
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const productModal = document.getElementById('product-modal');
const productModalBody = document.getElementById('product-modal-body');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartSubtotal = document.getElementById('cart-subtotal');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const checkoutOrderSummary = document.getElementById('checkout-order-summary');
const confirmationModal = document.getElementById('confirmation-modal');
const orderNumberEl = document.getElementById('order-number');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    renderProducts();
    initFilterButtons();
    initHeroCards();
    initCategoryCards();
    initSorting();
    initClearFilters();
    initSearch();
    initProductModal();
    initCart();
    initCheckout();
    initConfirmation();
    initMobileMenu();
    initNewsletter();
    initRevealAnimation();
    initSmoothScroll();
});

function getFilteredProducts() {
    return PRODUCTS.filter(p => {
        const matchFilter = currentFilter === 'all' || p.category === currentFilter;
        const matchSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            p.categoryLabel.toLowerCase().includes(searchQuery) ||
            p.desc.toLowerCase().includes(searchQuery);
        return matchFilter && matchSearch;
    });
}

function renderProducts() {
    const products = getSortedProducts(getFilteredProducts());
    productCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    noResults.style.display = products.length ? 'none' : 'block';

    productGrid.innerHTML = products.map(p => `
        <article class="product-card" data-product-id="${p.id}" data-category="${p.category}">
            <div class="product-image">
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
                <button class="product-quick-view" aria-label="View ${p.name}">Quick View</button>
            </div>
            <div class="product-info">
                <p class="product-category">${p.categoryLabel}</p>
                <h3>${p.name}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="product-footer">
                    <span class="price">${CURRENCY}${p.price}</span>
                    <button class="btn-add" data-product-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `).join('');

    productGrid.querySelectorAll('.product-card').forEach(card => {
        const id = parseInt(card.dataset.productId);
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add')) return;
            openProductModal(id);
        });
        card.querySelector('.btn-add')?.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(id, 1);
            showAddedFeedback(card.querySelector('.btn-add'));
        });
    });
}

function getSortedProducts(products) {
    const sorted = [...products];
    if (currentSort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (currentSort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (currentSort === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
}

function initFilterButtons() {
    filterButtons?.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterButtons.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProducts();
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    });
}

function initSorting() {
    sortSelect?.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProducts();
    });
}

function initClearFilters() {
    clearFiltersBtn?.addEventListener('click', () => {
        currentFilter = 'all';
        searchQuery = '';
        currentSort = 'featured';
        if (sortSelect) sortSelect.value = 'featured';
        if (searchInput) {
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
        filterButtons?.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        filterButtons?.querySelector('[data-filter="all"]')?.classList.add('active');
        renderProducts();
    });
}

function initHeroCards() {
    const heroCard1 = document.querySelector('.hero-card-1');
    const heroCard2 = document.querySelector('.hero-card-2');
    const heroCard3 = document.querySelector('.hero-card-3');
    const cards = [
        { el: heroCard1, filter: 'keyboards' },
        { el: heroCard2, filter: 'headsets' },
        { el: heroCard3, filter: 'monitors' }
    ];
    cards.forEach(({ el, filter }) => {
        el?.addEventListener('click', () => {
            currentFilter = filter;
            filterButtons?.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const match = filterButtons?.querySelector(`[data-filter="${filter}"]`);
            if (match) {
                match.classList.add('active');
                renderProducts();
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
        el?.setAttribute('role', 'button');
        el?.setAttribute('tabindex', '0');
        el?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });
}

function initCategoryCards() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            currentFilter = card.dataset.category;
            filterButtons?.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const match = filterButtons?.querySelector(`[data-filter="${currentFilter}"]`);
            if (match) match.classList.add('active');
            else {
                filterButtons?.querySelector('[data-filter="all"]')?.classList.add('active');
                currentFilter = 'all';
            }
            renderProducts();
            document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
        });
    });
    document.querySelectorAll('[data-filter-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentFilter = link.dataset.filterLink;
            filterButtons?.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const match = filterButtons?.querySelector(`[data-filter="${currentFilter}"]`);
            if (match) {
                match.classList.add('active');
                renderProducts();
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initSearch() {
    document.getElementById('search-toggle')?.addEventListener('click', () => {
        searchOverlay?.classList.add('is-open');
        searchInput?.focus();
    });
    searchOverlay?.querySelector('.search-close')?.addEventListener('click', () => searchOverlay?.classList.remove('is-open'));
    searchOverlay?.addEventListener('click', (e) => { if (e.target === searchOverlay) searchOverlay?.classList.remove('is-open'); });
    searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProducts();
        if (searchQuery.length >= 2) {
            const matches = PRODUCTS.filter(p =>
                p.name.toLowerCase().includes(searchQuery) ||
                p.categoryLabel.toLowerCase().includes(searchQuery));
            renderSearchResults(matches);
        } else searchResults.innerHTML = '';
    });
    searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Escape') searchOverlay?.classList.remove('is-open'); });
}

function initRevealAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function renderSearchResults(products) {
    searchResults.innerHTML = products.length ? products.slice(0, 6).map(p => `
        <a href="#" class="search-result-item" data-product-id="${p.id}">
            <div class="search-result-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
            <div class="search-result-info">
                <strong>${p.name}</strong>
                <span>${CURRENCY}${p.price} · ${p.categoryLabel}</span>
            </div>
        </a>
    `).join('') : '<p class="search-no-results">No products found</p>';
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openProductModal(parseInt(item.dataset.productId));
            searchOverlay?.classList.remove('is-open');
        });
    });
}

function initProductModal() {
    productModal?.querySelector('.product-modal-close')?.addEventListener('click', closeProductModal);
    productModal?.querySelector('.product-modal-backdrop')?.addEventListener('click', closeProductModal);
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closeProductModal());
}

function openProductModal(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    let optionsHtml = '';
    if (product.options) {
        for (const [key, values] of Object.entries(product.options)) {
            optionsHtml += `
                <div class="product-option">
                    <label>${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <div class="option-buttons">
                        ${values.map(v => `<button type="button" class="option-btn" data-${key}="${v}">${v}</button>`).join('')}
                    </div>
                </div>`;
        }
    }
    productModalBody.innerHTML = `
        <div class="product-modal-grid">
            <div class="product-modal-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">
            </div>
            <div class="product-modal-details">
                <p class="product-category">${product.categoryLabel}</p>
                <h2>${product.name}</h2>
                <p class="product-modal-price">${CURRENCY}${product.price}</p>
                <p class="product-modal-desc">${product.desc}</p>
                ${optionsHtml}
                <div class="product-modal-actions">
                    <div class="quantity-selector">
                        <button type="button" class="qty-btn" data-action="minus">−</button>
                        <input type="number" value="1" min="1" max="99" class="qty-input" id="product-qty">
                        <button type="button" class="qty-btn" data-action="plus">+</button>
                    </div>
                    <button class="btn btn-primary btn-add-product" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    productModalBody.querySelectorAll('.option-buttons').forEach(optionGroup => {
        const btns = optionGroup.querySelectorAll('.option-btn');
        btns[0]?.classList.add('selected');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    });
    const qtyInput = productModalBody.querySelector('#product-qty');
    productModalBody.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let v = parseInt(qtyInput.value) || 1;
            qtyInput.value = btn.dataset.action === 'plus' ? Math.min(99, v + 1) : Math.max(1, v - 1);
        });
    });
    productModalBody.querySelector('.btn-add-product')?.addEventListener('click', () => {
        addToCart(product.id, parseInt(qtyInput?.value) || 1);
        closeProductModal();
        openCart();
    });
    productModal?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal?.classList.remove('is-open');
    document.body.style.overflow = '';
}

function addToCart(productId, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.qty += qty;
    else cart.push({ id: product.id, name: product.name, price: product.price, qty });
    saveCart();
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function updateCartItemQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('nexus-cart', JSON.stringify(cart)); }
function getCartTotal() { return cart.reduce((sum, item) => sum + item.price * item.qty, 0); }
function getCartCount() { return cart.reduce((sum, item) => sum + item.qty, 0); }

function updateCartUI() {
    const count = getCartCount();
    const total = getCartTotal();
    document.querySelector('.cart-count').textContent = count;
    document.querySelector('.cart-count').classList.toggle('has-items', count > 0);
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartItems.innerHTML = '';
        cartFooter.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        cartSubtotal.textContent = CURRENCY + total;
        cartItems.innerHTML = cart.map((item, i) => `
            <div class="cart-item" data-index="${i}">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>${CURRENCY}${item.price} each</span>
                </div>
                <div class="cart-item-qty">
                    <button type="button" class="qty-btn-sm" data-action="minus">−</button>
                    <span>${item.qty}</span>
                    <button type="button" class="qty-btn-sm" data-action="plus">+</button>
                </div>
                <span class="cart-item-total">${CURRENCY}${item.price * item.qty}</span>
                <button class="cart-item-remove" aria-label="Remove">×</button>
            </div>
        `).join('');
        cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.closest('.cart-item').dataset.index)));
        });
        cartItems.querySelectorAll('.qty-btn-sm').forEach(btn => {
            btn.addEventListener('click', () => {
                updateCartItemQty(parseInt(btn.closest('.cart-item').dataset.index), btn.dataset.action === 'plus' ? 1 : -1);
            });
        });
    }
}

function showAddedFeedback(btn) {
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = 'Added!';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('added'); }, 1200);
}

function initCart() {
    document.getElementById('cart-toggle')?.addEventListener('click', openCart);
    document.querySelector('.cart-modal-backdrop')?.addEventListener('click', closeCart);
    document.querySelector('.cart-modal-close')?.addEventListener('click', closeCart);
    updateCartUI();
}

function openCart() { cartModal?.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
function closeCart() { cartModal?.classList.remove('is-open'); document.body.style.overflow = ''; }

function initCheckout() {
    document.getElementById('checkout-btn')?.addEventListener('click', () => { if (cart.length) openCheckout(); });
    document.querySelector('.checkout-modal-close')?.addEventListener('click', closeCheckout);
    document.querySelector('.checkout-modal-backdrop')?.addEventListener('click', closeCheckout);
    checkoutForm?.addEventListener('submit', (e) => { e.preventDefault(); placeOrder(); });
}

function openCheckout() {
    closeCart();
    const total = getCartTotal();
    checkoutOrderSummary.innerHTML = `
        <div class="checkout-items">
            ${cart.map(item => `<div class="checkout-item"><span>${item.name} × ${item.qty}</span><span>${CURRENCY}${item.price * item.qty}</span></div>`).join('')}
        </div>
        <div class="checkout-total"><span>Total</span><strong>${CURRENCY}${total}</strong></div>
    `;
    checkoutModal?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closeCheckout() { checkoutModal?.classList.remove('is-open'); document.body.style.overflow = ''; }

function placeOrder() {
    const orderId = 'NX' + Date.now().toString(36).toUpperCase();
    closeCheckout();
    cart = [];
    saveCart();
    updateCartUI();
    showConfirmation(orderId);
}

function initConfirmation() {
    document.getElementById('confirmation-continue')?.addEventListener('click', () => {
        confirmationModal?.classList.remove('is-open');
        document.body.style.overflow = '';
    });
    document.querySelector('.confirmation-modal-backdrop')?.addEventListener('click', () => {
        confirmationModal?.classList.remove('is-open');
        document.body.style.overflow = '';
    });
}

function showConfirmation(orderId) {
    orderNumberEl.textContent = orderId;
    confirmationModal?.classList.add('is-open');
}

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    menuBtn?.addEventListener('click', () => {
        nav?.classList.toggle('is-open');
        menuBtn?.classList.toggle('is-active');
    });
}

function initNewsletter() {
    document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.querySelector('input[type="email"]');
        const btn = e.target.querySelector('button[type="submit"]');
        if (!input?.value.trim()) return;
        btn.textContent = 'Subscribed!';
        btn.disabled = true;
        input.value = '';
        setTimeout(() => { btn.textContent = 'Subscribe'; btn.disabled = false; }, 2500);
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                document.querySelector('.nav')?.classList.remove('is-open');
            }
        });
    });
}
