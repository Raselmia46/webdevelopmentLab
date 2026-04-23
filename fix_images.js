const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAiOeyT9d15L5mc1zW1YHjuAKz51RAToiM",
  authDomain: "mbstustore.firebaseapp.com",
  projectId: "mbstustore",
  storageBucket: "mbstustore.firebasestorage.app",
  messagingSenderId: "706403777481",
  appId: "1:706403777481:web:bdf5ee30105761faebc618"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  console.log("Scanning Firebase products for missing image files...");
  const snapshot = await getDocs(collection(db, 'products'));
  
  let fixedCount = 0;
  for (let d of snapshot.docs) {
    const data = d.data();
    let imgPath = data.image; 
    
    // Ignore external URLs if any
    if (imgPath.startsWith('http')) continue;
    
    let localPath = path.join(__dirname, imgPath);
    if (!fs.existsSync(localPath)) {
      console.log(`Missing image for product "${data.name}": ${imgPath}`);
      
      // Attempt to find original fallback
      let fallbackPath = `assets/images/product${d.id}.jpg`;
      if (fs.existsSync(path.join(__dirname, fallbackPath))) {
         await updateDoc(d.ref, { image: fallbackPath });
         console.log(`  -> Fixed! Redirecting to ${fallbackPath}`);
         fixedCount++;
      } else {
         await updateDoc(d.ref, { image: `assets/images/product1.jpg` });
         console.log(`  -> Fixed! Redirecting to generic placeholder (product1.jpg)`);
         fixedCount++;
      }
    }
  }
  console.log(`Done! Fixed ${fixedCount} broken images.`);
  process.exit(0);
}

fix();
