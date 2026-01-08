// Модуль поиска товаров
// Простая реализация без использования сложных техник

var searchTimeout = null;

// Инициализация поиска
function initSearch() {
    var searchInput = document.getElementById('search-input');
    if (!searchInput) {
        return;
    }
    
    // Обработчик ввода
    searchInput.addEventListener('input', function() {
        var query = this.value.trim();
        
        // Очистить предыдущий таймер
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Задержка перед поиском (debounce)
        searchTimeout = setTimeout(function() {
            performSearch(query);
        }, 300);
    });
    
    // Обработчик очистки
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            this.value = '';
            performSearch('');
        }
    });
}

// Выполнение поиска
function performSearch(query) {
    if (!query || query.length === 0) {
        // Показать все товары
        if (typeof displayProductsOnMain !== 'undefined') {
            displayProductsOnMain();
        } else if (typeof window.displayProductsOnMain !== 'undefined') {
            window.displayProductsOnMain();
        }
        return;
    }
    
    // Получить все товары
    var allProducts = [];
    if (typeof getAllProducts !== 'undefined') {
        allProducts = getAllProducts();
    } else if (typeof window.getAllProducts !== 'undefined') {
        allProducts = window.getAllProducts();
    }
    
    if (!allProducts || allProducts.length === 0) {
        return;
    }
    
    // Фильтровать товары
    var queryLower = query.toLowerCase();
    var filteredProducts = [];
    
    for (var i = 0; i < allProducts.length; i++) {
        var product = allProducts[i];
        var productName = (product.name || '').toLowerCase();
        var productCategory = (product.category || '').toLowerCase();
        
        if (productName.indexOf(queryLower) !== -1 || 
            productCategory.indexOf(queryLower) !== -1) {
            filteredProducts.push(product);
        }
    }
    
    // Отобразить отфильтрованные товары
    displayFilteredProducts(filteredProducts, query);
}

// Отображение отфильтрованных товаров
function displayFilteredProducts(products, query) {
    var productsGrid = document.getElementById('products-grid');
    if (!productsGrid) {
        return;
    }
    
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="empty-message">"' + query + '" bo\'yicha mahsulotlar topilmadi</p>';
        return;
    }
    
    // Использовать существующую функцию создания карточек
    if (typeof createProductCard !== 'undefined') {
        for (var i = 0; i < products.length; i++) {
            var card = createProductCard(products[i]);
            productsGrid.appendChild(card);
        }
    } else if (typeof window.createProductCard !== 'undefined') {
        for (var j = 0; j < products.length; j++) {
            var card2 = window.createProductCard(products[j]);
            productsGrid.appendChild(card2);
        }
    }
    
    // Обновить индикаторы корзины
    if (typeof updateAllAddButtonIndicators !== 'undefined') {
        updateAllAddButtonIndicators();
    } else if (typeof window.updateAllAddButtonIndicators !== 'undefined') {
        window.updateAllAddButtonIndicators();
    }
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.performSearch = performSearch;
}

