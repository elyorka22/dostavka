// Модуль управления корзиной
// Простая реализация без использования сложных техник

// Хранилище корзины (в реальном приложении это будет сервер)
var cartStorage = {
    items: []
};

// Инициализация корзины из localStorage
function initCart() {
    if (typeof safeLocalStorageGet !== 'undefined') {
        var result = safeLocalStorageGet('cart');
        if (result.success) {
            if (result.data && result.data.items) {
                cartStorage.items = result.data.items || [];
            }
        } else {
            if (typeof logError !== 'undefined') {
                logError('Savatni yuklashda xatolik', result.error);
            }
        }
    } else {
        // Fallback на старый способ
        var savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                var parsed = JSON.parse(savedCart);
                cartStorage.items = parsed.items || [];
            } catch (e) {
                if (typeof logError !== 'undefined') {
                    logError('Savatni yuklashda xatolik', e);
                }
            }
        }
    }
    updateCartUI();
}

// Сохранение корзины в localStorage
function saveCart() {
    var cartData = {
        items: cartStorage.items
    };
    
    if (typeof safeLocalStorageSet !== 'undefined') {
        var result = safeLocalStorageSet('cart', cartData);
        if (result.success) {
            updateCartUI();
        } else {
            if (typeof showError !== 'undefined') {
                showError(result.error);
            } else if (typeof logError !== 'undefined') {
                logError('Savatni saqlashda xatolik', result.error);
            }
        }
    } else {
        // Fallback на старый способ
        try {
            localStorage.setItem('cart', JSON.stringify(cartData));
            updateCartUI();
        } catch (e) {
            if (typeof logError !== 'undefined') {
                logError('Savatni saqlashda xatolik', e);
            }
        }
    }
}

// Добавление товара в корзину
function addToCart(productId, quantity) {
    quantity = quantity || 1;
    
    // Найти товар
    var product = null;
    if (typeof getProductById !== 'undefined') {
        product = getProductById(productId);
    } else if (typeof window.getProductById !== 'undefined') {
        product = window.getProductById(productId);
    }
    
    // Если товар не найден через функцию, попробовать найти напрямую
    if (!product) {
        var allProducts = [];
        if (typeof getAllProducts !== 'undefined') {
            allProducts = getAllProducts();
        } else if (typeof window.getAllProducts !== 'undefined') {
            allProducts = window.getAllProducts();
        } else if (typeof productsStorage !== 'undefined' && productsStorage.products) {
            allProducts = productsStorage.products;
        } else if (typeof window.productsStorage !== 'undefined' && window.productsStorage.products) {
            allProducts = window.productsStorage.products;
        }
        
        // Преобразовать productId для сравнения
        var productIdNum = parseInt(productId);
        if (isNaN(productIdNum)) {
            productIdNum = productId;
        }
        
        for (var i = 0; i < allProducts.length; i++) {
            var prodId = parseInt(allProducts[i].id);
            if (isNaN(prodId)) {
                prodId = allProducts[i].id;
            }
            if (prodId == productIdNum || allProducts[i].id == productId) {
                product = allProducts[i];
                break;
            }
        }
    }
    
    if (!product) {
        if (typeof logError !== 'undefined') {
            logError('Mahsulot topilmadi', { productId: productId });
        }
        return false;
    }
    
    // Проверить, есть ли товар уже в корзине
    var existingItem = null;
    for (var i = 0; i < cartStorage.items.length; i++) {
        // Сравнить как число и как строку
        if (cartStorage.items[i].productId == productId || 
            parseInt(cartStorage.items[i].productId) == parseInt(productId)) {
            existingItem = cartStorage.items[i];
            break;
        }
    }
    
    if (existingItem) {
        // Увеличить количество
        existingItem.quantity += quantity;
    } else {
        // Добавить новый товар
        cartStorage.items.push({
            productId: productId,
            name: product.name,
            price: product.price,
            unit: product.unit || 'шт',
            weight: product.weight,
            quantity: quantity
        });
    }
    
    saveCart();
    return true;
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cartStorage.items = cartStorage.items.filter(function(item) {
        return item.productId !== productId;
    });
    saveCart();
}

// Изменение количества товара в корзине
function updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    for (var i = 0; i < cartStorage.items.length; i++) {
        // Сравнить как число и как строку
        if (cartStorage.items[i].productId == productId || 
            parseInt(cartStorage.items[i].productId) == parseInt(productId)) {
            cartStorage.items[i].quantity = quantity;
            saveCart();
            return;
        }
    }
}

// Получение всех товаров в корзине
function getCartItems() {
    return cartStorage.items;
}

// Получение общего количества товаров в корзине
function getCartTotalQuantity() {
    var total = 0;
    for (var i = 0; i < cartStorage.items.length; i++) {
        total += cartStorage.items[i].quantity;
    }
    return total;
}

// Получение общей стоимости корзины
function getCartTotalPrice() {
    var total = 0;
    for (var i = 0; i < cartStorage.items.length; i++) {
        total += cartStorage.items[i].price * cartStorage.items[i].quantity;
    }
    return total;
}

// Очистка корзины
function clearCart() {
    cartStorage.items = [];
    saveCart();
}

// Обновление UI корзины
function updateCartUI() {
    var cartCount = document.getElementById('cart-count');
    if (cartCount) {
        var totalQuantity = getCartTotalQuantity();
        if (totalQuantity > 0) {
            cartCount.textContent = totalQuantity > 99 ? '99+' : totalQuantity;
            cartCount.style.display = 'flex';
        } else {
            cartCount.textContent = '0';
            cartCount.style.display = 'none';
        }
    }
    
    // Обновить индикаторы на кнопках добавления
    if (typeof updateAllAddButtonIndicators !== 'undefined') {
        updateAllAddButtonIndicators();
    } else if (typeof window.updateAllAddButtonIndicators !== 'undefined') {
        window.updateAllAddButtonIndicators();
    }
}

// Инициализация при загрузке
initCart();

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateCartItemQuantity = updateCartItemQuantity;
    window.getCartItems = getCartItems;
    window.getCartTotalQuantity = getCartTotalQuantity;
    window.getCartTotalPrice = getCartTotalPrice;
    window.clearCart = clearCart;
    window.updateCartUI = updateCartUI;
    window.cartStorage = cartStorage;
}

