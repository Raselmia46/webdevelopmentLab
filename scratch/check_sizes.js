const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets/images');
const files = fs.readdirSync(imgDir);

for (let file of files) {
  if (file.endsWith('.jpg') || file.endsWith('.png')) {
    const stat = fs.statSync(path.join(imgDir, file));
    if (stat.size < 10000) {
      console.log(`SMALL FILE: ${file} is ${stat.size} bytes`);
    }
  }
}
