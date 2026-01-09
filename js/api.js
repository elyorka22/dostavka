// API модуль для работы с бэкендом
// Простая реализация без использования сложных техник
// Поддерживает: localStorage, Firebase, HTTP API

// Базовый URL API (для Railway)
// Получает из переменных окружения Vercel или использует значение по умолчанию
function getAPIBaseURL() {
    // Для браузера (Vercel)
    if (typeof window !== 'undefined' && window.location) {
        // Попытка получить из переменных окружения (через Vercel)
        // Vercel инжектирует переменные через process.env в build time
        if (typeof process !== 'undefined' && process.env && process.env.RAILWAY_API_URL) {
            return process.env.RAILWAY_API_URL + '/api';
        }
    }
    
    // Fallback на значение по умолчанию
    return 'http://localhost:3000/api';
}

var API_BASE_URL = getAPIBaseURL();

// Режим работы: 'localStorage', 'firebase' или 'api'
// Проверяем переменную окружения или используем localStorage по умолчанию
var API_MODE = 'localStorage';

// Проверка переменной окружения (для Vercel)
if (typeof window !== 'undefined' && window.location) {
    // Если не localhost, значит продакшен - используем firebase
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1' &&
        !window.location.hostname.includes('localhost')) {
        // В продакшене всегда используем firebase
        API_MODE = 'firebase';
    }
    
    // Проверка флага принудительного режима
    if (window.__FORCE_FIREBASE_MODE__) {
        API_MODE = 'firebase';
    }
}

// Функция для выполнения HTTP запросов
function apiRequest(method, endpoint, data) {
    if (API_MODE === 'localStorage') {
        // Использовать localStorage
        return localStorageRequest(method, endpoint, data);
    } else if (API_MODE === 'firebase') {
        // Использовать Firebase
        return firebaseRequest(method, endpoint, data);
    } else {
        // Использовать реальный API
        return httpRequest(method, endpoint, data);
    }
}

// Запрос к localStorage (текущая реализация)
function localStorageRequest(method, endpoint, data) {
    return new Promise(function(resolve, reject) {
        try {
            var result = null;
            
            if (method === 'GET') {
                result = localStorageGet(endpoint);
            } else if (method === 'POST') {
                result = localStoragePost(endpoint, data);
            } else if (method === 'PUT') {
                result = localStoragePut(endpoint, data);
            } else if (method === 'DELETE') {
                result = localStorageDelete(endpoint, data);
            }
            
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

// HTTP запрос к реальному API
function httpRequest(method, endpoint, data) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var url = API_BASE_URL + endpoint;
        
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    resolve(xhr.responseText);
                }
            } else {
                reject(new Error('HTTP Error: ' + xhr.status));
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('Network Error'));
        };
        
        if (data) {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    });
}

// GET запрос к localStorage
function localStorageGet(endpoint) {
    var key = endpoint.replace('/api/', '');
    var data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

// POST запрос к localStorage
function localStoragePost(endpoint, data) {
    var key = endpoint.replace('/api/', '');
    var existing = localStorage.getItem(key);
    var result = null;
    
    if (existing) {
        var parsed = JSON.parse(existing);
        if (Array.isArray(parsed)) {
            parsed.push(data);
            result = parsed;
        } else {
            result = data;
        }
    } else {
        result = Array.isArray(data) ? data : [data];
    }
    
    localStorage.setItem(key, JSON.stringify(result));
    return result;
}

// PUT запрос к localStorage
function localStoragePut(endpoint, data) {
    var key = endpoint.replace('/api/', '');
    localStorage.setItem(key, JSON.stringify(data));
    return data;
}

// DELETE запрос к localStorage
function localStorageDelete(endpoint, data) {
    var key = endpoint.replace('/api/', '');
    localStorage.removeItem(key);
    return { success: true };
}

// ========== Firebase запросы ==========

// Запрос к Firebase Firestore
function firebaseRequest(method, endpoint, data) {
    return new Promise(function(resolve, reject) {
        try {
            if (typeof getFirestore === 'undefined' || !isFirebaseInitialized()) {
                reject(new Error('Firebase не инициализирован'));
                return;
            }

            var db = getFirestore();
            var collectionName = endpoint.replace('/api/', '').split('/')[0];
            var docId = endpoint.split('/').length > 2 ? endpoint.split('/')[2] : null;

            if (method === 'GET') {
                if (docId) {
                    // Получить один документ
                    db.collection(collectionName).doc(docId).get()
                        .then(function(doc) {
                            if (doc.exists) {
                                var docData = doc.data();
                                docData.id = doc.id;
                                resolve(docData);
                            } else {
                                resolve(null);
                            }
                        })
                        .catch(reject);
                } else {
                    // Получить все документы
                    db.collection(collectionName).get()
                        .then(function(querySnapshot) {
                            var results = [];
                            querySnapshot.forEach(function(doc) {
                                var docData = doc.data();
                                docData.id = doc.id;
                                results.push(docData);
                            });
                            resolve(results);
                        })
                        .catch(reject);
                }
            } else if (method === 'POST') {
                // Создать документ
                var docRef = db.collection(collectionName).doc();
                var docData = {};
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        docData[key] = data[key];
                    }
                }
                docData.id = docRef.id;
                docData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                docRef.set(docData)
                    .then(function() {
                        resolve(docData);
                    })
                    .catch(reject);
            } else if (method === 'PUT') {
                // Обновить документ
                if (!docId) {
                    reject(new Error('ID документа не указан'));
                    return;
                }
                var updateData = {};
                for (var key2 in data) {
                    if (data.hasOwnProperty(key2)) {
                        updateData[key2] = data[key2];
                    }
                }
                updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                db.collection(collectionName).doc(docId).update(updateData)
                    .then(function() {
                        var result = { id: docId };
                        for (var key3 in updateData) {
                            if (updateData.hasOwnProperty(key3)) {
                                result[key3] = updateData[key3];
                            }
                        }
                        resolve(result);
                    })
                    .catch(reject);
            } else if (method === 'DELETE') {
                // Удалить документ
                if (!docId) {
                    // Удалить всю коллекцию (для корзины)
                    db.collection(collectionName).get()
                        .then(function(querySnapshot) {
                            var batch = db.batch();
                            querySnapshot.forEach(function(doc) {
                                batch.delete(doc.ref);
                            });
                            return batch.commit();
                        })
                        .then(function() {
                            resolve({ success: true });
                        })
                        .catch(reject);
                } else {
                    db.collection(collectionName).doc(docId).delete()
                        .then(function() {
                            resolve({ success: true });
                        })
                        .catch(reject);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

// API функции для продуктов
var ProductsAPI = {
    getAll: function() {
        return apiRequest('GET', '/api/products');
    },
    getById: function(id) {
        var products = apiRequest('GET', '/api/products');
        if (products && Array.isArray(products)) {
            for (var i = 0; i < products.length; i++) {
                if (products[i].id == id) {
                    return products[i];
                }
            }
        }
        return null;
    },
    create: function(product) {
        return apiRequest('POST', '/api/products', product);
    },
    update: function(id, product) {
        return apiRequest('PUT', '/api/products/' + id, product);
    },
    delete: function(id) {
        return apiRequest('DELETE', '/api/products/' + id);
    }
};

// API функции для заказов
var OrdersAPI = {
    getAll: function() {
        return apiRequest('GET', '/api/orders');
    },
    getById: function(id) {
        var orders = apiRequest('GET', '/api/orders');
        if (orders && Array.isArray(orders)) {
            for (var i = 0; i < orders.length; i++) {
                if (orders[i].id == id) {
                    return orders[i];
                }
            }
        }
        return null;
    },
    create: function(order) {
        return apiRequest('POST', '/api/orders', order);
    },
    update: function(id, order) {
        return apiRequest('PUT', '/api/orders/' + id, order);
    },
    delete: function(id) {
        return apiRequest('DELETE', '/api/orders/' + id);
    }
};

// API функции для корзины
var CartAPI = {
    get: function() {
        return apiRequest('GET', '/api/cart');
    },
    add: function(item) {
        return apiRequest('POST', '/api/cart', item);
    },
    update: function(item) {
        return apiRequest('PUT', '/api/cart', item);
    },
    clear: function() {
        return apiRequest('DELETE', '/api/cart');
    }
};

// API функции для пользователей
var UsersAPI = {
    getAll: function() {
        return apiRequest('GET', '/api/users');
    },
    getById: function(id) {
        var users = apiRequest('GET', '/api/users');
        if (users && Array.isArray(users)) {
            for (var i = 0; i < users.length; i++) {
                if (users[i].id == id) {
                    return users[i];
                }
            }
        }
        return null;
    },
    create: function(userData) {
        return apiRequest('POST', '/api/users', userData);
    },
    update: function(id, userData) {
        return apiRequest('PUT', '/api/users/' + id, userData);
    },
    delete: function(id) {
        return apiRequest('DELETE', '/api/users/' + id);
    },
    login: function(credentials) {
        return apiRequest('POST', '/api/auth/login', credentials);
    },
    logout: function() {
        return apiRequest('POST', '/api/auth/logout');
    }
};

// Экспорт для глобального доступа
if (typeof window !== 'undefined') {
    window.ProductsAPI = ProductsAPI;
    window.OrdersAPI = OrdersAPI;
    window.CartAPI = CartAPI;
    window.UsersAPI = UsersAPI;
    window.API_MODE = API_MODE;
    window.setAPIMode = function(mode) {
        if (mode === 'firebase' && typeof initFirebase !== 'undefined') {
            if (initFirebase()) {
                API_MODE = mode;
            } else {
                throw new Error('Не удалось инициализировать Firebase');
            }
        } else {
            API_MODE = mode;
        }
    };
}

