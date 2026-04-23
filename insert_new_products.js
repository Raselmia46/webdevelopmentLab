const mysql = require('mysql2/promise');

const newProducts = [
  { id: 25, name: "Luxury Mechanical Watch", price: 299.99, image: "assets/images/watch.jpg", category: "Accessories", rating: 4.8, reviews: 154, badge: "Premium" },
  { id: 26, name: "Classic Evening Dress", price: 149.99, image: "assets/images/dress.jpg", category: "Apparel", rating: 4.7, reviews: 92, badge: "New" },
  { id: 27, name: "Designer Office Desk", price: 349.00, image: "assets/images/desk.jpg", category: "Office", rating: 4.9, reviews: 42, badge: "" },
  { id: 28, name: "Modern Desk Lamp", price: 59.99, image: "assets/images/lamp.jpg", category: "Office", rating: 4.5, reviews: 215, badge: "Hot" },
  { id: 29, name: "Ultra-Wide Gaming Monitor", price: 499.00, image: "assets/images/monitor.jpg", category: "Computing", rating: 4.9, reviews: 311, badge: "Pro" },
  { id: 30, name: "Wireless Mechanical Keyboard", price: 129.50, image: "assets/images/keyboard.jpg", category: "Computing", rating: 4.6, reviews: 88, badge: "" }
];

async function insertProducts() {
  const dbConfig = { host: 'localhost', port: 2773, user: 'root', password: '3631608TNDT5Y', database: 'mbstu_store_db' };

  try {
    const pool = await mysql.createPool(dbConfig);
    console.log("Connected to DB, inserting new products...");
    for(let p of newProducts) {
      try {
        await pool.query('INSERT INTO products (id, name, price, image, category, rating, reviews, badge) VALUES (?,?,?,?,?,?,?,?)',
            [p.id, p.name, p.price, p.image, p.category, p.rating, p.reviews, p.badge]);
        console.log(`Inserted ${p.name}`);
      } catch(e) {
        if(e.code === 'ER_DUP_ENTRY') console.log(`${p.name} already exists.`);
        else console.error(`Error inserting ${p.name}:`, e.message);
      }
    }
    await pool.end();
    console.log("Done inserting.");
  } catch (err) {
    console.error(err);
  }
}

insertProducts();
