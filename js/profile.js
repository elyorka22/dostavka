// Модуль управления профилем пользователя
// Простая реализация без использования сложных техник

// Инициализация профиля
function initProfile() {
    var profileBtn = document.getElementById('profile-btn');
    var profileMenu = document.getElementById('profile-menu');
    var loginLink = document.getElementById('login-link');
    var logoutLink = document.getElementById('logout-link');
    var adminLink = document.getElementById('admin-link');
    var profileName = document.getElementById('profile-name');
    var profileMenuName = document.getElementById('profile-menu-name');
    var profileMenuRole = document.getElementById('profile-menu-role');
    var profileMenuUser = document.getElementById('profile-menu-user');

    if (!profileBtn || !profileMenu) {
        return;
    }

    // Проверка авторизации
    var currentUser = getCurrentUser();

    if (currentUser) {
        // Пользователь авторизован
        profileName.textContent = currentUser.name;
        
        if (profileMenuName) {
            profileMenuName.textContent = currentUser.name;
        }
        
        if (profileMenuRole) {
            var roleNames = {
                'super-admin': 'Super-admin',
                'manager': 'Menejer',
                'picker': 'Yig'uvchi',
                'courier': 'Kuryer',
                'customer': 'Xaridor'
            };
            profileMenuRole.textContent = roleNames[currentUser.role] || currentUser.role;
        }

        if (profileMenuUser) {
            profileMenuUser.style.display = 'block';
        }

        if (loginLink) {
            loginLink.style.display = 'none';
        }

        if (logoutLink) {
            logoutLink.style.display = 'block';
        }

        // Показать кнопку админ-панели для администраторов
        if (isAdmin() && adminLink) {
            adminLink.style.display = 'block';
            adminLink.href = getRolePage(currentUser.role);
        }
    } else {
        // Пользователь не авторизован
        profileName.textContent = 'Kirish';
        
        if (profileMenuUser) {
            profileMenuUser.style.display = 'none';
        }

        if (loginLink) {
            loginLink.style.display = 'block';
        }

        if (logoutLink) {
            logoutLink.style.display = 'none';
        }

        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }

    // Открытие/закрытие меню профиля
    profileBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        if (profileMenu.classList.contains('profile-menu--open')) {
            profileMenu.classList.remove('profile-menu--open');
        } else {
            profileMenu.classList.add('profile-menu--open');
        }
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(event) {
        if (!profileBtn.contains(event.target) && !profileMenu.contains(event.target)) {
            profileMenu.classList.remove('profile-menu--open');
        }
    });

    // Обработка выхода
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
            window.location.reload();
        });
    }
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}

