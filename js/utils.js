// Утилиты для обработки ошибок и сообщений
// Простая реализация без использования сложных техник

// Проверка доступности localStorage
function isLocalStorageAvailable() {
    try {
        var test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Безопасное сохранение в localStorage с обработкой переполнения
function safeLocalStorageSet(key, value) {
    if (!isLocalStorageAvailable()) {
        return {
            success: false,
            error: 'LocalStorage mavjud emas'
        };
    }
    
    try {
        var jsonValue = JSON.stringify(value);
        var size = new Blob([jsonValue]).size;
        
        // Проверить размер (localStorage обычно ограничен 5-10MB)
        if (size > 5 * 1024 * 1024) {
            return {
                success: false,
                error: 'Ma\'lumot hajmi juda katta'
            };
        }
        
        localStorage.setItem(key, jsonValue);
        return {
            success: true,
            error: null
        };
    } catch (e) {
        // Обработка QuotaExceededError
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            return {
                success: false,
                error: 'LocalStorage to\'ldi. Eski ma\'lumotlarni o\'chiring'
            };
        }
        
        return {
            success: false,
            error: 'Ma\'lumotni saqlashda xatolik: ' + e.message
        };
    }
}

// Безопасное получение из localStorage
function safeLocalStorageGet(key) {
    if (!isLocalStorageAvailable()) {
        return {
            success: false,
            data: null,
            error: 'LocalStorage mavjud emas'
        };
    }
    
    try {
        var data = localStorage.getItem(key);
        if (data === null) {
            return {
                success: true,
                data: null,
                error: null
            };
        }
        
        var parsed = JSON.parse(data);
        return {
            success: true,
            data: parsed,
            error: null
        };
    } catch (e) {
        return {
            success: false,
            data: null,
            error: 'Ma\'lumotni olishda xatolik: ' + e.message
        };
    }
}

// Логирование ошибок (вместо console.log)
function logError(message, error) {
    // В продакшене здесь можно отправлять на сервер
    var errorMessage = message;
    if (error) {
        errorMessage += ': ' + (error.message || error);
    }
    
    // Только в режиме разработки
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        console.error('[ERROR]', errorMessage);
    }
}

// Логирование информации (вместо console.log)
function logInfo(message) {
    // Только в режиме разработки
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        console.log('[INFO]', message);
    }
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.isLocalStorageAvailable = isLocalStorageAvailable;
    window.safeLocalStorageSet = safeLocalStorageSet;
    window.safeLocalStorageGet = safeLocalStorageGet;
    window.logError = logError;
    window.logInfo = logInfo;
}

