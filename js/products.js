// Модуль управления товарами
// Простая реализация без использования сложных техник

// Хранилище товаров (в реальном приложении это будет сервер)
var productsStorage = {
    products: [],
    nextId: 1
};

// Категории товаров
var productCategories = {
    vegetables: 'Sabzavotlar',
    fruits: 'Mevalar',
    meat: 'Go'sht',
    drinks: 'Ichimliklar',
    dairy: 'Sut mahsulotlari',
    bakery: 'Non mahsulotlari'
};

// Загрузка товаров из Firebase
function loadProductsFromFirebase() {
    if (typeof ProductsAPI === 'undefined' || typeof API_MODE === 'undefined' || API_MODE !== 'firebase') {
        return;
    }
    
    // Проверить, что Firebase инициализирован
    if (typeof isFirebaseInitialized === 'undefined' || !isFirebaseInitialized()) {
        // Подождать инициализации Firebase
        setTimeout(function() {
            loadProductsFromFirebase();
        }, 500);
        return;
    }
    
    ProductsAPI.getAll().then(function(products) {
        if (products && Array.isArray(products) && products.length > 0) {
            productsStorage.products = products;
            // Найти максимальный ID
            var maxId = 0;
            for (var i = 0; i < products.length; i++) {
                var productId = parseInt(products[i].id);
                if (!isNaN(productId) && productId > maxId) {
                    maxId = productId;
                } else if (typeof products[i].id === 'string' && products[i].id.length > 0) {
                    // Если ID строка (Firebase auto-id), используем длину массива
                    maxId = products.length;
                }
            }
            productsStorage.nextId = maxId + 1;
            
            // Обновить отображение товаров
            if (typeof displayProductsOnMain !== 'undefined') {
                displayProductsOnMain();
            }
        } else {
            // Если товаров нет в Firebase, не создаем демо данные в продакшене
            var isLocalhost = window.location && 
                             (window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1');
            if (isLocalhost && productsStorage.products.length === 0) {
                createDefaultProducts();
            }
        }
    }).catch(function(error) {
        if (typeof logError !== 'undefined') {
            logError('Ошибка загрузки товаров из Firebase', error);
        }
        // В продакшене не создаем демо данные при ошибке
        var isLocalhost = window.location && 
                         (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
        if (isLocalhost && productsStorage.products.length === 0) {
            createDefaultProducts();
        }
    });
}

// Инициализация данных товаров
function initProductsStorage() {
    // Проверить, продакшен или локально
    var isLocalhost = window.location && 
                     (window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1');
    
    // Если продакшен, сразу загружаем из Firebase (не используем localStorage)
    if (!isLocalhost) {
        // В продакшене всегда используем Firebase
        if (typeof API_MODE !== 'undefined') {
            API_MODE = 'firebase';
        }
        // Загрузить из Firebase
        loadProductsFromFirebase();
        return;
    }
    
    // Локально: сначала проверяем localStorage
    if (typeof safeLocalStorageGet !== 'undefined') {
        var result = safeLocalStorageGet('products');
        if (result.success && result.data) {
            productsStorage.products = result.data.products || [];
            productsStorage.nextId = result.data.nextId || 1;
        } else if (result.error && typeof logError !== 'undefined') {
            logError('Mahsulotlarni yuklashda xatolik', result.error);
        }
    } else {
        // Fallback на старый способ
        var savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            try {
                var parsed = JSON.parse(savedProducts);
                productsStorage.products = parsed.products || [];
                productsStorage.nextId = parsed.nextId || 1;
            } catch (e) {
                if (typeof logError !== 'undefined') {
                    logError('Mahsulotlarni yuklashda xatolik', e);
                }
            }
        }
    }

    // Загрузить товары из Firebase, если режим firebase
    if (typeof API_MODE !== 'undefined' && API_MODE === 'firebase') {
        // Загрузить из Firebase асинхронно
        loadProductsFromFirebase();
    } else if (productsStorage.products.length === 0) {
        // Только для локальной разработки - создать демо данные
        if (isLocalhost) {
            createDefaultProducts();
        }
    }
}

// Создание товаров по умолчанию
function createDefaultProducts() {
    productsStorage.products = [
        {
            id: 1,
            name: 'Pomidor cherri',
            category: 'vegetables',
            weight: '250 g',
            unit: 'упак',
            price: 18900,
            badge: 'Hit',
            image: 'placeholder'
        },
        {
            id: 2,
            name: 'Banan',
            category: 'fruits',
            weight: '1 kg',
            unit: 'кг',
            price: 8900,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 3,
            name: 'Tovuq ko\'kragi',
            category: 'meat',
            weight: '500 g',
            unit: 'кг',
            price: 29900,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 4,
            name: 'Apelsin sharbati',
            category: 'drinks',
            weight: '1 l',
            unit: 'л',
            price: 14900,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 5,
            name: 'Sabzi',
            category: 'vegetables',
            weight: '1 kg',
            unit: 'кг',
            price: 12000,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 6,
            name: 'Olma',
            category: 'fruits',
            weight: '1 kg',
            unit: 'кг',
            price: 15000,
            badge: 'Yangi',
            image: 'placeholder'
        },
        {
            id: 7,
            name: 'Mol go\'shti',
            category: 'meat',
            weight: '1 kg',
            unit: 'кг',
            price: 85000,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 8,
            name: 'Coca-Cola',
            category: 'drinks',
            weight: '1.5 l',
            unit: 'л',
            price: 12000,
            badge: '',
            image: 'placeholder'
        }
    ];
    productsStorage.nextId = 9;
    saveProducts();
}

// Сохранение товаров в localStorage
function saveProducts() {
    try {
        localStorage.setItem('products', JSON.stringify({
            products: productsStorage.products,
            nextId: productsStorage.nextId
        }));
    } catch (e) {
        if (typeof logError !== 'undefined') {
            logError('Ошибка сохранения товаров', e);
        }
    }
}

// Получение всех товаров
function getAllProducts() {
    return productsStorage.products;
}

// Получение товара по ID
function getProductById(productId) {
    // Преобразовать productId в число для сравнения
    var productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
        productIdNum = productId;
    }
    
    for (var i = 0; i < productsStorage.products.length; i++) {
        var prodId = parseInt(productsStorage.products[i].id);
        if (isNaN(prodId)) {
            prodId = productsStorage.products[i].id;
        }
        // Сравнить как число и как строку
        if (productsStorage.products[i].id == productId || prodId == productIdNum) {
            return productsStorage.products[i];
        }
    }
    return null;
}

// Создание нового товара
function createProduct(productData) {
    var product = {
        id: productsStorage.nextId++,
        name: productData.name || '',
        category: productData.category || 'vegetables',
        weight: productData.weight || '',
        unit: productData.unit || 'шт',
        price: productData.price || 0,
        badge: productData.badge || '',
        image: productData.image || 'placeholder'
    };

    productsStorage.products.push(product);
    saveProducts();
    return product;
}

// Обновление товара
function updateProduct(productId, productData) {
    var product = getProductById(productId);
    if (!product) {
        return false;
    }

    product.name = productData.name || product.name;
    product.category = productData.category || product.category;
    product.weight = productData.weight || product.weight;
    product.unit = productData.unit !== undefined ? productData.unit : (product.unit || 'шт');
    product.price = productData.price !== undefined ? productData.price : product.price;
    product.badge = productData.badge !== undefined ? productData.badge : product.badge;
    product.image = productData.image || product.image;

    saveProducts();
    return true;
}

// Удаление товара
function deleteProduct(productId) {
    for (var i = 0; i < productsStorage.products.length; i++) {
        if (productsStorage.products[i].id === productId) {
            productsStorage.products.splice(i, 1);
            saveProducts();
            return true;
        }
    }
    return false;
}

// Получение товаров по категории
function getProductsByCategory(category) {
    var result = [];
    for (var i = 0; i < productsStorage.products.length; i++) {
        if (productsStorage.products[i].category === category) {
            result.push(productsStorage.products[i]);
        }
    }
    return result;
}

// Инициализация при загрузке
initProductsStorage();

// Убедиться, что функции доступны глобально
if (typeof window !== 'undefined') {
    window.getAllProducts = getAllProducts;
    window.getProductById = getProductById;
    window.createProduct = createProduct;
    window.updateProduct = updateProduct;
    window.deleteProduct = deleteProduct;
    window.productsStorage = productsStorage;
    window.initProductsStorage = initProductsStorage;
}

// Также инициализировать при загрузке DOM, если еще не загружено
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (productsStorage.products.length === 0) {
            initProductsStorage();
        }
    });
} else {
    if (productsStorage.products.length === 0) {
        initProductsStorage();
    }
}

