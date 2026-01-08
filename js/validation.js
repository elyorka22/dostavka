// Модуль валидации и санитизации
// Простая реализация без использования сложных техник

// Санитизация строки (предотвращение XSS)
function sanitizeString(str) {
    if (typeof str !== 'string') {
        return '';
    }
    
    // Удалить HTML теги
    var div = document.createElement('div');
    div.textContent = str;
    var sanitized = div.textContent || div.innerText || '';
    
    // Удалить опасные символы
    sanitized = sanitized.replace(/[<>]/g, '');
    
    return sanitized.trim();
}

// Валидация телефона (формат +998)
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return false;
    }
    
    // Удалить все пробелы и дефисы
    var cleaned = phone.replace(/[\s\-]/g, '');
    
    // Проверить формат +998 XX XXX XX XX или +998XXXXXXXXX
    var phoneRegex = /^\+998\d{9}$/;
    
    return phoneRegex.test(cleaned);
}

// Форматирование телефона для отображения
function formatPhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return '';
    }
    
    var cleaned = phone.replace(/[\s\-]/g, '');
    
    if (cleaned.startsWith('+998') && cleaned.length === 13) {
        return '+998 ' + cleaned.substring(4, 6) + ' ' + cleaned.substring(6, 9) + ' ' + cleaned.substring(9, 11) + ' ' + cleaned.substring(11, 13);
    }
    
    return phone;
}

// Валидация цены (только числа, > 0)
function validatePrice(price) {
    if (price === null || price === undefined || price === '') {
        return false;
    }
    
    var numPrice = parseFloat(price);
    
    if (isNaN(numPrice)) {
        return false;
    }
    
    if (numPrice <= 0) {
        return false;
    }
    
    return true;
}

// Валидация имени (минимум 2 символа, только буквы и пробелы)
function validateName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    
    var trimmed = name.trim();
    
    if (trimmed.length < 2) {
        return false;
    }
    
    // Разрешить буквы, пробелы, апострофы (для имен типа O'zbek)
    var nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s'\-]+$/u;
    
    return nameRegex.test(trimmed);
}

// Валидация адреса (минимум 10 символов)
function validateAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }
    
    var trimmed = address.trim();
    
    return trimmed.length >= 10;
}

// Валидация email (базовая)
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(email.trim());
}

// Валидация размера файла (в байтах)
function validateFileSize(file, maxSizeMB) {
    if (!file || !file.size) {
        return false;
    }
    
    var maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    return file.size <= maxSizeBytes;
}

// Валидация типа файла (изображение)
function validateImageType(file) {
    if (!file || !file.type) {
        return false;
    }
    
    var allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    return allowedTypes.indexOf(file.type.toLowerCase()) !== -1;
}

// Полная валидация изображения
function validateImage(file, maxSizeMB) {
    maxSizeMB = maxSizeMB || 2;
    
    if (!validateImageType(file)) {
        return {
            valid: false,
            error: 'Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF)'
        };
    }
    
    if (!validateFileSize(file, maxSizeMB)) {
        return {
            valid: false,
            error: 'Rasm hajmi ' + maxSizeMB + 'MB dan katta bo\'lmasligi kerak'
        };
    }
    
    return {
        valid: true,
        error: null
    };
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.sanitizeString = sanitizeString;
    window.validatePhone = validatePhone;
    window.formatPhone = formatPhone;
    window.validatePrice = validatePrice;
    window.validateName = validateName;
    window.validateAddress = validateAddress;
    window.validateEmail = validateEmail;
    window.validateFileSize = validateFileSize;
    window.validateImageType = validateImageType;
    window.validateImage = validateImage;
}

