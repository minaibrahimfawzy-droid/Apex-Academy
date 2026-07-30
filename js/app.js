document.addEventListener('alpine:init', () => {
    // تسجيل المتجر البرمجي للتطبيق بشكل فوري ومباشر
    Alpine.store('apex', window.ApexStore);
});

window.addEventListener('DOMContentLoaded', () => {
    console.log("Apex Academy Engine Core v115 Initialized successfully.");
});