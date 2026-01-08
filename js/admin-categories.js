// Модуль управления категориями в админ-панели
// Простая реализация без использования сложных техник

var currentEditingCategoryId = null;

// Создание карточки категории для админ-панели
function createCategoryAdminCard(category) {
    var card = document.createElement('div');
    card.className = 'category-admin-card';
    
    var imageHtml = '';
    if (category.image) {
        // Проверить, это путь к файлу или base64
        var imageSrc = category.image;
        if (category.image.startsWith('images/')) {
            // Это путь к файлу, попробовать получить из localStorage
            if (typeof getImageByPath !== 'undefined') {
                var imageData = getImageByPath(category.image);
                if (imageData) {
                    imageSrc = imageData;
                } else {
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
                imageSrc = category.image;
            }
        }
        imageHtml = '<img src="' + imageSrc + '" alt="' + category.name + '" class="category-admin-card__image">';
    } else {
        imageHtml = '<div class="category-admin-card__icon category-admin-card__icon--' + category.icon + '"></div>';
    }
    
    card.innerHTML = 
        '<div class="category-admin-card__preview">' +
            imageHtml +
        '</div>' +
        '<div class="category-admin-card__info">' +
            '<h4 class="category-admin-card__name">' + category.name + '</h4>' +
        '</div>' +
        '<div class="category-admin-card__actions">' +
            '<label class="admin-btn admin-btn--small admin-btn--primary" for="category-image-' + category.id + '">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>' +
                    '<polyline points="17 8 12 3 7 8"></polyline>' +
                    '<line x1="12" y1="3" x2="12" y2="15"></line>' +
                '</svg>' +
                'Rasm yuklash' +
            '</label>' +
            '<input type="file" id="category-image-' + category.id + '" accept="image/*" style="display: none;" onchange="handleCategoryImageUpload(\'' + category.id + '\', this.files[0])">' +
            (category.image ? '<button class="admin-btn admin-btn--small admin-btn--danger" onclick="removeCategoryImageAdmin(\'' + category.id + '\')">Rasmni o\'chirish</button>' : '') +
        '</div>';

    return card;
}

// Обработка загрузки изображения категории
function handleCategoryImageUpload(categoryId, file) {
    if (!file) {
        return;
    }

    // Валидация изображения
    var validation = validateImage(file, 2);
    if (!validation.valid) {
        if (typeof showError !== 'undefined') {
            showError(validation.error);
        } else {
            alert(validation.error);
        }
        return;
    }

    // Конвертация в base64 для сохранения в localStorage
    // В реальном приложении здесь будет загрузка на сервер
    convertFileToBase64(file, function(base64) {
        if (base64) {
            // Сохранить base64 в localStorage
            updateCategoryImage(categoryId, base64);
            displayCategories();
            // Обновить категории на главной странице, если она открыта
            if (typeof window.updateCategoriesOnMainPage === 'function') {
                window.updateCategoriesOnMainPage();
            }
            if (typeof showSuccess !== 'undefined') {
                showSuccess('Rasm muvaffaqiyatli yuklandi!');
            } else {
                alert('Rasm muvaffaqiyatli yuklandi!');
            }
        } else {
            if (typeof showError !== 'undefined') {
                showError('Rasmni yuklashda xatolik');
            } else {
                alert('Rasmni yuklashda xatolik');
            }
        }
    });
}

// Сохранение файла в папку (для локальной разработки)
// В реальном приложении это будет загрузка на сервер через API
function saveFileToFolder(file, filePath, callback) {
    // В браузере мы не можем напрямую сохранять файлы в файловую систему
    // Поэтому используем base64 как основной способ, но сохраняем информацию о пути
    // В реальном приложении здесь будет загрузка на сервер
    
    // Для локальной разработки: сохраняем base64, но запоминаем путь для будущего использования
    convertFileToBase64(file, function(base64) {
        if (base64) {
            // Сохранить информацию о файле
            var fileInfo = {
                path: filePath,
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            };
            
            // Сохранить в localStorage с ключом по пути
            try {
                localStorage.setItem('file_' + filePath, JSON.stringify(fileInfo));
                callback(true, filePath);
            } catch(e) {
                if (typeof logError !== 'undefined') {
                    logError('Xatolik: fayl ma\'lumotlarini saqlashda xatolik', e);
                }
                callback(false, null);
            }
        } else {
            callback(false, null);
        }
    });
}

// Получение изображения по пути (для локальной разработки)
function getImageByPath(filePath) {
    try {
        var fileInfo = localStorage.getItem('file_' + filePath);
        if (fileInfo) {
            var info = JSON.parse(fileInfo);
            return info.data; // Возвращаем base64 данные
        }
    } catch(e) {
        if (typeof logError !== 'undefined') {
            logError('Fayl ma\'lumotlarini olishda xatolik', e);
        }
    }
    return null;
}

// Удаление изображения категории
function removeCategoryImageAdmin(categoryId) {
    var category = getCategoryById(categoryId);
    if (!category) {
        return;
    }

    var confirmMessage = 'Kategoriya rasmini o\'chirishni xohlaysizmi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            removeCategoryImage(categoryId);
            displayCategories();
            if (typeof window.updateCategoriesOnMainPage === 'function') {
                window.updateCategoriesOnMainPage();
            }
        });
        return;
    }
    
    if (confirm(confirmMessage)) {
        removeCategoryImage(categoryId);
        displayCategories();
        // Обновить категории на главной странице
        if (typeof window.updateCategoriesOnMainPage === 'function') {
            window.updateCategoriesOnMainPage();
        }
    }
}

// Отображение списка категорий
function displayCategories() {
    var categoriesGrid = document.getElementById('categories-admin-grid');
    if (!categoriesGrid) {
        return;
    }

    categoriesGrid.innerHTML = '';

    var categories = getAllCategories();
    var categoryIds = Object.keys(categories);

    for (var i = 0; i < categoryIds.length; i++) {
        var categoryId = categoryIds[i];
        var category = categories[categoryId];
        var card = createCategoryAdminCard(category);
        categoriesGrid.appendChild(card);
    }
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.getImageByPath = getImageByPath;
    window.saveFileToFolder = saveFileToFolder;
}

// Инициализация модуля
function initAdminCategories() {
    displayCategories();
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminCategories);
} else {
    initAdminCategories();
}

