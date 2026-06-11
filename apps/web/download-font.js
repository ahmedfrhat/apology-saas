import https from 'https';
import fs from 'fs';
import path from 'path';

const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo-Bold.ttf';
// Let's use a known font URL from jsdelivr
const cairoUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.8/files/cairo-arabic-700-normal.woff';
const dest = path.join(process.cwd(), 'public', 'Cairo-Bold.ttf');

const file = fs.createWriteStream(dest);
https.get(cairoUrl, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close(() => console.log('Font downloaded successfully!'));
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {});
  console.error('Error downloading font:', err.message);
});
