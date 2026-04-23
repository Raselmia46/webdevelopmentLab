const mysql = require('mysql2/promise');

async function restoreImages() {
  const dbConfig = {
    host: 'localhost',
    port: 2773,
    user: 'root',
    password: '3631608TNDT5Y',
    database: 'mbstu_store_db'
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to DB, restoring images...");
    
    // Get all products
    const [products] = await connection.query('SELECT id FROM products');
    let updatedCount = 0;
    
    for (const product of products) {
      // Use new_prod_X.jpg where X is 1 to 24 (wrap around if id > 24)
      const imgNum = ((product.id - 1) % 24) + 1;
      const imgPath = `assets/images/new_prod_${imgNum}.jpg`;
      
      const [result] = await connection.execute('UPDATE products SET image = ? WHERE id = ?', [imgPath, product.id]);
      if (result.affectedRows > 0) {
        updatedCount++;
      }
    }
    
    await connection.end();
    console.log(`Done restoring images. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

restoreImages();
