// Модуль отображения товаров на главной странице
// Простая реализация без использования сложных техник

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
}

// Создание демо товаров (fallback)
function createDemoProducts() {
    return [
        {
            id: 1,
            name: 'Pomidor cherri',
            category: 'vegetables',
            weight: '250 g',
            price: 18900,
            badge: 'Hit',
            image: 'placeholder'
        },
        {
            id: 2,
            name: 'Banan',
            category: 'fruits',
            weight: '1 kg',
            price: 8900,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 3,
            name: 'Tovuq ko\'kragi',
            category: 'meat',
            weight: '500 g',
            price: 29900,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 4,
            name: 'Apelsin sharbati',
            category: 'drinks',
            weight: '1 l',
            price: 14900,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 5,
            name: 'Sabzi',
            category: 'vegetables',
            weight: '1 kg',
            price: 12000,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 6,
            name: 'Olma',
            category: 'fruits',
            weight: '1 kg',
            price: 15000,
            badge: 'Yangi',
            image: 'placeholder'
        },
        {
            id: 7,
            name: 'Mol go\'shti',
            category: 'meat',
            weight: '1 kg',
            price: 85000,
            badge: '',
            image: 'placeholder'
        },
        {
            id: 8,
            name: 'Coca-Cola',
            category: 'drinks',
            weight: '1.5 l',
            price: 12000,
            badge: '',
            image: 'placeholder'
        }
    ];
}

// Создание карточки товара для главной страницы
function createProductCard(product) {
    var card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = 
        '<div class="product-card__image product-card__image--placeholder">' +
            (product.badge ? '<span class="product-card__badge">' + product.badge + '</span>' : '') +
            '<button class="product-card__add-btn" aria-label="Savatga qo\'shish" data-product-id="' + (product.id || product.id) + '">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<path d="M12 2v20M2 12h20"></path>' +
                '</svg>' +
            '</button>' +
        '</div>' +
        '<div class="product-card__content">' +
            '<h3 class="product-card__title">' + product.name + '</h3>' +
            '<p class="product-card__weight">' + product.weight + ' (' + (product.unit || 'шт') + ')</p>' +
            '<div class="product-card__footer">' +
                '<span class="product-card__price">' + formatPrice(product.price) + ' / ' + (product.unit || 'шт') + '</span>' +
            '</div>' +
        '</div>';

    return card;
}

// Отображение товаров на главной странице
function displayProductsOnMain() {
    var productsGrid = document.getElementById('products-grid') || document.querySelector('.products-grid');
    if (!productsGrid) {
        return;
    }

    // Очистить grid
    productsGrid.innerHTML = '';

    // Попробовать получить товары разными способами
    var products = [];
    
    // Способ 1: через функцию getAllProducts
    if (typeof getAllProducts !== 'undefined') {
        try {
            products = getAllProducts();
        } catch(e) {
            if (typeof logError !== 'undefined') {
                logError('Mahsulotlarni olishda xatolik', e);
            }
        }
    }
    // Способ 2: через window.getAllProducts
    if (products.length === 0 && typeof window.getAllProducts !== 'undefined') {
        try {
            products = window.getAllProducts();
        } catch(e) {
                if (typeof logError !== 'undefined') {
                    logError('Mahsulotlarni olishda xatolik (window)', e);
                }
        }
    }
    // Способ 3: через productsStorage напрямую
    if (products.length === 0 && typeof productsStorage !== 'undefined' && productsStorage.products) {
        products = productsStorage.products;
    }

    // Если товаров нет, создать демо товары напрямую
    if (products.length === 0) {
        products = createDemoProducts();
        // Сохранить в localStorage, если возможно
        try {
            localStorage.setItem('products', JSON.stringify({
                products: products,
                nextId: products.length + 1
            }));
        } catch(e) {
            // Игнорировать ошибки сохранения
        }
    }

    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="empty-message">Hozircha mahsulotlar yo\'q</p>';
        return;
    }

    // Показать первые 8 товаров или все, если их меньше
    var productsToShow = products.slice(0, 8);

    for (var i = 0; i < productsToShow.length; i++) {
        var card = createProductCard(productsToShow[i]);
        productsGrid.appendChild(card);
    }
}

// Инициализация при загрузке
function initMainProducts() {
    // Подождать загрузки модуля товаров
    var attempts = 0;
    var maxAttempts = 60; // 3 секунды (60 * 50ms)
    
    var checkInterval = setInterval(function() {
        attempts++;
        
        // Попробовать инициализировать, если модуль доступен, но товаров нет
        if (typeof productsStorage !== 'undefined' && productsStorage.products.length === 0) {
            if (typeof initProductsStorage !== 'undefined') {
                try {
                    initProductsStorage();
                } catch(e) {
                    if (typeof logError !== 'undefined') {
                        logError('Xatolik initProductsStorage', e);
                    }
                }
            } else if (typeof window.initProductsStorage !== 'undefined') {
                try {
                    window.initProductsStorage();
                } catch(e) {
                    if (typeof logError !== 'undefined') {
                        logError('Mahsulotlar xotirasini ishga tushirishda xatolik (window)', e);
                    }
                }
            }
        }
        
        // Проверить через productsStorage напрямую
        if (typeof productsStorage !== 'undefined' && productsStorage.products && productsStorage.products.length > 0) {
            clearInterval(checkInterval);
            displayProductsOnMain();
            return;
        }
        
        // Проверить через window.productsStorage
        if (typeof window.productsStorage !== 'undefined' && window.productsStorage.products && window.productsStorage.products.length > 0) {
            clearInterval(checkInterval);
            displayProductsOnMain();
            return;
        }
        
        // Проверить через функцию getAllProducts
        if (typeof getAllProducts !== 'undefined') {
            try {
                var products = getAllProducts();
                if (products && products.length > 0) {
                    clearInterval(checkInterval);
                    displayProductsOnMain();
                    return;
                }
            } catch(e) {
                // Игнорировать ошибки
            }
        }
        
        // Проверить через window.getAllProducts
        if (typeof window.getAllProducts !== 'undefined') {
            try {
                var products = window.getAllProducts();
                if (products && products.length > 0) {
                    clearInterval(checkInterval);
                    displayProductsOnMain();
                    return;
                }
            } catch(e) {
                // Игнорировать ошибки
            }
        }
        
        // Если превышено максимальное количество попыток
        if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            // Попробовать отобразить товары в любом случае
            displayProductsOnMain();
        }
    }, 50);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainProducts);
} else {
    initMainProducts();
}

// Экспорт функции для обновления из других модулей
window.renderMainProducts = displayProductsOnMain;
