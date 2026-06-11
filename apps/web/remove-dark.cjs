const fs = require('fs');

const files = [
    'src/components/AdminDashboard.jsx',
    'src/app/page.jsx',
    'src/app/root.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Regex to remove any `dark:something`
    content = content.replace(/dark:[^\s"']+/g, '');
    
    // Clean up double spaces created by the removal
    content = content.replace(/  +/g, ' ');
    
    fs.writeFileSync(file, content);
    console.log(`Cleaned ${file}`);
});
