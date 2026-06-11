const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.jsx', 'utf8');

// The mandate says: 
// "Ensure that the input fields in Light Mode are white with dark borders (Original), 
// and in Dark Mode, they are `dark:bg-slate-900` with `dark:text-white`."
// "Remove any text-gray-400 or text-slate-500 that appears faint in Dark Mode. If a text element looks "faded," it must be either text-white or text-slate-200 for maximum legibility."

// Let's globally add `dark:` to inputs and text areas if missing, and fix text colors.
// Since `AdminDashboard.jsx` might not have dark mode classes properly mapped on every element, I will just do a regex replace to ensure inputs are styled properly.

// First, fix any existing `dark:` classes that might be causing issues
content = content.replace(/dark:bg-gray-800/g, 'dark:bg-slate-900');
content = content.replace(/dark:border-gray-700/g, 'dark:border-slate-800');
content = content.replace(/dark:text-gray-400/g, 'dark:text-slate-300');
content = content.replace(/dark:text-gray-300/g, 'dark:text-slate-200');

// Inject targeted dark mode classes into inputs and textareas
content = content.replace(/<input([^>]*className="([^"]*)")([^>]*)>/g, (match, p1, className, p3) => {
    let newClass = className;
    if (!newClass.includes('dark:bg-')) newClass += ' dark:bg-slate-900';
    if (!newClass.includes('dark:text-')) newClass += ' dark:text-white';
    if (!newClass.includes('dark:border-')) newClass += ' dark:border-slate-800';
    if (!newClass.includes('dark:focus:border-')) newClass += ' dark:focus:border-amber-500';
    return `<input${p1.replace(className, newClass)}${p3}>`;
});

content = content.replace(/<textarea([^>]*className="([^"]*)")([^>]*)>/g, (match, p1, className, p3) => {
    let newClass = className;
    if (!newClass.includes('dark:bg-')) newClass += ' dark:bg-slate-900';
    if (!newClass.includes('dark:text-')) newClass += ' dark:text-white';
    if (!newClass.includes('dark:border-')) newClass += ' dark:border-slate-800';
    if (!newClass.includes('dark:focus:border-')) newClass += ' dark:focus:border-amber-500';
    return `<textarea${p1.replace(className, newClass)}${p3}>`;
});

// Also fix select tags
content = content.replace(/<select([^>]*className="([^"]*)")([^>]*)>/g, (match, p1, className, p3) => {
    let newClass = className;
    if (!newClass.includes('dark:bg-')) newClass += ' dark:bg-slate-900';
    if (!newClass.includes('dark:text-')) newClass += ' dark:text-white';
    if (!newClass.includes('dark:border-')) newClass += ' dark:border-slate-800';
    return `<select${p1.replace(className, newClass)}${p3}>`;
});

// Fix faded text generally in headers/labels
content = content.replace(/className="([^"]*text-gray-500[^"]*)"/g, (match, className) => {
    if (!className.includes('dark:text-')) {
        return `className="${className} dark:text-slate-300"`;
    }
    return match;
});

content = content.replace(/className="([^"]*text-gray-600[^"]*)"/g, (match, className) => {
    if (!className.includes('dark:text-')) {
        return `className="${className} dark:text-slate-200"`;
    }
    return match;
});

content = content.replace(/className="([^"]*text-gray-900[^"]*)"/g, (match, className) => {
    if (!className.includes('dark:text-')) {
        return `className="${className} dark:text-white"`;
    }
    return match;
});

content = content.replace(/className="([^"]*text-gray-800[^"]*)"/g, (match, className) => {
    if (!className.includes('dark:text-')) {
        return `className="${className} dark:text-white"`;
    }
    return match;
});

content = content.replace(/className="([^"]*bg-gray-50[^"]*)"/g, (match, className) => {
    if (!className.includes('dark:bg-')) {
        return `className="${className} dark:bg-slate-900/50"`;
    }
    return match;
});

content = content.replace(/className="([^"]*bg-white[^"]*)"/g, (match, className) => {
    if (!className.includes('dark:bg-')) {
        return `className="${className} dark:bg-slate-950"`;
    }
    return match;
});

fs.writeFileSync('src/components/AdminDashboard.jsx', content);
console.log('Fixed AdminDashboard.jsx theme classes');
