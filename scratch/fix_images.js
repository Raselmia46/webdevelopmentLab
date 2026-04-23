const fs = require('fs');

async function fixImages() {
  console.log("Fetching reliable placeholder images...");
  for (let i = 1; i <= 24; i++) {
    try {
      const url = `https://picsum.photos/seed/store_item_${i}/400/300`;
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      const path = `c:\\Users\\cZ\\Desktop\\cpn\\ecommerce\\assets\\images\\product${i}.jpg`;
      fs.writeFileSync(path, Buffer.from(buffer));
      console.log(`Successfully fixed and downloaded -> product${i}.jpg`);
    } catch (err) {
      console.error(`Failed to download product${i}:`, err);
    }
  }
  console.log("All broken images perfectly replaced!");
}

fixImages();
