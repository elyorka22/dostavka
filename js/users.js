// Модуль управления пользователями
// Простая реализация без использования сложных техник

// Хранилище пользователей (в реальном приложении это будет сервер)
var usersStorage = {
    users: [],
    currentUser: null
};

// Роли пользователей
var userRoles = {
    SUPER_ADMIN: 'super-admin',
    MANAGER: 'manager',
    PICKER: 'picker',
    COURIER: 'courier',
    CUSTOMER: 'customer'
};

// Загрузка пользователей из Firebase
function loadUsersFromFirebase() {
    if (typeof UsersAPI === 'undefined' || typeof API_MODE === 'undefined' || API_MODE !== 'firebase') {
        return;
    }
    
    UsersAPI.getAll().then(function(users) {
        if (users && Array.isArray(users) && users.length > 0) {
            usersStorage.users = users;
        }
    }).catch(function(error) {
        if (typeof logError !== 'undefined') {
            logError('Ошибка загрузки пользователей из Firebase', error);
        }
    });
}

// Инициализация данных пользователей из localStorage
function initUsersStorage() {
    if (typeof safeLocalStorageGet !== 'undefined') {
        var result = safeLocalStorageGet('users');
        if (result.success && result.data) {
            usersStorage.users = result.data.users || [];
        } else if (result.error && typeof logError !== 'undefined') {
            logError('Foydalanuvchilarni yuklashda xatolik', result.error);
        }
    } else {
        // Fallback на старый способ
        var savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            try {
                var parsed = JSON.parse(savedUsers);
                usersStorage.users = parsed.users || [];
            } catch (e) {
                if (typeof logError !== 'undefined') {
                    logError('Foydalanuvchilarni yuklashda xatolik', e);
                }
            }
        }
    }

    // Загрузить пользователей из Firebase, если режим firebase
    if (typeof API_MODE !== 'undefined' && API_MODE === 'firebase') {
        loadUsersFromFirebase();
    } else if (usersStorage.users.length === 0) {
        // Только для локальной разработки - создать демо данные
        // В продакшене пользователи должны быть в Firebase Auth
        if (window.location && window.location.hostname === 'localhost') {
            createDefaultUsers();
        }
    }

    // Загрузить текущего пользователя
    if (typeof safeLocalStorageGet !== 'undefined') {
        var currentUserResult = safeLocalStorageGet('currentUser');
        if (currentUserResult.success && currentUserResult.data) {
            usersStorage.currentUser = currentUserResult.data;
        }
    } else {
        // Fallback на старый способ
        var savedCurrentUser = localStorage.getItem('currentUser');
        if (savedCurrentUser) {
            try {
                usersStorage.currentUser = JSON.parse(savedCurrentUser);
            } catch (e) {
                if (typeof logError !== 'undefined') {
                    logError('Joriy foydalanuvchini yuklashda xatolik', e);
                }
            }
        }
    }
}

// Создание пользователей по умолчанию
function createDefaultUsers() {
    usersStorage.users = [
        {
            id: 1,
            login: 'admin',
            password: 'admin123',
            name: 'Super-admin',
            role: userRoles.SUPER_ADMIN,
            email: 'admin@delivery.uz'
        },
        {
            id: 2,
            login: 'manager',
            password: 'manager123',
            name: 'Menejer',
            role: userRoles.MANAGER,
            email: 'manager@delivery.uz'
        },
        {
            id: 3,
            login: 'picker',
            password: 'picker123',
            name: 'Yig\'uvchi',
            role: userRoles.PICKER,
            email: 'picker@delivery.uz'
        },
        {
            id: 4,
            login: 'courier',
            password: 'courier123',
            name: 'Kuryer',
            role: userRoles.COURIER,
            email: 'courier@delivery.uz'
        },
        {
            id: 5,
            login: 'user',
            password: 'user123',
            name: 'Oddiy foydalanuvchi',
            role: userRoles.CUSTOMER,
            email: 'user@delivery.uz'
        }
    ];
    saveUsers();
}

// Сохранение пользователей в localStorage
function saveUsers() {
    try {
        localStorage.setItem('users', JSON.stringify({ users: usersStorage.users }));
    } catch (e) {
        if (typeof logError !== 'undefined') {
            logError('Ошибка сохранения пользователей', e);
        }
    }
}

// Сохранение текущего пользователя
function saveCurrentUser() {
    try {
        if (usersStorage.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(usersStorage.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    } catch (e) {
        if (typeof logError !== 'undefined') {
            logError('Ошибка сохранения текущего пользователя', e);
        }
    }
}

// Вход в систему
function login(loginValue, password) {
    for (var i = 0; i < usersStorage.users.length; i++) {
        var user = usersStorage.users[i];
        if (user.login === loginValue && user.password === password) {
            // Не сохранять пароль в текущем пользователе
            var currentUser = {
                id: user.id,
                login: user.login,
                name: user.name,
                role: user.role,
                email: user.email
            };
            usersStorage.currentUser = currentUser;
            saveCurrentUser();
            return currentUser;
        }
    }
    return null;
}

// Выход из системы
function logout() {
    usersStorage.currentUser = null;
    saveCurrentUser();
}

// Получение текущего пользователя
function getCurrentUser() {
    return usersStorage.currentUser;
}

// Проверка, авторизован ли пользователь
function isAuthenticated() {
    return usersStorage.currentUser !== null;
}

// Проверка роли пользователя
function hasRole(role) {
    if (!usersStorage.currentUser) {
        return false;
    }
    return usersStorage.currentUser.role === role;
}

// Проверка, является ли пользователь администратором
function isAdmin() {
    return hasRole(userRoles.SUPER_ADMIN) || hasRole(userRoles.MANAGER);
}

// Получение страницы для роли
function getRolePage(role) {
    var rolePages = {
        'super-admin': 'admin.html',
        'manager': 'manager.html',
        'picker': 'picker.html',
        'courier': 'courier.html',
        'customer': 'index.html'
    };
    return rolePages[role] || 'index.html';
}

// Инициализация при загрузке
initUsersStorage();

