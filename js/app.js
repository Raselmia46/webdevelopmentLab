// ====== Global Store State APIs ======
// This replaces localStorage usage for core data
let cachedProducts = [];
let cachedOrders = [];

// Helper functions for Cart & Session
function getCart() { return JSON.parse(localStorage.getItem('ecommerce_cart') || '[]'); }
function setCart(cart) { localStorage.setItem('ecommerce_cart', JSON.stringify(cart)); }

function getWishlist() { return JSON.parse(localStorage.getItem('ecommerce_wishlist') || '[]'); }
function setWishlist(w) { localStorage.setItem('ecommerce_wishlist', JSON.stringify(w)); }

function getCurrentUser() {
  const user = localStorage.getItem('ecommerce_currentUser');
  return user ? JSON.parse(user) : null;
}

// Fetch products from MySQL node backend
async function fetchProductsFromDB() {
  try {
    const res = await fetch('http://localhost:3000/api/products');
    cachedProducts = await res.json();
    return cachedProducts;
  } catch (err) { console.error("Error fetching products:", err); return []; }
}

function getCurrentUser() {
  const user = localStorage.getItem('ecommerce_currentUser');
  return user ? JSON.parse(user) : null;
}

function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if(!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0 show fade-in`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

// ====== Authentication Logic ======
async function login(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('ecommerce_currentUser', JSON.stringify(data.user));
      window.location.href = data.user.role === 'admin' ? 'admin.html' : 'shop.html';
    } else {
      showToast('Invalid credentials!', 'danger');
    }
  } catch (err) { showToast('Database connection failed', 'danger'); }
}

async function register(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  
  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    const data = await response.json();
    if (data.success) {
      showToast('Registration successful! Please login.', 'success');
      toggleAuthMode();
    } else {
      showToast(data.message, 'danger');
    }
  } catch (err) { showToast('Database connection failed', 'danger'); }
}

function logout() {
  localStorage.removeItem('ecommerce_currentUser');
  localStorage.removeItem('ecommerce_cart');
  window.location.href = 'index.html';
}

function toggleAuthMode() {
  const loginForm = document.getElementById('login-form-container');
  const regForm = document.getElementById('register-form-container');
  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
  }
}

// ====== Check Access ======
function checkAccess(requiredRole) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    window.location.href = 'shop.html';
  }
  
  const navUser = document.getElementById('nav-username');
  if(navUser) navUser.textContent = user.username;
  
  const cartBadge = document.getElementById('cart-count');
  if(cartBadge) updateCartBadge();
  
  if(document.querySelector('.search-bar')) {
    document.querySelector('.search-bar').addEventListener('input', () => {
      if (document.getElementById('detailed-product-container')) {
        renderDetailedCategoryProducts(['Computing', 'Audio', 'Wearables', 'Smart Home', 'Photography', 'Apparel', 'Accessories', 'Office']);
      } else {
        renderProducts();
      }
    });
    document.querySelector('.form-select').addEventListener('change', () => {
      if (!document.getElementById('detailed-product-container')) {
        renderProducts();
      }
    });
  }
}

// ====== Shop Logic ======
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let currentProducts = [];

async function renderProducts(page = 1) {
  const container = document.getElementById('product-container');
  if(!container) return;
  // Load products from MySQL if not cached
  if(cachedProducts.length === 0) await fetchProductsFromDB();
  
  let filtered = cachedProducts;
  
  const searchBar = document.querySelector('.search-bar') || document.getElementById('searchBar');
  const sortSelect = document.querySelector('.form-select') || document.getElementById('sortFilter');
  
  if(searchBar && searchBar.value) {
    const q = searchBar.value.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  
  if(sortSelect && sortSelect.value) {
    if(sortSelect.value === 'low') filtered.sort((a,b) => a.price - b.price);
    if(sortSelect.value === 'high') filtered.sort((a,b) => b.price - a.price);
    if(sortSelect.value === 'rating') filtered.sort((a,b) => a.rating - b.rating);
  }
  
  currentProducts = filtered;
  renderProductGrid(currentProducts);
}

function changePage(page) {
  currentPage = page;
  renderProductGrid(currentProducts);
  document.getElementById('catalog').scrollIntoView({behavior: 'smooth'});
}

function generateStars(rating) {
  if(!rating) rating = 4.5;
  let fullStars = Math.floor(rating);
  let halfStar = rating % 1 !== 0;
  let html = '';
  for(let i=0; i<fullStars; i++) html += '<i class="bi bi-star-fill"></i> ';
  if(halfStar) html += '<i class="bi bi-star-half"></i> ';
  return html;
}

function renderProductGrid(products) {
  const container = document.getElementById('product-container');
  if(!container) return;
  container.innerHTML = '';
  if(products.length === 0) {
    container.innerHTML = '<div class="col-12 text-center py-5"><h5 class="text-muted">No products found.</h5></div>';
    if(document.getElementById('pagination-container')) document.getElementById('pagination-container').innerHTML = '';
    return;
  }

  // Pagination Logic
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  if(currentPage > totalPages) currentPage = totalPages;
  if(currentPage < 1) currentPage = 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  paginatedProducts.forEach(p => {
    let badgeClass = p.badge === 'New' ? 'badge-new' : 'badge-hot';
    let badgeHtml = p.badge ? `<div class="product-badge ${badgeClass}">${p.badge}</div>` : '';
    let ratingVal = p.rating || 4.5;
    let reviewsCount = p.reviews || Math.floor(Math.random() * 200) + 10;

    container.innerHTML += `
      <div class="col-md-4 col-lg-3 mb-5">
        <div class="product-card h-100 position-relative hover-lift" style="cursor: pointer;" onclick="event.stopPropagation(); window.location.href='product.html?id=${p.id}';">
          ${badgeHtml}
          <div class="product-img-wrapper">
            <img src="${p.image}" class="product-img" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            <button class="btn btn-primary-custom btn-add-cart" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
          </div>
          <div class="card-body d-flex flex-column">
            <span class="text-muted small mb-1 fw-bold text-uppercase">${p.category}</span>
            <h5 class="card-title text-truncate fw-bold mb-1" title="${p.name}">${p.name}</h5>
            <div class="product-rating">
              ${generateStars(ratingVal)}
              <span class="text-muted small">(${reviewsCount})</span>
            </div>
            <p class="card-text fw-bolder fs-4 text-dark mt-auto">৳${p.price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    `;
  });
  
  // Render Pagination Buttons
  const pagContainer = document.getElementById('pagination-container');
  if(pagContainer) {
    if(totalPages > 1) {
      let html = '<ul class="pagination pagination-lg shadow-sm rounded-pill overflow-hidden">';
      html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><button class="page-link border-0 text-dark fw-bold px-4" onclick="changePage(${currentPage-1})">PREV</button></li>`;
      for(let i=1; i<=totalPages; i++) {
        let active = i === currentPage ? 'active bg-primary text-white' : 'text-dark fw-semibold';
        html += `<li class="page-item"><button class="page-link border-0 ${active} px-4" style="z-index:1;" onclick="changePage(${i})">${i}</button></li>`;
      }
      html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><button class="page-link border-0 text-dark fw-bold px-4" onclick="changePage(${currentPage+1})">NEXT</button></li>`;
      html += '</ul>';
      pagContainer.innerHTML = html;
    } else {
      pagContainer.innerHTML = '';
    }
  }
}

async function renderDetailedCategoryProducts(categories) {
  const container = document.getElementById('detailed-product-container');
  if(!container) return;
  
  if(cachedProducts.length === 0) await fetchProductsFromDB();
  
  let filtered = cachedProducts;
  if (categories && categories.length > 0) {
    filtered = filtered.filter(p => categories.includes(p.category));
  }
  
  const searchBar = document.querySelector('.search-bar');
  if (searchBar && searchBar.value) {
    const q = searchBar.value.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  
  container.innerHTML = '';
  if(filtered.length === 0) {
    container.innerHTML = '<div class="col-12 text-center py-5"><h5 class="text-muted">No products found for this category.</h5></div>';
    return;
  }
  
  filtered.forEach((p, index) => {
    let ratingVal = p.rating || 4.5;
    let reviewsCount = p.reviews || Math.floor(Math.random() * 200) + 10;
    let badgeClass = p.badge === 'New' ? 'badge-new' : (p.badge === 'Hot' ? 'badge-hot' : 'bg-secondary');
    let badgeHtml = p.badge ? `<span class="badge ${badgeClass} position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm">${p.badge}</span>` : '';
    let delay = index * 0.05; // Staggered animation delay

    container.innerHTML += `
      <div class="col-12 mb-5 fade-in" style="animation-delay: ${delay}s;">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden hover-lift" style="background-color: #fff;">
          <div class="row g-0">
            <div class="col-md-5 position-relative" style="background: linear-gradient(145deg, #f8fafc, #f1f5f9); display: flex; align-items: center; justify-content: center; padding: 2rem;">
              ${badgeHtml}
              <img src="${p.image}" class="img-fluid rounded" alt="${p.name}" style="max-height: 320px; object-fit: contain; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.15)); transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            </div>
            <div class="col-md-7">
              <div class="card-body p-4 p-md-5 h-100 d-flex flex-column" style="background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="text-primary fw-bold text-uppercase small tracking-wide" style="letter-spacing: 1.5px;">${p.category}</span>
                  <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="toggleWishlist(${p.id})" style="width: 40px; height: 40px;"><i class="bi bi-heart"></i></button>
                </div>
                
                <h2 class="fw-bolder mb-3" style="letter-spacing: -0.5px;">${p.name}</h2>
                
                <div class="d-flex align-items-center mb-4">
                  <div class="text-warning me-2">${generateStars(ratingVal)}</div>
                  <span class="text-muted fw-semibold small">(${reviewsCount} reviews)</span>
                </div>
                
                <h3 class="fw-bolder text-dark mb-4">৳${p.price.toFixed(2)}</h3>
                
                <p class="text-muted fw-semibold mb-4 flex-grow-1" style="line-height: 1.7;">
                  Experience unparalleled quality and design with this premium product. Engineered for maximum performance and crafted with aesthetically pleasing materials, it sits at the pinnacle of modern innovation. Perfect for both professionals and enthusiasts looking to upgrade their lifestyle.
                </p>
                
                <div class="mt-auto d-flex gap-3">
                  <button class="btn btn-primary-custom flex-grow-1 py-3 shadow-sm fw-bold" onclick="addToCart(${p.id})"><i class="bi bi-bag-plus me-2"></i> Add to Cart</button>
                  <a href="product.html?id=${p.id}" class="btn btn-light border py-3 px-4 shadow-sm fw-bold">View full specs</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// ====== Profile & Wishlist Logic ======
function saveProfile(e) {
  e.preventDefault();
  const current = getCurrentUser();
  const email = document.getElementById('setting-email').value;
  const address = document.getElementById('setting-address').value;
  const pw = document.getElementById('setting-password').value;
  
  let users = getUsers();
  let uIndex = users.findIndex(u => u.username === current.username);
  
  if(uIndex > -1) {
    users[uIndex].email = email;
    users[uIndex].address = address;
    if(pw) users[uIndex].password = pw;
    
    setUsers(users);
    current.email = email;
    current.address = address;
    if(pw) current.password = pw;
    localStorage.setItem('ecommerce_currentUser', JSON.stringify(current));
    showToast('Profile updated successfully!', 'success');
  }
}

function toggleWishlist(id) {
  let w = getWishlist();
  if(w.includes(id)) {
    w = w.filter(item => item !== id);
    showToast('Removed from wishlist');
  } else {
    w.push(id);
    showToast('Added to wishlist', 'success');
  }
  setWishlist(w);
  if(document.getElementById('wishlist-container')) renderWishlist();
}

function renderWishlist() {
  const container = document.getElementById('wishlist-container');
  if(!container) return;
  const w = getWishlist();
  const products = cachedProducts;
  container.innerHTML = '';
  
  if(w.length === 0) {
    container.innerHTML = '<div class="col-12 py-4 text-center"><i class="bi bi-heart text-muted fs-1 d-block mb-3"></i><h6 class="text-muted">Your wishlist is empty.</h6></div>';
    return;
  }
  
  w.forEach(id => {
    const p = products.find(prod => prod.id === id);
    if(p) {
      container.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4 mb-3">
          <div class="border rounded-4 p-3 d-flex align-items-center shadow-sm bg-white position-relative hover-lift">
            <button class="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-2 rounded-circle" onclick="toggleWishlist(${p.id})"><i class="bi bi-x-lg"></i></button>
            <img src="${p.image}" class="rounded-3 me-3" style="width: 70px; height: 70px; object-fit: cover;">
            <div>
              <h6 class="fw-bold mb-1 text-truncate" style="max-width: 140px;">${p.name}</h6>
              <div class="fw-bolder text-dark mb-2">৳${p.price.toFixed(2)}</div>
              <button class="btn btn-sm btn-outline-primary fw-bold" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
    }
  });
}

async function loadProductDetails(id) {
  if (cachedProducts.length === 0) await fetchProductsFromDB();
  const products = cachedProducts;
  const p = products.find(prod => prod.id === id);
  if(!p) {
    document.getElementById('pdp-name').textContent = "Product Not Found";
    return;
  }
  
  document.getElementById('pdp-image').src = p.image;
  document.getElementById('pdp-name').textContent = p.name;
  document.getElementById('pdp-price').textContent = p.price.toFixed(2);
  document.getElementById('pdp-category').textContent = p.category;
  document.getElementById('breadcrumb-category').textContent = p.category;
  document.getElementById('pdp-reviews').textContent = '(' + (p.reviews || 84) + ' reviews)';
  document.getElementById('pdp-rating').innerHTML = generateStars(p.rating || 4.5);
  
  if(p.badge) {
    let cl = p.badge === 'New' ? 'bg-success' : 'bg-danger';
    document.getElementById('pdp-badge').innerHTML = `<span class="position-absolute top-0 start-0 m-4 badge ${cl} px-3 py-2 fs-6 shadow-sm rounded-pill">${p.badge}</span>`;
  }
  
  document.getElementById('pdp-add-cart-btn').onclick = () => addToCart(id);
  updateWishlistBtnUI();
}

function addToCart(productId) {
  const products = cachedProducts;
  const product = products.find(p => p.id === productId);
  if(!product) return;
  
  const cart = getCart();
  const existing = cart.find(c => c.product.id === productId);
  if(existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product: product, quantity: 1 });
  }
  setCart(cart);
  updateCartBadge();
  showToast(`<i class="bi bi-check-circle-fill"></i> ${product.name} added to cart!`);
}

function updateCartBadge() {
  const cartCount = document.getElementById('cart-count');
  if(cartCount) {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  }
}

// ====== Cart Logic ======
function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-container');
  const totalEl = document.getElementById('cart-total');
  if(!container) return;
  
  container.innerHTML = '';
  let total = 0;
  
  if(cart.length === 0) {
    container.innerHTML = '<tr><td colspan="5" class="text-center py-5"><i class="bi bi-cart-x fs-1 text-muted d-block mb-3"></i><h5>Your cart is empty.</h5><a href="shop.html" class="btn btn-primary-custom mt-2">Start Shopping</a></td></tr>';
    totalEl.textContent = '0.00';
    return;
  }
  
  cart.forEach((item, index) => {
    let subtotal = item.product.price * item.quantity;
    total += subtotal;
    container.innerHTML += `
      <tr>
        <td class="py-3">
          <div class="d-flex align-items-center">
            <img src="${item.product.image}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <span class="fw-bold">${item.product.name}</span>
          </div>
        </td>
        <td class="py-3 align-middle text-muted fw-semibold">৳${item.product.price.toFixed(2)}</td>
        <td class="py-3 align-middle">
          <div class="input-group" style="width: 120px;">
            <button class="btn btn-outline-secondary" onclick="changeQuantity(${index}, -1)">-</button>
            <input type="text" class="form-control text-center fw-bold bg-white" value="${item.quantity}" readonly>
            <button class="btn btn-outline-secondary" onclick="changeQuantity(${index}, 1)">+</button>
          </div>
        </td>
        <td class="py-3 align-middle fw-bold text-dark">৳${subtotal.toFixed(2)}</td>
        <td class="py-3 align-middle"><button class="btn btn-light text-danger rounded-circle" style="width:40px;height:40px;" onclick="removeFromCart(${index})"><i class="bi bi-trash fs-5"></i></button></td>
      </tr>
    `;
  });
  
  totalEl.textContent = total.toFixed(2);
}

function changeQuantity(index, delta) {
  const cart = getCart();
  cart[index].quantity += delta;
  if(cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  setCart(cart);
  renderCart();
  updateCartBadge();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
  updateCartBadge();
  showToast('Item removed from cart');
}

async function checkout() {
  const cart = getCart();
  if(cart.length === 0) {
    showToast('Cart is empty', 'danger');
    return;
  }
  
  const user = getCurrentUser();
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const newOrder = {
    id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    username: user.username,
    date: new Date().toLocaleDateString(),
    items: cart,
    total: total
  };
  
  try {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    const data = await res.json();
    if(data.success) {
      setCart([]);
      showToast('Order Placed Successfully!', 'success');
      setTimeout(() => window.location.href = 'orders.html', 1800);
    }
  } catch(e) {
    showToast('Database error. Could not place order.', 'danger');
  }
}

// ====== Orders Logic ======
async function renderUserOrders() {
  const container = document.getElementById('orders-container');
  if(!container) return;
  
  const user = getCurrentUser();
  try {
    const res = await fetch('http://localhost:3000/api/orders');
    const allOrders = await res.json();
    const myOrders = allOrders.filter(o => o.username === user.username);
    
    if(myOrders.length === 0) {
      container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-box-seam fs-1 text-muted d-block mb-3"></i>
        <h5>No orders found</h5>
        <p class="text-muted">You haven't placed any orders yet. Let's fix that!</p>
        <a href="shop.html" class="btn btn-primary-custom mt-2">Start Shopping</a>
      </div>`;
      return;
    }
    
    container.innerHTML = '';
    myOrders.forEach(o => {
      const itemsHtml = o.items.map(i => `
        <div class="d-flex align-items-center mb-2">
          <img src="${i.product.image}" style="width:40px;height:40px;border-radius:5px;object-fit:cover;" class="me-3">
          <span class="flex-grow-1">${i.product.name}</span>
          <span class="text-muted mx-3">x${i.quantity}</span>
          <span class="fw-bold">৳${(i.product.price * i.quantity).toFixed(2)}</span>
        </div>
      `).join('');
      
      container.innerHTML += `
        <div class="card mb-4 shadow-sm border-0 fade-in" style="border-radius: 16px; overflow: hidden;">
          <div class="card-header bg-light d-flex justify-content-between align-items-center py-3 border-0">
            <h6 class="mb-0 text-dark fw-bold"><i class="bi bi-receipt me-2 text-primary"></i> ${o.id}</h6>
            <span class="badge bg-success">Delivered</span>
          </div>
          <div class="card-body">
            <div class="mb-3">${itemsHtml}</div>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted small">Placed on ${o.date}</span>
              <div class="fw-bolder fs-5">Total: <span class="text-dark">৳${o.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      `;
    });
  } catch(e) {
    container.innerHTML = '<div class="text-center text-danger">Error loading orders</div>';
  }
}

// ====== Admin Logic ======
function addProduct(e) {
  e.preventDefault();
  const name = document.getElementById('prod-name').value;
  const price = parseFloat(document.getElementById('prod-price').value);
  const category = document.getElementById('prod-category').value;
  const imageInput = document.getElementById('prod-image');
  
  let processProduct = (imageSrc) => {
    const products = cachedProducts;
    const newProduct = {
      id: Math.floor(Date.now() / 1000), // UNIX timestamp fits within MySQL INT max value
      name,
      price,
      category,
      badge: "New",
      rating: 5.0,
      reviews: 0,
      image: imageSrc || 'assets/images/product1.jpg'
    };
    
    fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).then(res => res.json()).then(async data => {
      if(data.success) {
        showToast('Product added to inventory globally!', 'success');
        document.getElementById('add-product-form').reset();
        await fetchProductsFromDB();
        renderAdminProducts();
      } else {
        showToast('Error adding product', 'danger');
      }
    }).catch(() => showToast('Network error', 'danger'));
  };

  if (imageInput.files && imageInput.files[0]) {
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.onload = function(evt) {
      processProduct(evt.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    processProduct('');
  }
}

async function renderAdminProducts() {
  const container = document.getElementById('admin-products-table');
  if(!container) return;
  if(cachedProducts.length === 0) await fetchProductsFromDB();
  const products = cachedProducts;
  container.innerHTML = '';
  products.forEach((p) => {
    container.innerHTML += `
      <tr>
        <td class="text-muted small">#${p.id.toString().slice(-5)}</td>
        <td class="fw-bold">
          <img src="${p.image}" alt="" style="width:40px; height:40px; object-fit:cover; border-radius:8px; margin-right: 10px;"> 
          ${p.name}
        </td>
        <td class="fw-semibold">৳${p.price.toFixed(2)}</td>
        <td><span class="badge bg-light text-dark border">${p.category}</span></td>
        <td>
          <button class="btn btn-sm btn-light text-danger rounded-circle" onclick="deleteProduct(${p.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
  });
}

// Admin Delete
async function deleteProduct(id) {
  if(!confirm("Permanently remove this product from the master database?")) return;
  try {
    const res = await fetch('http://localhost:3000/api/products/' + id, { method: 'DELETE' });
    const data = await res.json();
    if(data.success) {
      showToast('Product deleted', 'success');
      await fetchProductsFromDB();
      renderAdminProducts();
    }
  } catch (err) {
    showToast('Error deleting product', 'danger');
  }
}

async function renderAdminOrders() {
  const container = document.getElementById('admin-orders-table');
  if(!container) return;
  const response = await fetch('http://localhost:3000/api/orders');
  const orders = await response.json();
  container.innerHTML = '';
  if(orders.length === 0) {
    container.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No orders found.</td></tr>';
    return;
  }
  window.adminOrdersData = orders;
  orders.forEach((o, index) => {
    container.innerHTML += `
      <tr>
        <td class="fw-bold">${o.id}</td>
        <td><i class="bi bi-person-circle text-primary me-2"></i> ${o.username}</td>
        <td>${o.date}</td>
        <td><span class="badge bg-success">Confirmed</span></td>
        <td class="fw-bolder">৳${o.total.toFixed(2)}</td>
        <td><button class="btn btn-sm btn-outline-primary fw-bold" onclick="viewOrderDetails(${index})">View Items</button></td>
      </tr>
    `;
  });
}

function viewOrderDetails(index) {
  const o = window.adminOrdersData[index];
  const modalBody = document.getElementById('order-details-body');
  if (!modalBody) return;
  
  let itemsHtml = (o.items || []).map(i => `
    <div class="d-flex align-items-center mb-3">
      <img src="${i.product.image}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;" class="me-3 shadow-sm">
      <div class="flex-grow-1">
        <h6 class="mb-0 fw-bold">${i.product.name}</h6>
        <small class="text-muted">${i.product.category} | x${i.quantity}</small>
      </div>
      <div class="fw-bolder">৳${(i.product.price * i.quantity).toFixed(2)}</div>
    </div>
  `).join('');
  
  modalBody.innerHTML = `
    <div class="mb-4">
      <div class="d-flex justify-content-between mb-2"><span class="text-muted">Invoice:</span> <span class="fw-bold">${o.id}</span></div>
      <div class="d-flex justify-content-between mb-2"><span class="text-muted">Customer:</span> <span class="fw-bold">${o.username}</span></div>
      <div class="d-flex justify-content-between mb-2"><span class="text-muted">Date:</span> <span>${o.date}</span></div>
    </div>
    <h6 class="fw-bolder mb-3 border-bottom pb-2">Purchased Items</h6>
    <div>${itemsHtml}</div>
    <div class="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
      <span class="fw-bold text-muted">Grand Total:</span>
      <span class="fw-bolder fs-5 text-dark">৳${o.total.toFixed(2)}</span>
    </div>
  `;
  
  const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
  modal.show();
}
