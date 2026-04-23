const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function check() {
  const snapshot = await getDocs(collection(db, 'products'));
  let issues = 0;
  snapshot.forEach(doc => {
    console.log(`ID: ${doc.id}, Image: ${doc.data().image}`);
    if (doc.data().image && doc.data().image.includes('product10.jpg')) {
      issues++;
    }
  });
  console.log("Total checked:", snapshot.size);
  process.exit(0);
}

check();
