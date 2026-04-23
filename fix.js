const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('firebase-app-compat.js')) {
    c = c.replace(/<script src="js\/app\.js[^"]*"><\/script>/g, '<script src="https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js"></script>\n  <script src="https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore-compat.js"></script>\n  <script src="js/app.js"></script>');
    fs.writeFileSync(f, c);
    console.log('Fixed ' + f);
  }
});
