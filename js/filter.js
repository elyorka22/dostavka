// Модуль фильтрации товаров по категориям
// Простая реализация без использования сложных техник

var currentCategoryFilter = null;

// Инициализация фильтрации
function initFilter() {
    // Обработчик клика на категории
    var categoryCards = document.querySelectorAll('.category-card');
    for (var i = 0; i < categoryCards.length; i++) {
        categoryCards[i].addEventListener('click', function(event) {
            event.preventDefault();
            var categoryId = this.getAttribute('data-category');
            if (categoryId) {
                filterByCategory(categoryId);
            }
        });
    }
}

// Фильтрация по категории
function filterByCategory(categoryId) {
    currentCategoryFilter = categoryId;
    
    // Обновить активное состояние категорий
    var categoryCards = document.querySelectorAll('.category-card');
    for (var i = 0; i < categoryCards.length; i++) {
        var card = categoryCards[i];
        if (card.getAttribute('data-category') === categoryId) {
            card.classList.add('category-card--active');
        } else {
            card.classList.remove('category-card--active');
        }
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
    var filteredProducts = [];
    for (var j = 0; j < allProducts.length; j++) {
        if (allProducts[j].category === categoryId) {
            filteredProducts.push(allProducts[j]);
        }
    }
    
    // Отобразить отфильтрованные товары
    displayFilteredProducts(filteredProducts, categoryId);
}

// Сброс фильтра
function resetFilter() {
    currentCategoryFilter = null;
    
    // Убрать активное состояние с категорий
    var categoryCards = document.querySelectorAll('.category-card');
    for (var i = 0; i < categoryCards.length; i++) {
        categoryCards[i].classList.remove('category-card--active');
    }
    
    // Показать все товары
    if (typeof displayProductsOnMain !== 'undefined') {
        displayProductsOnMain();
    } else if (typeof window.displayProductsOnMain !== 'undefined') {
        window.displayProductsOnMain();
    }
}

// Отображение отфильтрованных товаров
function displayFilteredProducts(products, categoryId) {
    var productsGrid = document.getElementById('products-grid');
    if (!productsGrid) {
        return;
    }
    
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        var categoryName = '';
        if (typeof getCategoryById !== 'undefined') {
            var category = getCategoryById(categoryId);
            if (category) {
                categoryName = category.name;
            }
        }
        productsGrid.innerHTML = '<p class="empty-message">' + (categoryName || 'Bu kategoriyada') + ' hozircha mahsulotlar yo\'q</p>';
        return;
    }
    
    // Использовать существующую функцию создания карточек
    var createCard = null;
    if (typeof createProductCard !== 'undefined') {
        createCard = createProductCard;
    } else if (typeof window.createProductCard !== 'undefined') {
        createCard = window.createProductCard;
    }
    
    if (createCard) {
        for (var i = 0; i < products.length; i++) {
            var card = createCard(products[i]);
            productsGrid.appendChild(card);
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
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initFilter, 200);
    });
} else {
    setTimeout(initFilter, 200);
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.filterByCategory = filterByCategory;
    window.resetFilter = resetFilter;
}

