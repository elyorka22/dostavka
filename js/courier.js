// Модуль для панели курьера (Courier)
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

// Создание карточки заказа для курьера
function createCourierOrderCard(order) {
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
                createCourierActionButtons(order) +
            '</div>' +
        '</div>';

    return card;
}

// Создание кнопок действий для курьера
function createCourierActionButtons(order) {
    var html = '<div class="order-card__actions">';
    
    if (order.status === 'ready') {
        html += '<button class="order-card__btn order-card__btn--primary" onclick="startDelivery(' + order.id + ')">Yetkazishni boshlash</button>';
    }
    
    if (order.status === 'delivering') {
        html += '<button class="order-card__btn order-card__btn--success" onclick="completeDelivery(' + order.id + ')">Yetkazib berildi</button>';
    }
    
    html += '</div>';
    return html;
}

// Начать доставку заказа
function startDelivery(orderId) {
    var confirmMessage = 'Buyurtma #' + orderId + ' yetkazishni boshlashni xohlaysizmi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'delivering');
                displayCourierOrders();
                if (typeof showSuccess !== 'undefined') {
                    showSuccess('Yetkazish boshlandi');
                }
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'delivering');
                displayCourierOrders();
            }
        }
    }
}

// Завершить доставку заказа
function completeDelivery(orderId) {
    var confirmMessage = 'Buyurtma #' + orderId + ' muvaffaqiyatli yetkazib berildimi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'completed');
                displayCourierOrders();
                if (typeof showSuccess !== 'undefined') {
                    showSuccess('Buyurtma muvaffaqiyatli yetkazib berildi');
                }
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            if (typeof updateOrderStatus !== 'undefined') {
                updateOrderStatus(orderId, 'completed');
                displayCourierOrders();
            }
        }
    }
}

// Отображение заказов для курьера
function displayCourierOrders() {
    var readyOrdersList = document.getElementById('ready-orders');
    if (!readyOrdersList) {
        return;
    }

    readyOrdersList.innerHTML = '';

    var allOrders = getAllOrders();
    
    // Показать только заказы со статусом ready и delivering
    var courierOrders = [];
    for (var i = 0; i < allOrders.length; i++) {
        if (allOrders[i].status === 'ready' || allOrders[i].status === 'delivering') {
            courierOrders.push(allOrders[i]);
        }
    }

    // Сортировать по дате (новые первыми)
    courierOrders.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (courierOrders.length === 0) {
        readyOrdersList.innerHTML = '<p class="empty-message">Tayyor buyurtmalar yo\'q</p>';
        return;
    }

    for (var j = 0; j < courierOrders.length; j++) {
        var card = createCourierOrderCard(courierOrders[j]);
        readyOrdersList.appendChild(card);
    }
}

// Инициализация панели курьера
function initCourier() {
    displayCourierOrders();
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCourier);
} else {
    initCourier();
}

// Экспорт функций для глобального доступа
if (typeof window !== 'undefined') {
    window.startDelivery = startDelivery;
    window.completeDelivery = completeDelivery;
}

