// Модуль loading индикаторов
// Простая реализация без использования сложных техник

// Показать loading overlay
function showLoading() {
    var overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-overlay__spinner"></div>';
        document.body.appendChild(overlay);
    }
    
    setTimeout(function() {
        overlay.classList.add('loading-overlay--show');
    }, 10);
}

// Скрыть loading overlay
function hideLoading() {
    var overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('loading-overlay--show');
        setTimeout(function() {
            if (overlay.parentElement) {
                overlay.remove();
            }
        }, 300);
    }
}

// Показать loading на кнопке
function showButtonLoading(button) {
    if (!button) {
        return;
    }
    
    button.disabled = true;
    var originalText = button.textContent;
    button.setAttribute('data-original-text', originalText);
    button.innerHTML = '<span class="loading"></span> ' + originalText;
}

// Скрыть loading на кнопке
function hideButtonLoading(button) {
    if (!button) {
        return;
    }
    
    button.disabled = false;
    var originalText = button.getAttribute('data-original-text');
    if (originalText) {
        button.textContent = originalText;
        button.removeAttribute('data-original-text');
    }
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.showButtonLoading = showButtonLoading;
    window.hideButtonLoading = hideButtonLoading;
}

