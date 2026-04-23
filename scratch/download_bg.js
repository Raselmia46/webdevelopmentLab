const fs = require('fs');

async function downloadBg() {
  const url = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=900&fit=crop"; // Shopping/e-commerce imagery
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync('c:\\Users\\cZ\\Desktop\\cpn\\ecommerce\\assets\\images\\login-bg.jpg', Buffer.from(buffer));
  console.log("Downloaded selling and buying pic!");
}
downloadBg();
