const mysql = require('mysql2/promise');

const products = [
  { id: 1, keyword: "headphones" },
  { id: 2, keyword: "smartwatch" },
  { id: 3, keyword: "laptop" },
  { id: 4, keyword: "office,chair" },
  { id: 5, keyword: "sneakers" },
  { id: 6, keyword: "backpack" },
  { id: 7, keyword: "smarthome" },
  { id: 8, keyword: "dslr" },
  { id: 9, keyword: "headset" },
  { id: 10, keyword: "fitnessband" },
  { id: 11, keyword: "gaminglaptop" },
  { id: 12, keyword: "leatherchair" },
  { id: 13, keyword: "shoes" },
  { id: 14, keyword: "bag" },
  { id: 15, keyword: "voiceassistant" },
  { id: 16, keyword: "mirrorlesscamera" },
  { id: 17, keyword: "earbuds" },
  { id: 18, keyword: "watch" },
  { id: 19, keyword: "ultrabook" },
  { id: 20, keyword: "deskstool" }
];

async function run() {
  console.log("Updating database with new 20 image paths...");
  const dbConfig = { host: 'localhost', port: 2773, user: 'root', password: '3631608TNDT5Y', database: 'mbstu_store_db' };
  try {
    const pool = await mysql.createPool(dbConfig);
    for(let p of products) {
      await pool.query('UPDATE products SET image = ? WHERE id = ?', [`assets/images/new_prod_${p.id}.jpg`, p.id]);
    }
    await pool.end();
    console.log("Database updated successfully.");
  } catch (err) {
    console.error("DB Error:", err);
  }
}

run();
