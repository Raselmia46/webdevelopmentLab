const fs = require('fs');

const appJsPath = "c:\\Users\\cZ\\Desktop\\cpn\\ecommerce\\js\\app.js";
let content = fs.readFileSync(appJsPath, "utf-8");

// Remove dangling sortSelect code (lines 182-192 roughly) by replacing the entire render section
// Instead of complex string math, let's inject `renderProductGrid`
content = content.replace(
`  if(sortSelect) {
    if(sortSelect.value.includes('Low')) products.sort((a,b) => a.price - b.price);
    else if(sortSelect.value.includes('High')) products.sort((a,b) => b.price - a.price);
  }
  
  container.innerHTML = '';
  if(products.length === 0) {`,
`function renderProductGrid(products) {
  const container = document.getElementById('product-container');
  if(!container) return;
  container.innerHTML = '';
  if(products.length === 0) {`
);

// We need to replace references to `getProducts()` with `cachedProducts`
content = content.replace(/getProducts\(\)/g, 'cachedProducts');

// Update loadProductDetails
content = content.replace(
`function loadProductDetails(id) {
  const products = cachedProducts;
  const product = products.find(p => p.id === id);`,
`async function loadProductDetails(id) {
  if(cachedProducts.length === 0) await fetchProductsFromDB();
  const products = cachedProducts;
  const product = products.find(p => p.id === parseInt(id));`
);

// Update checkout function to push to /api/orders
content = content.replace(
`function checkout() {
  const cart = getCart();
  if (cart.length === 0) return;
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  const orders = getOrders();
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const newOrder = {
    id: 'ORD-' + Math.floor(Math.random() * 1000000),
    username: user.username,
    date: new Date().toLocaleDateString(),
    items: cart,
    total: total,
    status: 'Processing'
  };
  orders.push(newOrder);
  setOrders(orders);
  setCart([]);
  showToast('Order placed successfully!', 'success');
  setTimeout(() => window.location.href = 'orders.html', 1500);
}`,
`async function checkout() {
  const cart = getCart();
  if (cart.length === 0) return;
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const newOrder = {
    username: user.username,
    date: new Date().toLocaleDateString(),
    items: cart,
    total: total,
    status: 'Processing'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    const data = await response.json();
    if(data.success) {
      setCart([]);
      showToast('Order placed successfully!', 'success');
      setTimeout(() => window.location.href = 'orders.html', 1500);
    }
  } catch(err) {
    showToast('Failed to place order!', 'danger');
  }
}`
);

// Update loadOrders logic to fetch from API
content = content.replace(
`function loadOrders() {
  const container = document.getElementById('orders-container');
  if (!container) return;
  
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const allOrders = getOrders();
  const userOrders = allOrders.filter(o => o.username === user.username);`,
`async function loadOrders() {
  const container = document.getElementById('orders-container');
  if (!container) return;
  
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/orders');
    const allOrders = await response.json();
    const userOrders = allOrders.filter(o => o.username === user.username);`
);

// We need to add the closing brace catch block to loadOrders
content = content.replace(
`    }
  }
}

// ====== Admin Logic ======`,
`    }
  }
  } catch(e) { console.error(e); }
}

// ====== Admin Logic ======`
);

fs.writeFileSync(appJsPath, content, "utf-8");
console.log("Safely refactored app.js via Node proxy!");
