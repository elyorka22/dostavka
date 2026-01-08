// Модуль отображения категорий на главной странице
// Простая реализация без использования сложных техник

// Создание SVG иконки по умолчанию
function createDefaultCategoryIcon(iconType) {
    var svgContent = '';
    
    switch(iconType) {
        case 'vegetables':
            svgContent = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M8 12h8M12 8v8"></path></svg>';
            break;
        case 'fruits':
            svgContent = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6M12 12h6"></path></svg>';
            break;
        case 'meat':
            svgContent = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M9 9h6M9 12h6M9 15h6"></path></svg>';
            break;
        case 'drinks':
            svgContent = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"></path><path d="M9 8h6M9 12h6M9 16h6"></path></svg>';
            break;
        case 'dairy':
            svgContent = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>';
            break;
        case 'bakery':
            svgContent = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>';
            break;
        default:
            svgContent = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>';
    }
    
    return svgContent;
}

// Создание карточки категории
function createCategoryCard(category) {
    var card = document.createElement('a');
    card.href = '#';
    card.className = 'category-card';
    card.setAttribute('data-service', 'products');
    card.setAttribute('data-category', category.id);
    
    var iconHtml = '';
    if (category.image) {
        // Проверить, это путь к файлу или base64
        var imageSrc = category.image;
        if (category.image.startsWith('images/')) {
            // Это путь к файлу, попробовать получить из localStorage или использовать напрямую
            if (typeof getImageByPath !== 'undefined') {
                var imageData = getImageByPath(category.image);
                if (imageData) {
                    imageSrc = imageData;
                } else {
                    // Попробовать загрузить как обычный файл (относительный путь)
                    imageSrc = category.image;
                }
            } else if (typeof window.getImageByPath !== 'undefined') {
                var imageData = window.getImageByPath(category.image);
                if (imageData) {
                    imageSrc = imageData;
                } else {
                    imageSrc = category.image;
                }
            } else {
                // Использовать путь напрямую (для серверной версии)
                imageSrc = category.image;
            }
        }
        // Показать изображение
        iconHtml = '<div class="category-card__image" style="background-image: url(\'' + imageSrc + '\');"></div>';
    } else {
        // Показать SVG иконку по умолчанию
        iconHtml = '<div class="category-card__icon category-card__icon--' + category.icon + '">' + createDefaultCategoryIcon(category.icon) + '</div>';
    }
    
    card.innerHTML = iconHtml;
    
    return card;
}

// Отображение категорий на главной странице
function displayCategoriesOnMain() {
    var categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) {
        return;
    }

    categoriesGrid.innerHTML = '';

    var categories = getAllCategories();
    var categoryIds = Object.keys(categories);

    // Показать только основные категории (vegetables, fruits, meat, drinks)
    var mainCategories = ['vegetables', 'fruits', 'meat', 'drinks'];

    for (var i = 0; i < mainCategories.length; i++) {
        var categoryId = mainCategories[i];
        if (categories[categoryId]) {
            var card = createCategoryCard(categories[categoryId]);
            categoriesGrid.appendChild(card);
        }
    }
}

// Обновление категорий (для вызова из админ-панели)
// Глобальная функция для доступа из других модулей
window.updateCategoriesOnMainPage = function() {
    displayCategoriesOnMain();
};

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(displayCategoriesOnMain, 100);
    });
} else {
    setTimeout(displayCategoriesOnMain, 100);
}

