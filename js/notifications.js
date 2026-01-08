// Модуль уведомлений (замена alert)
// Простая реализация без использования сложных техник

// Создание уведомления
function showNotification(message, type) {
    type = type || 'info'; // info, success, error, warning
    
    // Удалить существующие уведомления
    var existing = document.querySelectorAll('.notification');
    for (var i = 0; i < existing.length; i++) {
        existing[i].remove();
    }
    
    // Создать элемент уведомления
    var notification = document.createElement('div');
    notification.className = 'notification notification--' + type;
    
    var icon = '';
    switch (type) {
        case 'success':
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            break;
        case 'error':
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
            break;
        case 'warning':
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            break;
        default:
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
    
    notification.innerHTML = 
        '<div class="notification__icon">' + icon + '</div>' +
        '<div class="notification__message">' + message + '</div>' +
        '<button class="notification__close" onclick="this.parentElement.remove()">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<line x1="18" y1="6" x2="6" y2="18"></line>' +
                '<line x1="6" y1="6" x2="18" y2="18"></line>' +
            '</svg>' +
        '</button>';
    
    document.body.appendChild(notification);
    
    // Показать уведомление
    setTimeout(function() {
        notification.classList.add('notification--show');
    }, 10);
    
    // Автоматически скрыть через 5 секунд
    setTimeout(function() {
        notification.classList.remove('notification--show');
        setTimeout(function() {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Показать успешное уведомление
function showSuccess(message) {
    showNotification(message, 'success');
}

// Показать ошибку
function showError(message) {
    showNotification(message, 'error');
}

// Показать предупреждение
function showWarning(message) {
    showNotification(message, 'warning');
}

// Показать информацию
function showInfo(message) {
    showNotification(message, 'info');
}

// Подтверждение (замена confirm)
function showConfirm(message, callback) {
    // Создать модальное окно подтверждения
    var modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = 
        '<div class="confirm-modal__overlay"></div>' +
        '<div class="confirm-modal__content">' +
            '<div class="confirm-modal__message">' + message + '</div>' +
            '<div class="confirm-modal__actions">' +
                '<button class="confirm-modal__btn confirm-modal__btn--cancel" onclick="this.closest(\'.confirm-modal\').remove()">Bekor qilish</button>' +
                '<button class="confirm-modal__btn confirm-modal__btn--confirm" onclick="this.closest(\'.confirm-modal\').remove(); if(typeof arguments[0] === \'function\') arguments[0]();">Tasdiqlash</button>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    // Показать модальное окно
    setTimeout(function() {
        modal.classList.add('confirm-modal--show');
    }, 10);
    
    // Обработчик кнопки подтверждения
    var confirmBtn = modal.querySelector('.confirm-modal__btn--confirm');
    confirmBtn.onclick = function() {
        modal.classList.remove('confirm-modal--show');
        setTimeout(function() {
            modal.remove();
            if (typeof callback === 'function') {
                callback();
            }
        }, 300);
    };
    
    // Обработчик кнопки отмены
    var cancelBtn = modal.querySelector('.confirm-modal__btn--cancel');
    cancelBtn.onclick = function() {
        modal.classList.remove('confirm-modal--show');
        setTimeout(function() {
            modal.remove();
        }, 300);
    };
    
    // Закрытие по клику на overlay
    var overlay = modal.querySelector('.confirm-modal__overlay');
    overlay.onclick = function() {
        modal.classList.remove('confirm-modal--show');
        setTimeout(function() {
            modal.remove();
        }, 300);
    };
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.showNotification = showNotification;
    window.showSuccess = showSuccess;
    window.showError = showError;
    window.showWarning = showWarning;
    window.showInfo = showInfo;
    window.showConfirm = showConfirm;
}

