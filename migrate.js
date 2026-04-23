const mysql = require('mysql2/promise');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAiOeyT9d15L5mc1zW1YHjuAKz51RAToiM",
  authDomain: "mbstustore.firebaseapp.com",
  projectId: "mbstustore",
  storageBucket: "mbstustore.firebasestorage.app",
  messagingSenderId: "706403777481",
  appId: "1:706403777481:web:bdf5ee30105761faebc618"
};

// MySQL Config
const dbConfig = {
  host: 'localhost',
  port: 2773,
  user: 'root',
  password: '3631608TNDT5Y',
  database: 'mbstu_store_db',
  decimalNumbers: true
};

async function migrateData() {
  console.log("Starting Data Migration from MySQL to Firebase...");
  
  // 1. Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log("Connected to Firebase.");

  let connection;
  try {
    // 2. Connect to MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to local MySQL database.");

    // 3. Fetch Products
    const [products] = await connection.query('SELECT * FROM products');
    console.log(`Found ${products.length} products in MySQL. Migrating...`);

    // 4. Upload to Firebase
    for (const p of products) {
      if(!p.id) continue;
      // Convert decimal wrapper if needed
      p.price = Number(p.price) || 0;
      p.rating = Number(p.rating) || 5;
      
      const docRef = doc(db, 'products', p.id.toString());
      await setDoc(docRef, p);
      console.log(`Migrated product: ${p.name}`);
    }
    
    // 5. Fetch Orders
    const [orders] = await connection.query('SELECT * FROM orders');
    console.log(`Found ${orders.length} orders in MySQL. Migrating...`);
    
    for (const o of orders) {
      if(!o.id) continue;
      // Parse JSON items if they are stored as string in MySQL
      if (typeof o.items === 'string') {
        try { o.items = JSON.parse(o.items); } catch(e){}
      }
      o.total = Number(o.total) || 0;
      
      const docRef = doc(db, 'orders', o.id.toString());
      await setDoc(docRef, o);
      console.log(`Migrated order: ${o.id}`);
    }
    
    console.log("\n=======================================================");
    console.log("✅ ALL DATA SUCCESSFULLY MIGRATED TO FIREBASE!");
    console.log("=======================================================\n");

  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

migrateData();
