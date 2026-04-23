const mysql = require('mysql2/promise');

const newProducts = [
  { id: Math.floor(Math.random() * 1000000), name: "Wireless Gaming Mouse", price: 79.99, image: "assets/images/premium_computing.png", category: "Computing", rating: 4.8, reviews: 215, badge: "Best Seller" },
  { id: Math.floor(Math.random() * 1000000), name: "Noise Isolation Earbuds", price: 129.00, image: "assets/images/premium_audio.png", category: "Audio", rating: 4.6, reviews: 120, badge: "New" },
  { id: Math.floor(Math.random() * 1000000), name: "Minimalist Leather Wallet", price: 45.00, image: "assets/images/premium_accessories.png", category: "Accessories", rating: 4.9, reviews: 300, badge: "" },
  { id: Math.floor(Math.random() * 1000000), name: "Smart Wi-Fi Security Camera", price: 199.99, image: "assets/images/premium_smarthome.jpg", category: "Smart Home", rating: 4.7, reviews: 154, badge: "Hot" },
  { id: Math.floor(Math.random() * 1000000), name: "Premium Polo Shirt", price: 55.00, image: "assets/images/premium_apparel.png", category: "Apparel", rating: 4.5, reviews: 88, badge: "" },
  { id: Math.floor(Math.random() * 1000000), name: "Professional Video Ring Light", price: 89.50, image: "assets/images/premium_photography.jpg", category: "Photography", rating: 4.8, reviews: 401, badge: "Pro" },
  { id: Math.floor(Math.random() * 1000000), name: "Ergonomic Monitor Stand", price: 49.99, image: "assets/images/premium_office.png", category: "Office", rating: 4.7, reviews: 312, badge: "New" },
  { id: Math.floor(Math.random() * 1000000), name: "Titanium Sports Watch", price: 499.00, image: "assets/images/premium_wearables.png", category: "Wearables", rating: 4.9, reviews: 520, badge: "Premium" },
  { id: Math.floor(Math.random() * 1000000), name: "RGB Mechanical Keyboard", price: 149.99, image: "assets/images/keyboard.jpg", category: "Computing", rating: 4.6, reviews: 198, badge: "" },
  { id: Math.floor(Math.random() * 1000000), name: "Modern Desk Organizer", price: 34.00, image: "assets/images/premium_office.png", category: "Office", rating: 4.5, reviews: 92, badge: "" }
];

async function run() {
  const dbConfig = { host: 'localhost', port: 2773, user: 'root', password: '3631608TNDT5Y', database: 'mbstu_store_db' };
  try {
    const pool = await mysql.createPool(dbConfig);
    console.log("Connected to DB, inserting newly featured products...");
    for(let p of newProducts) {
      await pool.query('INSERT INTO products (id, name, price, image, category, rating, reviews, badge) VALUES (?,?,?,?,?,?,?,?)', 
        [p.id, p.name, p.price, p.image, p.category, p.rating, p.reviews, p.badge]);
      console.log(`Successfully added: ${p.name}`);
    }
    await pool.end();
    console.log("Finished adding automatic products.");
  } catch (err) {
    console.error("DB Error:", err);
  }
}

run();
