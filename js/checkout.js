// Модуль страницы оформления заказа
// Простая реализация без использования сложных техник

// Отображение товаров в заказе
function displayCheckoutItems() {
    var checkoutItemsContainer = document.getElementById('checkout-items');
    var checkoutTotal = document.getElementById('checkout-total');
    
    if (!checkoutItemsContainer) {
        return;
    }

    var cartItems = getCartItems();
    
    if (cartItems.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    checkoutItemsContainer.innerHTML = '';

    var total = 0;

    for (var i = 0; i < cartItems.length; i++) {
        var item = cartItems[i];
        var product = getProductById(item.productId);
        
        if (!product) {
            continue;
        }

        var price = product.price || 0;
        var quantity = item.quantity || 1;
        var itemTotal = price * quantity;
        total += itemTotal;

        var checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = 
            '<div class="checkout-item__info">' +
                '<span class="checkout-item__name">' + product.name + '</span>' +
                '<span class="checkout-item__quantity">× ' + quantity + '</span>' +
            '</div>' +
            '<span class="checkout-item__price">' + formatPrice(itemTotal) + ' so\'m</span>';

        checkoutItemsContainer.appendChild(checkoutItem);
    }

    if (checkoutTotal) {
        checkoutTotal.textContent = formatPrice(total) + ' so\'m';
    }
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price);
}

// Обработка отправки формы
function handleCheckoutSubmit(event) {
    event.preventDefault();
    
    var submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn && typeof showButtonLoading !== 'undefined') {
        showButtonLoading(submitBtn);
    }

    var cartItems = getCartItems();
    if (cartItems.length === 0) {
        showError('Savat bo\'sh');
        setTimeout(function() {
            window.location.href = 'cart.html';
        }, 1500);
        return;
    }

    // Получить данные формы
    var customerNameInput = document.getElementById('customer-name');
    var customerPhoneInput = document.getElementById('customer-phone');
    var customerAddressInput = document.getElementById('customer-address');
    var deliveryTime = document.getElementById('delivery-time').value;
    var orderCommentInput = document.getElementById('order-comment');
    
    var customerName = sanitizeString(customerNameInput.value);
    var customerPhone = customerPhoneInput.value.trim();
    var customerAddress = sanitizeString(customerAddressInput.value);
    var orderComment = sanitizeString(orderCommentInput.value);

    // Валидация имени
    if (!validateName(customerName)) {
        if (submitBtn && typeof hideButtonLoading !== 'undefined') {
            hideButtonLoading(submitBtn);
        }
        showError('Ism kamida 2 ta belgidan iborat bo\'lishi kerak va faqat harflardan iborat bo\'lishi kerak');
        customerNameInput.focus();
        return;
    }

    // Валидация телефона
    if (!validatePhone(customerPhone)) {
        if (submitBtn && typeof hideButtonLoading !== 'undefined') {
            hideButtonLoading(submitBtn);
        }
        showError('Telefon raqami noto\'g\'ri formatda. Format: +998 XX XXX XX XX');
        customerPhoneInput.focus();
        return;
    }
    
    // Форматировать телефон
    customerPhone = formatPhone(customerPhone);

    // Валидация адреса
    if (!validateAddress(customerAddress)) {
        if (submitBtn && typeof hideButtonLoading !== 'undefined') {
            hideButtonLoading(submitBtn);
        }
        showError('Manzil kamida 10 ta belgidan iborat bo\'lishi kerak');
        customerAddressInput.focus();
        return;
    }

    // Подготовить товары для заказа
    var orderItems = [];
    var total = 0;

    for (var i = 0; i < cartItems.length; i++) {
        var item = cartItems[i];
        var product = getProductById(item.productId);
        
        if (!product) {
            continue;
        }

        var price = product.price || 0;
        var quantity = item.quantity || 1;
        var itemTotal = price * quantity;

        orderItems.push({
            name: product.name,
            quantity: quantity,
            price: price
        });

        total += itemTotal;
    }

    // Создать заказ
    var orderData = {
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        items: orderItems,
        total: total,
        deliveryTime: deliveryTime,
        comment: orderComment
    };

    // Создать заказ через модуль orders
    if (typeof createOrder !== 'undefined') {
        var order = createOrder(orderData);
        
        // Очистить корзину
        if (typeof clearCart !== 'undefined') {
            clearCart();
        }

        // Скрыть loading
        if (submitBtn && typeof hideButtonLoading !== 'undefined') {
            hideButtonLoading(submitBtn);
        }
        
        // Показать сообщение об успехе
        showSuccess('Buyurtma muvaffaqiyatli qabul qilindi! Buyurtma raqami: #' + order.id);
        
        // Перейти на главную страницу через 2 секунды
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        if (submitBtn && typeof hideButtonLoading !== 'undefined') {
            hideButtonLoading(submitBtn);
        }
        showError('Xatolik: buyurtma yaratishda xatolik');
    }
}

// Инициализация страницы
function initCheckout() {
    displayCheckoutItems();
    
    // Обработчик формы
    var checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    initCheckout();
}

