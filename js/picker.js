// Модуль для панели сборщика (Picker)
// Простая реализация без использования сложных техник

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
}

// Форматирование даты
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Получение названия статуса
function getStatusName(status) {
    var statusNames = {
        'new': 'Yangi',
        'picking': 'Yig'ilmoqda',
        'ready': 'Tayyor',
        'delivering': 'Yetkazilmoqda',
        'completed': 'Yakunlangan',
        'cancelled': 'Bekor qilingan'
    };
    return statusNames[status] || status;
}

// Создание списка товаров
function createItemsList(items) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        html += '<li class="order-card__item">' +
            item.name + ' × ' + item.quantity + ' = ' + formatPrice(item.price * item.quantity) +
        '</li>';
    }
    return html;
}

// Создание карточки заказа для сборщика
function createPickerOrderCard(order) {
    var card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = 
        '<div class="order-card__header">' +
            '<div class="order-card__info">' +
                '<h3 class="order-card__title">Buyurtma #' + order.id + '</h3>' +
                '<span class="order-status order-status--' + order.status + '">' + getStatusName(order.status) + '</span>' +
            '</div>' +
            '<p class="order-card__date">' + formatDate(order.createdAt) + '</p>' +
        '</div>' +
        '<div class="order-card__body">' +
            '<div class="order-card__customer">' +
                '<p class="order-card__customer-name">' + order.customerName + '</p>' +
                '<p class="order-card__customer-phone">' + order.customerPhone + '</p>' +
                '<p class="order-card__customer-address">' + order.customerAddress + '</p>' +
            '</div>' +
            '<div class="order-card__items">' +
                '<p class="order-card__items-title">Mahsulotlar:</p>' +
                '<ul class="order-card__items-list">' + createItemsList(order.items) + '</ul>' +
            '</div>' +
            '<div class="order-card__footer">' +
                '<p class="order-card__total">Jami: ' + formatPrice(order.total) + '</p>' +
                createPickerActionButtons(order) +
            '</div>' +
        '</div>';

    return card;
}

// Создание кнопок действий для сборщика
function createPickerActionButtons(order) {
    var html = '<div class="order-card__actions">';
    
    if (order.status === 'new') {
        html += '<button class="order-card__btn order-card__btn--primary" onclick="startPicking(' + order.id + ')">Yig\'ishni boshlash</button>';
    }
    
    if (order.status === 'picking') {
        html += '<button class="order-card__btn order-card__btn--success" onclick="completePicking(' + order.id + ')">Yig\'ishni yakunlash</button>';
    }
    
    html += '</div>';
    return html;
}

// Начать сборку заказа
function startPicking(orderId) {
    var confirmMessage = 'Buyurtma #' + orderId + ' yig\'ishni boshlashni xohlaysizmi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'picking');
                displayPickerOrders();
                if (typeof showSuccess !== 'undefined') {
                    showSuccess('Yig\'ish boshlandi');
                }
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'picking');
                displayPickerOrders();
            }
        }
    }
}

// Завершить сборку заказа
function completePicking(orderId) {
    var confirmMessage = 'Buyurtma #' + orderId + ' yig\'ishni yakunlashni xohlaysizmi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'ready');
                displayPickerOrders();
                if (typeof showSuccess !== 'undefined') {
                    showSuccess('Yig\'ish yakunlandi. Buyurtma tayyor');
                }
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'ready');
                displayPickerOrders();
            }
        }
    }
}

// Отображение заказов для сборщика
function displayPickerOrders() {
    var pickingOrdersList = document.getElementById('picking-orders');
    if (!pickingOrdersList) {
        return;
    }

    pickingOrdersList.innerHTML = '';

    var allOrders = getAllOrders();
    
    // Показать только заказы со статусом new и picking
    var pickingOrders = [];
    for (var i = 0; i < allOrders.length; i++) {
        if (allOrders[i].status === 'new' || allOrders[i].status === 'picking') {
            pickingOrders.push(allOrders[i]);
        }
    }

    // Сортировать по дате (новые первыми)
    pickingOrders.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (pickingOrders.length === 0) {
        pickingOrdersList.innerHTML = '<p class="empty-message">Yig'ilmoqda bo\'lgan buyurtmalar yo\'q</p>';
        return;
    }

    for (var j = 0; j < pickingOrders.length; j++) {
        var card = createPickerOrderCard(pickingOrders[j]);
        pickingOrdersList.appendChild(card);
    }
}

// Инициализация панели сборщика
function initPicker() {
    displayPickerOrders();
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPicker);
} else {
    initPicker();
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.startPicking = startPicking;
    window.completePicking = completePicking;
}

