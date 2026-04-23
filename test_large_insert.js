const crypto = require('crypto');
const imageStr = 'data:image/jpeg;base64,' + crypto.randomBytes(3 * 1024 * 1024).toString('base64'); // ~4MB base64
console.log("Sending payload size:", imageStr.length);

fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 8888,
    name: 'Large Test',
    price: 99.99,
    category: 'Audio',
    badge: 'New',
    rating: 5,
    reviews: 0,
    image: imageStr
  })
}).then(res => res.json()).then(console.log).catch(console.error);
