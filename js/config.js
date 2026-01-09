// Конфигурация API
// Этот файл будет использоваться для настройки Railway URL
// ВАЖНО: Замените 'YOUR_RAILWAY_URL' на ваш реальный Railway URL

// Railway API URL (без /api в конце)
// Пример: 'https://dostavka-production.up.railway.app'
window.RAILWAY_API_URL = 'YOUR_RAILWAY_URL';

// API Mode: 'api' для Railway, 'firebase' для Firebase, 'localStorage' для локальной разработки
window.API_MODE = 'api';

// Автоматическое определение режима в продакшене
(function() {
    var isProduction = window.location && 
                      window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // В продакшене используем Railway API
        if (!window.RAILWAY_API_URL || window.RAILWAY_API_URL === 'YOUR_RAILWAY_URL') {
            console.warn('⚠️ RAILWAY_API_URL не установлен! Установите ваш Railway URL в js/config.js');
        } else {
            window.API_MODE = 'api';
            console.log('✅ Railway API URL установлен:', window.RAILWAY_API_URL);
        }
    } else {
        // Локально используем localStorage
        window.API_MODE = 'localStorage';
    }
})();

