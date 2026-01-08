// Модуль страницы корзины
// Простая реализация без использования сложных техник

// Отображение товаров в корзине
function displayCartItems() {
    var cartItemsContainer = document.getElementById('cart-items');
    var cartEmpty = document.getElementById('cart-empty');
    var cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsContainer) {
        return;
    }

    var cartItems = getCartItems();
    
    // Если корзина пуста
    if (cartItems.length === 0) {
        cartItemsContainer.style.display = 'none';
        if (cartEmpty) {
            cartEmpty.style.display = 'flex';
        }
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }

    // Показать корзину
    cartItemsContainer.style.display = 'block';
    if (cartEmpty) {
        cartEmpty.style.display = 'none';
    }
    if (cartSummary) {
        cartSummary.style.display = 'block';
    }

    cartItemsContainer.innerHTML = '';

    for (var i = 0; i < cartItems.length; i++) {
        var item = cartItems[i];
        var product = getProductById(item.productId);
        
        if (!product) {
            continue;
        }

        var cartItemCard = createCartItemCard(product, item);
        cartItemsContainer.appendChild(cartItemCard);
    }

    // Обновить итоговую сумму
    updateCartSummary();
}

// Создание карточки товара в корзине
function createCartItemCard(product, cartItem) {
    var card = document.createElement('div');
    card.className = 'cart-item';
    card.setAttribute('data-product-id', product.id);

    var price = product.price || 0;
    var quantity = cartItem.quantity || 1;
    var total = price * quantity;

    card.innerHTML = 
        '<div class="cart-item__image">' +
            '<img src="' + (product.image || '') + '" alt="' + product.name + '" onerror="this.style.display=\'none\'">' +
        '</div>' +
        '<div class="cart-item__info">' +
            '<h3 class="cart-item__name">' + product.name + '</h3>' +
            '<p class="cart-item__unit">' + (cartItem.unit || product.unit || 'шт') + '</p>' +
            '<p class="cart-item__price">' + formatPrice(price) + ' / ' + (cartItem.unit || product.unit || 'шт') + '</p>' +
        '</div>' +
        '<div class="cart-item__controls">' +
            '<button class="cart-item__btn cart-item__btn--minus" onclick="decreaseQuantity(' + product.id + ')">-</button>' +
            '<span class="cart-item__quantity">' + quantity + '</span>' +
            '<button class="cart-item__btn cart-item__btn--plus" onclick="increaseQuantity(' + product.id + ')">+</button>' +
        '</div>' +
        '<div class="cart-item__total">' +
            '<span class="cart-item__total-value">' + formatPrice(total) + ' so\'m</span>' +
        '</div>' +
        '<button class="cart-item__remove" onclick="removeFromCartPage(' + product.id + ')" aria-label="O\'chirish">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M18 6L6 18M6 6l12 12"></path>' +
            '</svg>' +
        '</button>';

    return card;
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price);
}

// Увеличение количества
function increaseQuantity(productId) {
    var cartItems = getCartItems();
    var item = null;
    
    for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i].productId == productId) {
            item = cartItems[i];
            break;
        }
    }
    
    if (item) {
        var newQuantity = item.quantity + 1;
        updateCartItemQuantity(productId, newQuantity);
    }
    
    displayCartItems();
}

// Уменьшение количества
function decreaseQuantity(productId) {
    var cartItems = getCartItems();
    var item = null;
    
    for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i].productId == productId) {
            item = cartItems[i];
            break;
        }
    }
    
    if (item && item.quantity > 1) {
        var newQuantity = item.quantity - 1;
        updateCartItemQuantity(productId, newQuantity);
    } else {
        removeFromCartPage(productId);
    }
    
    displayCartItems();
}

// Удаление из корзины
function removeFromCartPage(productId) {
    var confirmMessage = 'Bu mahsulotni savatdan o\'chirmoqchimisiz?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            removeFromCart(productId);
            displayCartItems();
        });
    } else {
        if (confirm(confirmMessage)) {
            removeFromCart(productId);
            displayCartItems();
        }
    }
}

// Обновление итоговой суммы
function updateCartSummary() {
    var total = getCartTotalPrice();
    var totalElement = document.getElementById('cart-total');
    var checkoutBtn = document.getElementById('checkout-btn');
    
    if (totalElement) {
        totalElement.textContent = formatPrice(total) + ' so\'m';
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = total === 0;
    }
}

// Переход к оформлению заказа
function goToCheckout() {
    var cartItems = getCartItems();
    if (cartItems.length === 0) {
        if (typeof showError !== 'undefined') {
            showError('Savat bo\'sh');
        } else {
            alert('Savat bo\'sh');
        }
        return;
    }
    window.location.href = 'checkout.html';
}

// Инициализация страницы
function initCartPage() {
    displayCartItems();
    
    // Обработчик кнопки оформления заказа
    var checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', goToCheckout);
    }
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartPage);
} else {
    initCartPage();
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.increaseQuantity = increaseQuantity;
    window.decreaseQuantity = decreaseQuantity;
    window.removeFromCartPage = removeFromCartPage;
}

