const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Firebase Web SDK Imports
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, setDoc, doc, deleteDoc, query, where, limit, updateDoc, getDoc } = require('firebase/firestore');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

// =======================================================
// 🔥 FIREBASE CONFIGURATION 🔥
// PASTE YOUR FIREBASE CONFIG OBJECT BELOW:
// =======================================================
const firebaseConfig = {
  apiKey: "AIzaSyAiOeyT9d15L5mc1zW1YHjuAKz51RAToiM",
  authDomain: "mbstustore.firebaseapp.com",
  projectId: "mbstustore",
  storageBucket: "mbstustore.firebasestorage.app",
  messagingSenderId: "706403777481",
  appId: "1:706403777481:web:bdf5ee30105761faebc618"
};

let db = null;

try {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("\n=======================================================");
    console.warn("⚠️ WARNING: You have not put your API Key in server.js yet!");
    console.warn("Please open server.js and replace the 'firebaseConfig' object");
    console.warn("with your actual Firebase configuration.");
    console.warn("=======================================================\n");
  } else {
    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log("\n=======================================================");
    console.log("🔥 Firebase Backend successfully connected via API Key! 🔥");
    console.log("=======================================================\n");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

// Function to seed initial data to Firestore
async function initDB() {
  if (!db) return;
  try {
    const usersRef = collection(db, 'users');
    const uq = query(usersRef, limit(1));
    const usersSnap = await getDocs(uq);

    if (usersSnap.empty) {
      await addDoc(usersRef, { username: 'admin', password: 'password', role: 'admin' });
      await addDoc(usersRef, { username: 'user', password: 'password', role: 'customer' });
      console.log('Seeded default users to Firestore.');
    }

    const productsRef = collection(db, 'products');
    const pq = query(productsRef, limit(1));
    const productsSnap = await getDocs(pq);

    if (productsSnap.empty) {
      const defaultProducts = [
        { id: 1, name: "Noise Cancelling Headphones", price: 299.99, image: "assets/images/product1.jpg", category: "Audio", rating: 4.8, reviews: 124, badge: "Best Seller" },
        { id: 2, name: "Phantom Smartwatch", price: 199.99, image: "assets/images/product2.jpg", category: "Wearables", rating: 4.5, reviews: 89, badge: "New" },
        { id: 3, name: "Ultra-thin Laptop M2", price: 1299.99, image: "assets/images/product3.jpg", category: "Computing", rating: 5.0, reviews: 42, badge: "" },
        { id: 4, name: "Ergonomic Mesh Chair", price: 349.50, image: "assets/images/product4.jpg", category: "Office", rating: 4.6, reviews: 215, badge: "Hot" },
        { id: 5, name: "Urban Sneakers Edition", price: 129.00, image: "assets/images/product5.jpg", category: "Apparel", rating: 4.3, reviews: 67, badge: "Limited" },
        { id: 6, name: "Premium Leather Backpack", price: 89.99, image: "assets/images/product6.jpg", category: "Accessories", rating: 4.7, reviews: 156, badge: "" },
        { id: 7, name: "Smart Home Assistant Hub", price: 149.00, image: "assets/images/product7.jpg", category: "Smart Home", rating: 4.9, reviews: 320, badge: "Hot" },
        { id: 8, name: "Professional DSLR Camera", price: 1899.99, image: "assets/images/product8.jpg", category: "Photography", rating: 4.8, reviews: 110, badge: "Pro" },
        { id: 9, name: "Pro Studio Headset", price: 149.99, image: "assets/images/product9.jpg", category: "Audio", rating: 4.7, reviews: 310, badge: "" },
        { id: 10, name: "Fitness Smartband", price: 59.50, image: "assets/images/product10.jpg", category: "Wearables", rating: 4.9, reviews: 450, badge: "Best Seller" },
        { id: 11, name: "Gaming Laptop Alpha", price: 1549.99, image: "assets/images/product11.jpg", category: "Computing", rating: 4.6, reviews: 85, badge: "" },
        { id: 12, name: "Executive Leather Chair", price: 199.00, image: "assets/images/product12.jpg", category: "Office", rating: 4.8, reviews: 520, badge: "Hot" },
        { id: 13, name: "Classic Running Shoes", price: 89.99, image: "assets/images/product13.jpg", category: "Apparel", rating: 4.2, reviews: 195, badge: "" },
        { id: 14, name: "Travel Laptop Backpack", price: 149.99, image: "assets/images/product14.jpg", category: "Accessories", rating: 4.7, reviews: 112, badge: "New" },
        { id: 15, name: "Voice Assistant Pro", price: 85.00, image: "assets/images/product15.jpg", category: "Smart Home", rating: 4.5, reviews: 66, badge: "" },
        { id: 16, name: "Mirrorless Camera Max", price: 1299.00, image: "assets/images/product16.jpg", category: "Photography", rating: 4.8, reviews: 315, badge: "" },
        { id: 17, name: "Wireless Earbuds", price: 59.99, image: "assets/images/product17.jpg", category: "Audio", rating: 4.4, reviews: 420, badge: "Sale" },
        { id: 18, name: "Classic Chrono Watch", price: 89.99, image: "assets/images/product18.jpg", category: "Wearables", rating: 4.6, reviews: 275, badge: "" },
        { id: 19, name: "Business Ultrabook", price: 899.00, image: "assets/images/product19.jpg", category: "Computing", rating: 4.9, reviews: 180, badge: "New" },
        { id: 20, name: "Standing Desk Stool", price: 149.50, image: "assets/images/product20.jpg", category: "Office", rating: 4.7, reviews: 405, badge: "" },
        { id: 21, name: "High-Top Sneakers", price: 75.00, image: "assets/images/product21.jpg", category: "Apparel", rating: 4.3, reviews: 120, badge: "" },
        { id: 22, name: "Premium Messenger Bag", price: 49.00, image: "assets/images/product22.jpg", category: "Accessories", rating: 4.8, reviews: 90, badge: "Hot" },
        { id: 23, name: "Security Hub Max", price: 199.99, image: "assets/images/product23.jpg", category: "Smart Home", rating: 4.6, reviews: 155, badge: "" },
        { id: 24, name: "Compact Point-and-Shoot", price: 499.00, image: "assets/images/product24.jpg", category: "Photography", rating: 4.9, reviews: 45, badge: "Limited" }
      ];
      for (let p of defaultProducts) {
        await setDoc(doc(db, 'products', p.id.toString()), p);
      }
      console.log('Seeded default products to Firestore.');
    }
  } catch (err) {
    console.error("Firestore database seeding failed:", err);
  }
}

// ------ API ROUTES USING FIRESTORE WEBSDK ------

app.post('/api/login', async (req, res) => {
  try {
    if (!db) return res.json({ success: false, message: 'Firebase not configured in server.js' });

    const { username, password } = req.body;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username), where('password', '==', password));
    const usersSnap = await getDocs(q);

    if (!usersSnap.empty) {
      let userData = usersSnap.docs[0].data();
      userData.id = usersSnap.docs[0].id;
      res.json({ success: true, user: userData });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    if (!db) return res.json({ success: false, message: 'Firebase not configured in server.js' });
    const { username, password, role } = req.body;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const existing = await getDocs(q);

    if (!existing.empty) return res.json({ success: false, message: 'Username already exists' });

    const newUserRef = await addDoc(usersRef, { username, password, role: role || 'customer', email: '', address: '' });
    res.json({ success: true, user: { id: newUserRef.id, username, password, role: role || 'customer', email: '', address: '' } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products', async (req, res) => {
  try {
    if (!db) return res.json([]);
    const snapshot = await getDocs(collection(db, 'products'));
    let products = [];
    snapshot.forEach(document => {
      let p = document.data();
      p.id = p.id || parseInt(document.id) || document.id;
      products.push(p);
    });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    if (!db) return res.json({ success: false, message: 'Firebase not configured' });
    const p = req.body;
    const docId = p.id ? p.id.toString() : Date.now().toString();
    p.id = parseInt(docId);

    await setDoc(doc(db, 'products', docId), p);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!db) return res.json({ success: false, message: 'Firebase not configured' });
    await deleteDoc(doc(db, 'products', req.params.id.toString()));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (!db) return res.json({ success: false, message: 'Firebase not configured' });
    const o = req.body;
    let newOrderRef = await addDoc(collection(db, 'orders'), o);
    res.json({ success: true, orderId: newOrderRef.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (!db) return res.json([]);
    const snapshot = await getDocs(collection(db, 'orders'));
    let orders = [];
    snapshot.forEach(document => {
      let o = document.data();
      o.id = o.id || document.id;
      orders.push(o);
    });
    res.json(orders.reverse());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/profile/update', async (req, res) => {
  try {
    if (!db) return res.json({ success: false, message: 'Firebase not configured' });
    const { id, email, address, newPassword } = req.body;
    if (!id) return res.status(400).json({ error: "No user ID provided" });

    let updates = { email, address };
    if (newPassword) updates.password = newPassword;

    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, updates);

    const userDoc = await getDoc(userRef);
    let userData = userDoc.data();
    userData.id = userDoc.id;
    res.json({ success: true, user: userData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Start Server
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Node Server running on http://localhost:${PORT}`);
  await initDB();
});
