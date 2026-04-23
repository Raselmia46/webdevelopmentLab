const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 2773,
  user: 'root',
  password: '3631608TNDT5Y',
  database: 'mbstu_store_db'
};

async function clearImages() {
  try {
    const pool = mysql.createPool(dbConfig);
    const [result] = await pool.query('UPDATE products SET image = ""');
    console.log(`Successfully cleared images from database. ${result.affectedRows} rows updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Error clearing images from database:', error);
    process.exit(1);
  }
}

clearImages();
