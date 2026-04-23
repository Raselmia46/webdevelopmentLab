const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 2773,
  user: 'root',
  password: '3631608TNDT5Y',
  database: 'mbstu_store_db'
};

async function checkDB() {
  const pool = mysql.createPool(dbConfig);
  const [products] = await pool.query('SELECT id, name, image FROM products LIMIT 5');
  console.log(products);
  process.exit();
}
checkDB();
