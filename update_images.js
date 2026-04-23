const mysql = require('mysql2/promise');

const imageMap = {
  "Audio": "assets/images/premium_audio.png",
  "Wearables": "assets/images/premium_wearables.png",
  "Computing": "assets/images/premium_computing.png",
  "Office": "assets/images/premium_office.png",
  "Apparel": "assets/images/premium_apparel.png",
  "Accessories": "assets/images/premium_accessories.png",
  "Smart Home": "assets/images/premium_smarthome.jpg",
  "Photography": "assets/images/premium_photography.jpg"
};

async function updateImages() {
  const dbConfig = {
    host: 'localhost',
    port: 2773,
    user: 'root',
    password: '3631608TNDT5Y',
    database: 'mbstu_store_db'
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to DB, updating images...");
    for (const [category, imgPath] of Object.entries(imageMap)) {
      await connection.execute('UPDATE products SET image = ? WHERE category = ?', [imgPath, category]);
      console.log(`Updated category ${category} -> ${imgPath}`);
    }
    await connection.end();
    console.log("Done updating images.");
  } catch (err) {
    console.error(err);
  }
}

updateImages();
