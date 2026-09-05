// Real Myntra Frontend Client Application

// Guest Session Identifier
let sessionId = localStorage.getItem('myntra_session_id');
if (!sessionId) {
  sessionId = 'guest_' + Math.random().toString(36).substring(2, 9) + Date.now();
  localStorage.setItem('myntra_session_id', sessionId);
}

// User state
let currentUser = JSON.parse(localStorage.getItem('myntra_user') || 'null');
let userToken = localStorage.getItem('myntra_token') || null;

// Application State
let currentCategory = 'All';
let currentGender = '';
let currentSearch = '';
let selectedBrands = [];
let currentSort = 'default';
let cartItems = [];
let wishlistItems = [];
let activeProduct = null;
let activeSize = null;
let appliedCoupon = null;

// Determine if running inside /pages/ directory
const isPagesDir = window.location.pathname.includes('/pages/');

// Auto-detect portal page on load
document.addEventListener('DOMContentLoaded', () => {
  detectPortalCategory();
  initAutoSlideshow();
  initNavEvents();
  initSearchAutocomplete();
  initAuthEvents();
  fetchBrands();
  loadProducts();
  updateCartBadge();
  updateWishlistBadge();
  checkAuthStatus();
});

function detectPortalCategory() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('mens.html')) {
    currentCategory = 'Men';
    currentGender = 'Men';
  } else if (path.includes('women.html')) {
    currentCategory = 'Women';
    currentGender = 'Women';
  } else if (path.includes('kids.html')) {
    currentCategory = 'Kids';
    currentGender = '';
  } else if (path.includes('home.html')) {
    currentCategory = 'Home';
    currentGender = '';
  } else if (path.includes('beauty.html')) {
    currentCategory = 'Beauty';
    currentGender = '';
  } else if (path.includes('genz.html')) {
    currentCategory = 'GenZ';
    currentGender = '';
  } else if (path.includes('studio.html')) {
    currentCategory = 'All';
    currentGender = '';
  }
}

// Helper for image paths
function resolveImgPath(src) {
  if (!src) return isPagesDir ? '../imgs/Myntra-Logo.png' : 'imgs/Myntra-Logo.png';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  if (isPagesDir) {
    return src.startsWith('../') ? src : '../' + src;
  } else {
    return src.replace(/^(\.\.\/)+/, '');
  }
}

// Auto Rotator for Hero Banner Slideshow
function initAutoSlideshow() {
  const radios = document.querySelectorAll('.slideshow input[type="radio"]');
  if (radios.length === 0) return;
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % radios.length;
    radios[idx].checked = true;
  }, 3500);
}

// Helper for API headers
function getApiHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId
  };
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  return headers;
}

// Show Toast Notification
function showToast(message, type = 'success') {
  let toast = document.getElementById('myntra-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'myntra-toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast toast-${type} show`;
  toast.innerText = message;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3200);
}

// -------------------------------------------------------------
// SEARCH BAR AUTO-COMPLETE & INTERACTIVE SEARCH
// -------------------------------------------------------------
function initSearchAutocomplete() {
  const searchContainer = document.querySelector('.search_bar');
  const searchInput = document.querySelector('.search_input');
  if (!searchContainer || !searchInput) return;

  let dropdown = document.getElementById('search-suggestions-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'search-suggestions-dropdown';
    dropdown.className = 'search-suggestions-dropdown';
    searchContainer.appendChild(dropdown);
  }

  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    currentSearch = query;

    if (!query) {
      dropdown.style.display = 'none';
      loadProducts();
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const results = await res.json();

        if (results && results.length > 0) {
          dropdown.innerHTML = results.slice(0, 6).map(item => `
            <div class="search-suggestion-item" onclick="openProductModal(${item.id}); hideSearchSuggestions();">
              <img src="${resolveImgPath(item.image)}" alt="${item.title}" onerror="this.src='${resolveImgPath('imgs/Myntra-Logo.png')}'">
              <div class="search-suggestion-info">
                <div class="search-suggestion-brand">${item.brand}</div>
                <div class="search-suggestion-title">${item.title}</div>
              </div>
              <div class="search-suggestion-price">Rs. ${item.price}</div>
            </div>
          `).join('');
          dropdown.style.display = 'block';
        } else {
          dropdown.innerHTML = '<div class="search-suggestion-item" style="color:#7e818c; font-size:12px;">No products found</div>';
          dropdown.style.display = 'block';
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      }
      loadProducts();
    }, 250);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      dropdown.style.display = 'none';
      loadProducts();
      const catalogElem = document.getElementById('catalog');
      if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

window.hideSearchSuggestions = function() {
  const dropdown = document.getElementById('search-suggestions-dropdown');
  if (dropdown) dropdown.style.display = 'none';
};

// -------------------------------------------------------------
// NAVIGATION EVENTS
// -------------------------------------------------------------
function initNavEvents() {
  const sortSelect = document.getElementById('sort-selector');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadProducts();
    });
  }
}

window.setCategoryFilter = function(cat, gender) {
  currentCategory = cat;
  currentGender = gender;
  loadProducts();

  const heading = document.querySelector('#catalog .category_heading');
  if (heading) {
    heading.innerText = cat === 'All' ? 'EXPLORE OUR CATALOG' : `${cat.toUpperCase()} COLLECTION`;
  }

  const catalogElem = document.getElementById('catalog');
  if (catalogElem) {
    catalogElem.scrollIntoView({ behavior: 'smooth' });
  }
};

// -------------------------------------------------------------
// BRANDS & PRODUCTS FETCHING
// -------------------------------------------------------------
async function fetchBrands() {
  try {
    const res = await fetch('/api/products/brands');
    const brands = await res.json();
    renderBrandFilters(brands);
  } catch (err) {
    console.error('Failed to fetch brands:', err);
  }
}

function renderBrandFilters(brands) {
  const container = document.getElementById('brand-filter-list');
  if (!container) return;

  container.innerHTML = brands.map(b => `
    <label class="filter-checkbox-label">
      <input type="checkbox" value="${b}" onchange="handleBrandChange(this)"> ${b}
    </label>
  `).join('');
}

window.handleBrandChange = function(cb) {
  if (cb.checked) {
    selectedBrands.push(cb.value);
  } else {
    selectedBrands = selectedBrands.filter(b => b !== cb.value);
  }
  loadProducts();
};

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-spinner">Loading Myntra catalog...</div>';

  const params = new URLSearchParams();
  if (currentCategory && currentCategory !== 'All') params.append('category', currentCategory);
  if (currentGender) params.append('gender', currentGender);
  if (currentSearch) params.append('search', currentSearch);
  if (currentSort) params.append('sort', currentSort);
  selectedBrands.forEach(b => params.append('brand', b));

  try {
    const res = await fetch(`/api/products?${params.toString()}`);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    grid.innerHTML = '<div class="error-msg">Failed to load products from server.</div>';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="no-products">No items found matching your search or filters.</div>';
    return;
  }

  const wishlistedIds = new Set(wishlistItems.map(w => w.id));

  grid.innerHTML = products.map(p => {
    const isWish = wishlistedIds.has(p.id);
    const imgUrl = resolveImgPath(p.image);
    return `
      <div class="product-card" onclick="openProductModal(${p.id})">
        <div class="product-img-wrapper">
          <img src="${imgUrl}" alt="${p.title}" onerror="this.src='${resolveImgPath('imgs/Myntra-Logo.png')}'">
          
          ${p.tag ? `<div class="product-tag-badge">${p.tag}</div>` : ''}

          <button class="card-wishlist-icon ${isWish ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${p.id})">
            <span class="material-symbols-outlined">${isWish ? 'favorite' : 'favorite'}</span>
          </button>

          <div class="rating-badge">
            <span>${p.rating} ★</span> | <span>${p.rating_count}</span>
          </div>
        </div>
        
        <div class="product-meta">
          <h3 class="product-brand">${p.brand}</h3>
          <h4 class="product-title">${p.title}</h4>
          <div class="product-price">
            <span class="selling-price">Rs. ${p.price}</span>
            <span class="mrp">Rs. ${p.mrp}</span>
            <span class="discount">(${p.discount}% OFF)</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// PRODUCT DETAIL MODAL (PDP)
// -------------------------------------------------------------
window.openProductModal = async function(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    activeProduct = await res.json();
    activeSize = activeProduct.sizes ? activeProduct.sizes.split(',')[0] : 'M';

    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-body');
    if (!modal || !content) return;

    const sizesArr = activeProduct.sizes ? activeProduct.sizes.split(',') : ['S','M','L','XL'];

    let specsObj = {};
    try {
      specsObj = JSON.parse(activeProduct.specs || '{}');
    } catch(e) {}

    const imgUrl = resolveImgPath(activeProduct.image);

    content.innerHTML = `
      <div class="pdp-container">
        <div class="pdp-image">
          <img src="${imgUrl}" alt="${activeProduct.title}" onerror="this.src='${resolveImgPath('imgs/Myntra-Logo.png')}'">
        </div>
        <div class="pdp-details">
          <h2 class="pdp-brand">${activeProduct.brand}</h2>
          <h3 class="pdp-title">${activeProduct.title}</h3>
          
          <div class="pdp-rating">
            <span class="star-box">${activeProduct.rating} ★</span>
            <span class="review-count">${activeProduct.rating_count} Ratings & Verified Reviews</span>
          </div>

          <hr class="pdp-divider">

          <div class="pdp-price-box">
            <span class="pdp-selling-price">Rs. ${activeProduct.price}</span>
            <span class="pdp-mrp">MRP <s>Rs. ${activeProduct.mrp}</s></span>
            <span class="pdp-discount">(${activeProduct.discount}% OFF)</span>
            <div class="tax-info">inclusive of all taxes</div>
          </div>

          <div class="pdp-size-section">
            <div class="size-title">SELECT SIZE</div>
            <div class="size-buttons">
              ${sizesArr.map(s => `
                <button class="size-btn ${s === activeSize ? 'selected' : ''}" onclick="selectSize('${s}', this)">${s}</button>
              `).join('')}
            </div>
          </div>

          <div class="pdp-actions">
            <button class="btn-add-bag" onclick="addToBagFromModal()">
              <span class="material-symbols-outlined">shopping_bag</span> ADD TO BAG
            </button>
            <button class="btn-wishlist-pdp" onclick="toggleWishlist(${activeProduct.id})">
              <span class="material-symbols-outlined">favorite</span> WISHLIST
            </button>
          </div>

          <!-- PINCODE CHECKER -->
          <div class="pincode-section">
            <h4>DELIVERY OPTIONS <span class="material-symbols-outlined">local_shipping</span></h4>
            <div class="pincode-input-box">
              <input type="text" id="pincode-input" placeholder="Enter Pincode (e.g. 560001)" maxlength="6">
              <button onclick="checkPincode()">CHECK</button>
            </div>
            <div id="pincode-result"></div>
          </div>

          <div class="pdp-desc-section">
            <h4>PRODUCT DETAILS</h4>
            <p>${activeProduct.description || 'Authentic quality product.'}</p>
            
            ${Object.keys(specsObj).length > 0 ? `
              <h4 style="margin-top: 15px;">SPECIFICATIONS</h4>
              <div class="pdp-specs-grid">
                ${Object.entries(specsObj).map(([k, v]) => `
                  <div class="spec-item">
                    <div class="spec-key">${k}</div>
                    <div class="spec-val">${v}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  } catch (err) {
    showToast('Could not load product details', 'error');
  }
};

window.closeProductModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.style.display = 'none';
};

window.selectSize = function(size, btn) {
  activeSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
};

window.checkPincode = async function() {
  const pin = document.getElementById('pincode-input')?.value.trim();
  const resElem = document.getElementById('pincode-result');
  if (!resElem) return;

  try {
    const res = await fetch(`/api/pincode/check?pincode=${pin}`);
    const data = await res.json();
    if (res.ok) {
      resElem.innerHTML = `
        <div class="pincode-success">
          <p>🚚 Get it by <strong>${data.deliveryDate}</strong></p>
          <p>💵 Cash on Delivery Available</p>
          <p>🔄 ${data.returnPolicy}</p>
        </div>
      `;
    } else {
      resElem.innerHTML = `<div class="pincode-error">${data.message}</div>`;
    }
  } catch (err) {
    resElem.innerHTML = '<div class="pincode-error">Pincode check failed</div>';
  }
};

window.addToBagFromModal = async function() {
  if (!activeProduct || !activeSize) {
    showToast('Please select a size first', 'error');
    return;
  }

  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        product_id: activeProduct.id,
        size: activeSize,
        quantity: 1
      })
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Added to Shopping Bag!');
      closeProductModal();
      updateCartBadge();
    } else {
      showToast(data.error || 'Failed to add to bag', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
};

// -------------------------------------------------------------
// CART / SHOPPING BAG & COUPONS
// -------------------------------------------------------------
async function updateCartBadge() {
  try {
    const res = await fetch('/api/cart', { headers: getApiHeaders() });
    cartItems = await res.json();
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
      badge.innerText = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  } catch (err) {
    console.error('Error loading cart badge:', err);
  }
}

window.openCartModal = async function() {
  await updateCartBadge();
  const modal = document.getElementById('cart-modal');
  const body = document.getElementById('cart-modal-body');
  if (!modal || !body) return;

  if (!cartItems || cartItems.length === 0) {
    body.innerHTML = `
      <div class="empty-bag">
        <span class="material-symbols-outlined big-bag-icon">shopping_bag</span>
        <h3>Hey, it feels so light!</h3>
        <p>There is nothing in your bag. Let's add some items.</p>
        <button class="btn-continue-shopping" onclick="closeCartModal()">ADD ITEMS FROM WISHLIST / CATALOG</button>
      </div>
    `;
  } else {
    let totalMRP = 0;
    let totalSelling = 0;

    cartItems.forEach(item => {
      totalMRP += item.mrp * item.quantity;
      totalSelling += item.price * item.quantity;
    });

    const totalDiscount = totalMRP - totalSelling;
    const convenienceFee = 99;
    const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalAmount = Math.max(totalSelling + convenienceFee - couponDiscount, 0);

    body.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items-list">
          <h4>My Shopping Bag (${cartItems.length} Items)</h4>
          ${cartItems.map(item => `
            <div class="cart-item">
              <img src="${resolveImgPath(item.image)}" alt="${item.title}">
              <div class="cart-item-info">
                <div class="cart-item-brand">${item.brand}</div>
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-meta">
                  Size: <strong>${item.size}</strong> | Qty: 
                  <select onchange="updateCartQty(${item.cart_id}, this.value)">
                    ${[1,2,3,4,5].map(q => `<option value="${q}" ${q === item.quantity ? 'selected' : ''}>${q}</option>`).join('')}
                  </select>
                </div>
                <div class="cart-item-price">
                  <span class="price-val">Rs. ${item.price}</span>
                  <span class="mrp-val">Rs. ${item.mrp}</span>
                </div>
              </div>
              <button class="btn-remove-item" onclick="removeCartItem(${item.cart_id})">✕</button>
            </div>
          `).join('')}
        </div>

        <div class="cart-summary-card">
          <!-- COUPONS SECTION -->
          <div class="coupon-box">
            <h5>COUPONS & OFFERS</h5>
            <div class="coupon-input-group">
              <input type="text" id="coupon-code-input" placeholder="Enter Code (MYNTRA500)" value="${appliedCoupon ? appliedCoupon.code : ''}">
              <button onclick="applyCoupon(${totalSelling})">${appliedCoupon ? 'APPLIED' : 'APPLY'}</button>
            </div>
            ${appliedCoupon ? `<div class="coupon-success-msg">✓ ${appliedCoupon.message}</div>` : ''}
          </div>

          <h4 style="margin-top: 15px;">PRICE DETAILS (${cartItems.length} Items)</h4>
          <div class="summary-row">
            <span>Total MRP</span>
            <span>Rs. ${totalMRP}</span>
          </div>
          <div class="summary-row text-green">
            <span>Discount on MRP</span>
            <span>- Rs. ${totalDiscount}</span>
          </div>
          ${appliedCoupon ? `
            <div class="summary-row text-green">
              <span>Coupon Discount (${appliedCoupon.code})</span>
              <span>- Rs. ${appliedCoupon.discountAmount}</span>
            </div>
          ` : ''}
          <div class="summary-row">
            <span>Convenience Fee</span>
            <span>Rs. ${convenienceFee}</span>
          </div>
          <hr>
          <div class="summary-row total-row">
            <span>Total Amount</span>
            <span>Rs. ${finalAmount}</span>
          </div>

          <div class="shipping-address-form">
            <h5>DELIVERY ADDRESS</h5>
            <input type="text" id="checkout-name" placeholder="Full Name" value="${currentUser ? currentUser.name : ''}">
            <textarea id="checkout-address" placeholder="Delivery Address (House No, Street, City, Pincode)"></textarea>
          </div>

          <button class="btn-place-order" onclick="placeOrder(${couponDiscount})">PLACE ORDER</button>
        </div>
      </div>
    `;
  }

  modal.style.display = 'flex';
};

window.applyCoupon = async function(cartTotal) {
  const code = document.getElementById('coupon-code-input')?.value.trim();
  if (!code) {
    showToast('Please enter a coupon code', 'error');
    return;
  }

  try {
    const res = await fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal })
    });
    const data = await res.json();
    if (res.ok) {
      appliedCoupon = data;
      showToast(data.message);
      openCartModal();
    } else {
      showToast(data.error || 'Coupon invalid', 'error');
    }
  } catch (err) {
    showToast('Failed to apply coupon', 'error');
  }
};

window.closeCartModal = function() {
  const modal = document.getElementById('cart-modal');
  if (modal) modal.style.display = 'none';
};

window.updateCartQty = async function(cartId, newQty) {
  try {
    await fetch(`/api/cart/${cartId}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify({ quantity: parseInt(newQty, 10) })
    });
    openCartModal();
  } catch (err) {
    showToast('Failed to update quantity', 'error');
  }
};

window.removeCartItem = async function(cartId) {
  try {
    await fetch(`/api/cart/${cartId}`, {
      method: 'DELETE',
      headers: getApiHeaders()
    });
    showToast('Item removed');
    openCartModal();
  } catch (err) {
    showToast('Failed to remove item', 'error');
  }
};

window.placeOrder = async function(discountAmount = 0) {
  const name = document.getElementById('checkout-name')?.value.trim();
  const address = document.getElementById('checkout-address')?.value.trim();

  if (!name || !address) {
    showToast('Please enter recipient name & delivery address', 'error');
    return;
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        shipping_name: name,
        shipping_address: address,
        payment_method: 'Cash On Delivery',
        discount_applied: discountAmount
      })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(`🎉 Order Placed Successfully! Order ID: #${data.order_id}`, 'success');
      appliedCoupon = null;
      closeCartModal();
      updateCartBadge();
    } else {
      showToast(data.error || 'Checkout failed', 'error');
    }
  } catch (err) {
    showToast('Checkout network error', 'error');
  }
};

// -------------------------------------------------------------
// WISHLIST MODAL & TOGGLE
// -------------------------------------------------------------
async function updateWishlistBadge() {
  try {
    const res = await fetch('/api/wishlist', { headers: getApiHeaders() });
    wishlistItems = await res.json();
    const count = wishlistItems.length;
    const badge = document.getElementById('wishlist-count-badge');
    if (badge) {
      badge.innerText = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  } catch (err) {
    console.error('Error fetching wishlist badge:', err);
  }
}

window.toggleWishlist = async function(productId) {
  try {
    const res = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    const data = await res.json();
    showToast(data.message);
    await updateWishlistBadge();
    loadProducts();
  } catch (err) {
    showToast('Wishlist operation failed', 'error');
  }
};

window.openWishlistModal = async function() {
  await updateWishlistBadge();
  const modal = document.getElementById('wishlist-modal');
  const body = document.getElementById('wishlist-modal-body');
  if (!modal || !body) return;

  if (!wishlistItems || wishlistItems.length === 0) {
    body.innerHTML = `
      <div class="empty-wishlist">
        <span class="material-symbols-outlined big-heart-icon">favorite</span>
        <h3>YOUR WISHLIST IS EMPTY</h3>
        <p>Save items that you like in your wishlist. Review them anytime and easily move them to the bag.</p>
        <button class="btn-continue-shopping" onclick="closeWishlistModal()">CONTINUE SHOPPING</button>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="wishlist-grid">
        ${wishlistItems.map(item => `
          <div class="wishlist-card">
            <button class="wishlist-remove-btn" onclick="toggleWishlist(${item.id}); openWishlistModal();">✕</button>
            <img src="${resolveImgPath(item.image)}" alt="${item.title}">
            <div class="wishlist-card-details">
              <div class="w-brand">${item.brand}</div>
              <div class="w-title">${item.title}</div>
              <div class="w-price">
                <span>Rs. ${item.price}</span>
                <s>Rs. ${item.mrp}</s>
              </div>
              <button class="btn-move-to-bag" onclick="openProductModal(${item.id}); closeWishlistModal();">
                MOVE TO BAG
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  modal.style.display = 'flex';
};

window.closeWishlistModal = function() {
  const modal = document.getElementById('wishlist-modal');
  if (modal) modal.style.display = 'none';
};

// -------------------------------------------------------------
// USER AUTHENTICATION & INSIDER PROGRAM
// -------------------------------------------------------------
function checkAuthStatus() {
  const profileNameElem = document.getElementById('profile-user-name');
  if (currentUser) {
    if (profileNameElem) profileNameElem.innerText = currentUser.name.split(' ')[0];
  } else {
    if (profileNameElem) profileNameElem.innerText = 'Profile';
  }
}

function initAuthEvents() {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
    });
    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.style.display = 'block';
      formLogin.style.display = 'none';
    });
  }
}

window.toggleAuthModal = function() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  const authContent = document.getElementById('auth-content');
  const userContent = document.getElementById('user-profile-content');

  if (currentUser) {
    authContent.style.display = 'none';
    userContent.style.display = 'block';
    document.getElementById('logged-user-name').innerText = currentUser.name;
    document.getElementById('logged-user-email').innerText = currentUser.email;
  } else {
    authContent.style.display = 'block';
    userContent.style.display = 'none';
  }

  modal.style.display = 'flex';
};

window.closeAuthModal = function() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
};

window.handleLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      userToken = data.token;
      currentUser = data.user;
      localStorage.setItem('myntra_token', userToken);
      localStorage.setItem('myntra_user', JSON.stringify(currentUser));
      showToast(`Welcome back, ${currentUser.name}!`);
      checkAuthStatus();
      closeAuthModal();
      updateCartBadge();
      updateWishlistBadge();
    } else {
      showToast(data.error || 'Login failed', 'error');
    }
  } catch (err) {
    showToast('Network error during login', 'error');
  }
};

window.handleRegister = async function(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      userToken = data.token;
      currentUser = data.user;
      localStorage.setItem('myntra_token', userToken);
      localStorage.setItem('myntra_user', JSON.stringify(currentUser));
      showToast(`Account created! Welcome, ${currentUser.name}!`);
      checkAuthStatus();
      closeAuthModal();
    } else {
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    showToast('Network error during registration', 'error');
  }
};

window.handleLogout = function() {
  currentUser = null;
  userToken = null;
  localStorage.removeItem('myntra_token');
  localStorage.removeItem('myntra_user');
  showToast('Logged out successfully');
  checkAuthStatus();
  closeAuthModal();
  updateCartBadge();
  updateWishlistBadge();
};
