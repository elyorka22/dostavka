// Модуль для обработки кликов на кнопки "Добавить в корзину"
// Простая реализация без использования сложных техник

// Обновление индикатора на кнопке добавления
function updateAddButtonIndicator(button, productId) {
    if (!button) return;
    
    // Получить количество товара в корзине
    var quantity = 0;
    var cartItems = [];
    
    try {
        if (typeof getCartItems !== 'undefined') {
            cartItems = getCartItems();
        } else if (typeof window.getCartItems !== 'undefined') {
            cartItems = window.getCartItems();
        } else if (typeof cartStorage !== 'undefined' && cartStorage.items) {
            cartItems = cartStorage.items;
        } else if (typeof window.cartStorage !== 'undefined' && window.cartStorage.items) {
            cartItems = window.cartStorage.items;
        }
    } catch(e) {
        if (typeof logError !== 'undefined') {
            logError('Xatolik: savat ma\'lumotlarini olishda xatolik', e);
        }
    }
    
    // Преобразовать productId в число для сравнения
    var productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
        productIdNum = productId;
    }
    
    for (var i = 0; i < cartItems.length; i++) {
        var itemId = parseInt(cartItems[i].productId);
        if (isNaN(itemId)) {
            itemId = cartItems[i].productId;
        }
        if (itemId == productIdNum || cartItems[i].productId == productId) {
            quantity = cartItems[i].quantity;
            break;
        }
    }
    
    // Найти или создать индикатор
    var indicator = button.querySelector('.product-card__add-indicator');
    
    if (quantity > 0) {
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'product-card__add-indicator product-card__add-indicator--visible';
            button.appendChild(indicator);
        }
        indicator.textContent = '+' + quantity;
        // Принудительно установить стили
        indicator.style.cssText = 'position: absolute; top: -8px; right: -8px; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 12px; background-color: #e74c3c; color: #ffffff; font-size: 11px; font-weight: 700; display: flex !important; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); border: 2px solid #ffffff; z-index: 11; visibility: visible !important; opacity: 1 !important;';
        indicator.classList.add('product-card__add-indicator--visible');
    } else {
        if (indicator) {
            indicator.style.display = 'none';
            indicator.style.visibility = 'hidden';
            indicator.classList.remove('product-card__add-indicator--visible');
        }
    }
}

// Обновление всех индикаторов на кнопках
function updateAllAddButtonIndicators() {
    var addButtons = document.querySelectorAll('.product-card__add-btn[data-product-id]');
    for (var i = 0; i < addButtons.length; i++) {
        var productId = addButtons[i].getAttribute('data-product-id');
        updateAddButtonIndicator(addButtons[i], productId);
    }
}

// Инициализация обработчиков для кнопок добавления в корзину
function initCartButtons() {
    // Обработчик для кнопок добавления в корзину
    document.addEventListener('click', function(event) {
        var addBtn = event.target.closest('.product-card__add-btn');
        if (addBtn) {
            event.preventDefault();
            var productId = addBtn.getAttribute('data-product-id');
            if (productId) {
                // Преобразовать ID в число, если нужно
                var id = parseInt(productId);
                if (isNaN(id)) {
                    id = productId;
                }
                
                var added = false;
                if (typeof addToCart !== 'undefined') {
                    added = addToCart(id, 1);
                } else if (typeof window.addToCart !== 'undefined') {
                    added = window.addToCart(id, 1);
                }
                
                // Обновить индикатор сразу после добавления
                if (added) {
                    // Небольшая задержка для обновления корзины
                    setTimeout(function() {
                        // Обновить индикатор на кнопке
                        updateAddButtonIndicator(addBtn, productId);
                        
                        // Обновить счетчик корзины в header
                        if (typeof updateCartUI !== 'undefined') {
                            updateCartUI();
                        } else if (typeof window.updateCartUI !== 'undefined') {
                            window.updateCartUI();
                        }
                    }, 100);
                    
                    // Дополнительное обновление для надежности
                    setTimeout(function() {
                        updateAddButtonIndicator(addBtn, productId);
                        if (typeof updateCartUI !== 'undefined') {
                            updateCartUI();
                        } else if (typeof window.updateCartUI !== 'undefined') {
                            window.updateCartUI();
                        }
                    }, 300);
                }
            }
        }
    });
    
    // Обработчик для кнопки корзины в header
    var cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            // Здесь можно открыть модальное окно корзины или перейти на страницу корзины
            var totalQuantity = 0;
            if (typeof getCartTotalQuantity !== 'undefined') {
                totalQuantity = getCartTotalQuantity();
            } else if (typeof window.getCartTotalQuantity !== 'undefined') {
                totalQuantity = window.getCartTotalQuantity();
            }
            if (typeof showInfo !== 'undefined') {
                showInfo('Savat: ' + totalQuantity + ' ta mahsulot');
            }
        });
    }
    
    // Обновить индикаторы при загрузке
    setTimeout(function() {
        updateAllAddButtonIndicators();
    }, 500);
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartButtons);
} else {
    initCartButtons();
}

// Экспорт функции для обновления индикаторов
if (typeof window !== 'undefined') {
    window.updateAllAddButtonIndicators = updateAllAddButtonIndicators;
    window.updateAddButtonIndicator = updateAddButtonIndicator;
}
