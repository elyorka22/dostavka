// Модуль управления ролями и навигацией
// Простая реализация без использования сложных техник

// Конфигурация ролей
var rolesConfig = {
    'super-admin': {
        name: 'Супер-админ',
        page: 'admin.html',
        permissions: ['view_statistics', 'view_all_orders', 'manage_system']
    },
    'manager': {
        name: 'Менеджер',
        page: 'manager.html',
        permissions: ['view_orders', 'close_orders']
    },
    'picker': {
        name: 'Сборщик',
        page: 'picker.html',
        permissions: ['view_orders', 'close_orders_after_picking']
    },
    'courier': {
        name: 'Курьер',
        page: 'courier.html',
        permissions: ['view_ready_orders', 'close_orders_after_delivery']
    }
};

// Инициализация на страницах ролей
function initRolePage() {
    // Проверить авторизацию через модуль users
    if (typeof getCurrentUser === 'function') {
        var currentUser = getCurrentUser();
        
        if (!currentUser) {
            // Если пользователь не авторизован, перенаправить на страницу входа
            window.location.href = 'login.html';
            return;
        }

        // Проверить, что пользователь имеет доступ к этой странице
        var currentPage = window.location.pathname.split('/').pop();
        var rolePage = getRolePage(currentUser.role);
        
        if (currentPage !== rolePage && currentPage !== 'index.html') {
            // Если пользователь пытается зайти не на свою страницу, перенаправить
            window.location.href = rolePage;
            return;
        }
    }
    
    // Добавить обработчик для кнопки выхода
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (typeof logout === 'function') {
                logout();
            }
            window.location.href = 'login.html';
        });
    }
}

// Запуск инициализации для страниц ролей
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Инициализировать только на страницах ролей (не на login.html и index.html)
        var currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'login.html' && currentPage !== 'index.html') {
            initRolePage();
        }
    });
} else {
    var currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'index.html') {
        initRolePage();
    }
}

