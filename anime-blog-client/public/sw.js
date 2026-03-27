self.addEventListener('install', (event) => {
    console.log('Service worker installed');
});

self.addEventListener('fetch', (event) => {
    // מעביר את כל הבקשות כרגיל, נדרש רק כדי שהטלפון יזהה PWA
});