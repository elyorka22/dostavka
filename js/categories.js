// Модуль управления категориями
// Простая реализация без использования сложных техник

// Хранилище категорий (в реальном приложении это будет сервер)
var categoriesStorage = {
    categories: {},
    defaultCategories: {
        vegetables: {
            id: 'vegetables',
            name: 'Sabzavotlar',
            image: null,
            icon: 'vegetables'
        },
        fruits: {
            id: 'fruits',
            name: 'Mevalar',
            image: null,
            icon: 'fruits'
        },
        meat: {
            id: 'meat',
            name: 'Go\'sht',
            image: null,
            icon: 'meat'
        },
        drinks: {
            id: 'drinks',
            name: 'Ichimliklar',
            image: null,
            icon: 'drinks'
        },
        dairy: {
            id: 'dairy',
            name: 'Sut mahsulotlari',
            image: null,
            icon: 'dairy'
        },
        bakery: {
            id: 'bakery',
            name: 'Non mahsulotlari',
            image: null,
            icon: 'bakery'
        }
    }
};

// Загрузка категорий из Firebase
function loadCategoriesFromFirebase() {
    if (typeof API_MODE === 'undefined' || API_MODE !== 'firebase') {
        return;
    }
    
    if (typeof ProductsAPI === 'undefined') {
        return;
    }
    
    // Загрузить категории через API (если есть коллекция categories)
    var db = null;
    if (typeof getFirestore !== 'undefined' && isFirebaseInitialized()) {
        db = getFirestore();
        if (db) {
            db.collection('categories').get().then(function(querySnapshot) {
                if (querySnapshot && !querySnapshot.empty) {
                    var loadedCategories = {};
                    querySnapshot.forEach(function(doc) {
                        var categoryData = doc.data();
                        loadedCategories[doc.id] = categoryData;
                    });
                    categoriesStorage.categories = loadedCategories;
                }
            }).catch(function(error) {
                if (typeof logError !== 'undefined') {
                    logError('Ошибка загрузки категорий из Firebase', error);
                }
            });
        }
    }
}

// Инициализация данных категорий из localStorage
function initCategoriesStorage() {
    var savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        try {
            var parsed = JSON.parse(savedCategories);
            categoriesStorage.categories = parsed.categories || {};
        } catch (e) {
            if (typeof logError !== 'undefined') {
                logError('Kategoriyalarni yuklashda xatolik', e);
            }
        }
    }

    // Загрузить категории из Firebase, если режим firebase
    if (typeof API_MODE !== 'undefined' && API_MODE === 'firebase') {
        loadCategoriesFromFirebase();
    } else if (Object.keys(categoriesStorage.categories).length === 0) {
        // Только для локальной разработки - создать дефолтные категории
        // В продакшене категории должны быть в Firebase
        if (window.location && window.location.hostname === 'localhost') {
            categoriesStorage.categories = JSON.parse(JSON.stringify(categoriesStorage.defaultCategories));
            saveCategories();
        }
    }
}

// Сохранение категорий в localStorage
function saveCategories() {
    try {
        localStorage.setItem('categories', JSON.stringify({
            categories: categoriesStorage.categories
        }));
    } catch (e) {
        if (typeof logError !== 'undefined') {
            logError('Kategoriyalarni saqlashda xatolik', e);
        }
    }
}

// Получение всех категорий
function getAllCategories() {
    return categoriesStorage.categories;
}

// Получение категории по ID
function getCategoryById(categoryId) {
    return categoriesStorage.categories[categoryId] || null;
}

// Обновление изображения категории
function updateCategoryImage(categoryId, imageData) {
    if (!categoriesStorage.categories[categoryId]) {
        return false;
    }

    categoriesStorage.categories[categoryId].image = imageData;
    saveCategories();
    return true;
}

// Удаление изображения категории
function removeCategoryImage(categoryId) {
    if (!categoriesStorage.categories[categoryId]) {
        return false;
    }

    categoriesStorage.categories[categoryId].image = null;
    saveCategories();
    return true;
}

// Конвертация файла в base64
function convertFileToBase64(file, callback) {
    if (!file) {
        callback(null);
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.onerror = function() {
        callback(null);
    };
    reader.readAsDataURL(file);
}

// Функция для обновления категории с файлом из папки
function updateCategoryWithFileFromFolder(categoryId, filePath) {
    if (!categoriesStorage.categories[categoryId]) {
        return false;
    }
    
    // Проверить, существует ли файл
    var testImg = new Image();
    testImg.onload = function() {
        // Файл существует, обновить категорию
        categoriesStorage.categories[categoryId].image = filePath;
        saveCategories();
    };
    testImg.onerror = function() {
        if (typeof logError !== 'undefined') {
            logError('Fayl topilmadi', { path: filePath });
        }
    };
    testImg.src = filePath;
    
    return true;
}

// Инициализация при загрузке
initCategoriesStorage();

// Автоматически обновить категорию vegetables с новым файлом
if (categoriesStorage.categories.vegetables) {
    updateCategoryWithFileFromFolder('vegetables', 'images/categories/photo_2026-01-08_05-08-24.jpg');
}

