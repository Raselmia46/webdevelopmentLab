const fs = require('fs');

const appJsPath = "c:\\Users\\cZ\\Desktop\\cpn\\ecommerce\\js\\app.js";
let content = fs.readFileSync(appJsPath, "utf-8");

content = content.replace(
`function renderAdminOrders() {
  const container = document.getElementById('admin-orders-table');
  if(!container) return;
  const orders = getOrders().reverse();`,
`async function renderAdminOrders() {
  const container = document.getElementById('admin-orders-table');
  if(!container) return;
  const response = await fetch('http://localhost:3000/api/orders');
  const orders = await response.json();`
);

content = content.replace(
`function renderAdminProducts() {
  const container = document.getElementById('admin-products-table');
  if(!container) return;
  const products = cachedProducts;`,
`async function renderAdminProducts() {
  const container = document.getElementById('admin-products-table');
  if(!container) return;
  if(cachedProducts.length === 0) await fetchProductsFromDB();
  const products = cachedProducts;`
);

content = content.replace(
`function deleteProduct(id) {
  if(!confirm("Permenantly remove this product from the master database?")) return;
  let products = cachedProducts;
  products = products.filter(p => p.id !== id);
  setProducts(products);
  renderAdminProducts();
  showToast('Product deleted', 'warning');
}`,
`// Admin Delete
async function deleteProduct(id) {
  if(!confirm("Permanently remove this product from the master database?")) return;
  // Stub for now. Assuming fetch('/api/products/:id', {method: 'DELETE'})
  showToast('Product deletion not yet implemented in API', 'warning');
}`
);

fs.writeFileSync(appJsPath, content, "utf-8");
console.log("Admin routines refactored!");
