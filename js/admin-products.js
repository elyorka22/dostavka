// Модуль управления товарами в админ-панели
// Простая реализация без использования сложных техник

var currentEditingProductId = null;

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
}

// Получение названия категории
function getCategoryName(category) {
    var categoryNames = {
        'vegetables': 'Sabzavotlar',
        'fruits': 'Mevalar',
        'meat': 'Go\'sht',
        'drinks': 'Ichimliklar',
        'dairy': 'Sut mahsulotlari',
        'bakery': 'Non mahsulotlari'
    };
    return categoryNames[category] || category;
}

// Создание карточки товара для админ-панели
function createProductAdminCard(product) {
    var card = document.createElement('div');
    card.className = 'product-admin-card';
    card.innerHTML = 
        '<div class="product-admin-card__info">' +
            '<div class="product-admin-card__main">' +
                '<h4 class="product-admin-card__name">' + product.name + '</h4>' +
                '<span class="product-admin-card__category">' + getCategoryName(product.category) + '</span>' +
            '</div>' +
            '<div class="product-admin-card__details">' +
                '<p class="product-admin-card__weight">' + product.weight + '</p>' +
                '<p class="product-admin-card__price">' + formatPrice(product.price) + '</p>' +
                (product.badge ? '<span class="product-admin-card__badge">' + product.badge + '</span>' : '') +
            '</div>' +
        '</div>' +
        '<div class="product-admin-card__actions">' +
            '<button class="admin-btn admin-btn--small admin-btn--edit" onclick="editProduct(' + product.id + ')">O\'zgartirish</button>' +
            '<button class="admin-btn admin-btn--small admin-btn--danger" onclick="deleteProductAdmin(' + product.id + ')">O\'chirish</button>' +
        '</div>';

    return card;
}

// Отображение списка товаров
function displayProducts() {
    var productsList = document.getElementById('products-admin-list');
    if (!productsList) {
        return;
    }

    productsList.innerHTML = '';

    var products = getAllProducts();

    if (products.length === 0) {
        productsList.innerHTML = '<p class="empty-message">Товаров пока нет</p>';
        return;
    }

    // Сортировка по ID (новые сначала)
    products.sort(function(a, b) {
        return b.id - a.id;
    });

    for (var i = 0; i < products.length; i++) {
        var card = createProductAdminCard(products[i]);
        productsList.appendChild(card);
    }
}

// Открытие модального окна для добавления товара
function openAddProductModal() {
    currentEditingProductId = null;
    var modal = document.getElementById('product-modal');
    var modalTitle = document.getElementById('modal-title');
    var form = document.getElementById('product-form');

    modalTitle.textContent = 'Mahsulot qo\'shish';
    form.reset();
    // Очистить custom badge input
    var badgeCustom = document.getElementById('product-badge-custom');
    if (badgeCustom) {
        badgeCustom.value = '';
    }
    modal.classList.add('modal--open');
}

// Открытие модального окна для редактирования товара
function editProduct(productId) {
    currentEditingProductId = productId;
    var product = getProductById(productId);
    
    if (!product) {
        alert('Mahsulot topilmadi');
        return;
    }

    var modal = document.getElementById('product-modal');
    var modalTitle = document.getElementById('modal-title');
    var form = document.getElementById('product-form');

    modalTitle.textContent = 'Mahsulotni o\'zgartirish';
    
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-weight').value = product.weight;
    document.getElementById('product-unit').value = product.unit || 'шт';
    document.getElementById('product-price').value = product.price;
    
    // Установить badge
    var badgeSelect = document.getElementById('product-badge');
    var badgeCustom = document.getElementById('product-badge-custom');
    if (product.badge) {
        // Проверить, есть ли badge в списке
        var badgeOption = Array.from(badgeSelect.options).find(function(opt) {
            return opt.value === product.badge;
        });
        if (badgeOption) {
            badgeSelect.value = product.badge;
            badgeCustom.value = '';
        } else {
            badgeSelect.value = '';
            badgeCustom.value = product.badge;
        }
    } else {
        badgeSelect.value = '';
        badgeCustom.value = '';
    }

    modal.classList.add('modal--open');
}

// Удаление товара
function deleteProductAdmin(productId) {
    var product = getProductById(productId);
    if (!product) {
        return;
    }

    if (confirm('Mahsulotni "' + product.name + '" o\'chirishni xohlaysizmi?')) {
        deleteProduct(productId);
        displayProducts();
    }
}

// Закрытие модального окна
function closeProductModal() {
    var modal = document.getElementById('product-modal');
    modal.classList.remove('modal--open');
    currentEditingProductId = null;
}

// Обработка отправки формы
function handleProductFormSubmit(event) {
    event.preventDefault();

    // Получить badge из select или custom input
    var badgeSelect = document.getElementById('product-badge');
    var badgeCustom = document.getElementById('product-badge-custom');
    var badge = '';
    if (badgeCustom && badgeCustom.value.trim()) {
        badge = badgeCustom.value.trim();
    } else if (badgeSelect && badgeSelect.value) {
        badge = badgeSelect.value;
    }
    
    var nameInput = document.getElementById('product-name');
    var priceInput = document.getElementById('product-price');
    var weightInput = document.getElementById('product-weight');
    
    var productName = sanitizeString(nameInput.value);
    var productPrice = priceInput.value;
    var productWeight = sanitizeString(weightInput.value);
    
    // Валидация имени
    if (!productName || productName.length < 2) {
        if (typeof showError !== 'undefined') {
            showError('Mahsulot nomini kiriting (kamida 2 ta belgi)');
        } else {
            alert('Mahsulot nomini kiriting');
        }
        nameInput.focus();
        return;
    }
    
    // Валидация цены
    if (!validatePrice(productPrice)) {
        if (typeof showError !== 'undefined') {
            showError('Narx noto\'g\'ri. Faqat musbat sonlar qabul qilinadi');
        } else {
            alert('Narx noto\'g\'ri');
        }
        priceInput.focus();
        return;
    }
    
    var productData = {
        name: productName,
        category: document.getElementById('product-category').value,
        weight: productWeight,
        unit: productUnit,
        price: parseFloat(productPrice),
        badge: badge
    };

    if (currentEditingProductId) {
        // Редактирование существующего товара
        if (updateProduct(currentEditingProductId, productData)) {
            closeProductModal();
            displayProducts();
        } else {
            if (typeof showError !== 'undefined') {
                showError('Mahsulotni yangilashda xatolik');
            } else {
                alert('Mahsulotni yangilashda xatolik');
            }
        }
    } else {
        // Создание нового товара
        createProduct(productData);
        closeProductModal();
        displayProducts();
    }
}

// Инициализация модуля
function initAdminProducts() {
    displayProducts();

    // Кнопка добавления товара
    var addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddProductModal);
    }

    // Кнопка закрытия модального окна
    var closeBtn = document.getElementById('modal-close');
    var cancelBtn = document.getElementById('modal-cancel');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProductModal);
    }

    // Закрытие при клике на overlay
    var modal = document.getElementById('product-modal');
    if (modal) {
        var overlay = modal.querySelector('.modal__overlay');
        if (overlay) {
            overlay.addEventListener('click', closeProductModal);
        }
    }

    // Обработка формы
    var form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', handleProductFormSubmit);
    }
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminProducts);
} else {
    initAdminProducts();
}

