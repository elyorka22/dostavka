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
    
    // Проверить, что Firebase инициализирован
    if (typeof isFirebaseInitialized === 'undefined' || !isFirebaseInitialized()) {
        // Подождать инициализации Firebase
        setTimeout(function() {
            loadUsersFromFirebase();
        }, 500);
        return;
    }
    
    UsersAPI.getAll().then(function(users) {
        if (users && Array.isArray(users) && users.length > 0) {
            usersStorage.users = users;
        } else {
            // Если пользователей нет в Firebase, создать демо пользователей
            // Это нужно для работы системы до настройки Firebase Auth
            createDefaultUsers();
            // Сохранить в Firebase
            for (var i = 0; i < usersStorage.users.length; i++) {
                UsersAPI.create(usersStorage.users[i]).catch(function(err) {
                    // Игнорировать ошибки, если пользователь уже существует
                });
            }
        }
    }).catch(function(error) {
        if (typeof logError !== 'undefined') {
            logError('Ошибка загрузки пользователей из Firebase', error);
        }
        // При ошибке создаем демо пользователей для работы системы
        createDefaultUsers();
        // Попробовать сохранить в Firebase
        for (var j = 0; j < usersStorage.users.length; j++) {
            UsersAPI.create(usersStorage.users[j]).catch(function(err) {
                // Игнорировать ошибки
            });
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
        // Загрузить из Firebase асинхронно
        loadUsersFromFirebase();
    } else if (usersStorage.users.length === 0) {
        // Только для локальной разработки - создать демо данные
        // В продакшене пользователи должны быть в Firebase Auth
        var isLocalhost = window.location && 
                         (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
        if (isLocalhost) {
            createDefaultUsers();
        }
        // В продакшене не создаем демо пользователей
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
    // Проверить, есть ли пользователи в хранилище
    if (usersStorage.users.length === 0) {
        // Попробовать загрузить из Firebase, если режим firebase
        if (typeof API_MODE !== 'undefined' && API_MODE === 'firebase') {
            // Пользователи должны быть загружены заранее через loadUsersFromFirebase
            // Если не загружены, попробовать загрузить синхронно (не рекомендуется, но для совместимости)
            if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized()) {
                // Попробовать найти пользователя напрямую в Firebase
                var db = getFirestore();
                if (db) {
                    // Это асинхронная операция, но для совместимости попробуем
                    // В реальности пользователи должны быть в Firebase Auth
                    // Пока используем старую логику с проверкой в usersStorage
                }
            }
        }
    }
    
    // Поиск пользователя в хранилище
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

// Регистрация нового пользователя
function register(name, email, password, phone) {
    // Валидация
    if (!name || !email || !password) {
        if (typeof logError !== 'undefined') {
            logError('Имя, email и пароль обязательны');
        }
        return Promise.resolve(null);
    }
    
    // Проверка формата email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (typeof logError !== 'undefined') {
            logError('Неверный формат email');
        }
        return Promise.resolve(null);
    }
    
    // Проверка длины пароля
    if (password.length < 6) {
        if (typeof logError !== 'undefined') {
            logError('Пароль должен содержать минимум 6 символов');
        }
        return Promise.resolve(null);
    }
    
    if (typeof API_MODE !== 'undefined' && API_MODE === 'firebase') {
        // Регистрация через Firebase Auth
        if (typeof getAuth === 'undefined' || !isFirebaseInitialized()) {
            if (typeof logError !== 'undefined') {
                logError('Firebase Auth не инициализирован');
            }
            return Promise.resolve(null);
        }
        
        var auth = getAuth();
        var db = getFirestore();
        
        return auth.createUserWithEmailAndPassword(email, password)
            .then(function(userCredential) {
                var user = userCredential.user;
                
                // Создать документ пользователя в Firestore
                var userData = {
                    name: name,
                    email: email,
                    role: userRoles.CUSTOMER, // По умолчанию обычный пользователь
                    phone: phone || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                return db.collection('users').doc(user.uid).set(userData)
                    .then(function() {
                        // Автоматически войти после регистрации
                        var currentUser = {
                            id: user.uid,
                            login: email,
                            name: name,
                            role: userRoles.CUSTOMER,
                            email: email,
                            phone: phone || ''
                        };
                        usersStorage.currentUser = currentUser;
                        saveCurrentUser();
                        return currentUser;
                    });
            })
            .catch(function(error) {
                if (typeof logError !== 'undefined') {
                    logError('Ошибка регистрации через Firebase Auth', error);
                }
                return null;
            });
    } else {
        // Регистрация через localStorage
        // Проверить, не существует ли уже пользователь с таким email
        for (var i = 0; i < usersStorage.users.length; i++) {
            if (usersStorage.users[i].email === email || usersStorage.users[i].login === email) {
                if (typeof logError !== 'undefined') {
                    logError('Пользователь с таким email уже существует');
                }
                return Promise.resolve(null);
            }
        }
        
        // Создать нового пользователя
        var newUserId = usersStorage.users.length > 0 ? 
            Math.max.apply(null, usersStorage.users.map(function(u) { return u.id; })) + 1 : 1;
        
        var newUser = {
            id: newUserId,
            login: email,
            password: password,
            name: name,
            role: userRoles.CUSTOMER,
            email: email,
            phone: phone || ''
        };
        
        usersStorage.users.push(newUser);
        saveUsers();
        
        // Автоматически войти после регистрации
        var currentUser = {
            id: newUser.id,
            login: newUser.login,
            name: newUser.name,
            role: newUser.role,
            email: newUser.email,
            phone: newUser.phone
        };
        usersStorage.currentUser = currentUser;
        saveCurrentUser();
        
        return Promise.resolve(currentUser);
    }
}

// Выход из системы
function logout() {
    if (typeof API_MODE !== 'undefined' && API_MODE === 'firebase') {
        if (typeof getAuth === 'undefined' || !isFirebaseInitialized()) {
            if (typeof logError !== 'undefined') {
                logError('Firebase Auth не инициализирован');
            }
            return;
        }
        var auth = getAuth();
        auth.signOut().then(function() {
            usersStorage.currentUser = null;
            saveCurrentUser();
            if (typeof logInfo !== 'undefined') {
                logInfo('Пользователь вышел из системы Firebase');
            }
        }).catch(function(error) {
            if (typeof logError !== 'undefined') {
                logError('Ошибка выхода из системы Firebase', error);
            }
        });
    } else {
        usersStorage.currentUser = null;
        saveCurrentUser();
    }
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

