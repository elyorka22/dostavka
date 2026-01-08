// Модуль для панели менеджера
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

// Создание карточки заказа для менеджера
function createManagerOrderCard(order) {
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
                createActionButtons(order) +
            '</div>' +
        '</div>';

    return card;
}

// Получение названия статуса
function getStatusName(status) {
    var statusNames = {
        'new': 'Yangi',
        'picking': 'Yig\'ilmoqda',
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

// Создание кнопок действий
function createActionButtons(order) {
    var html = '<div class="order-card__actions">';

    // Для новых заказов - можно начать сборку
    if (order.status === 'new') {
        html += '<button class="order-card__btn order-card__btn--primary" onclick="startPicking(' + order.id + ')">Yig\'ishni boshlash</button>';
    }

    // Для заказов в сборке - можно закрыть после сборки
    if (order.status === 'picking') {
        html += '<button class="order-card__btn order-card__btn--success" onclick="closeAfterPicking(' + order.id + ')">Yig\'ishdan keyin yopish</button>';
    }

    // Для готовых заказов - можно отменить
    if (order.status === 'ready') {
        html += '<button class="order-card__btn order-card__btn--danger" onclick="cancelOrder(' + order.id + ')">Bekor qilish</button>';
    }

    html += '</div>';
    return html;
}

// Начать сборку заказа
function startPicking(orderId) {
    var confirmMessage = 'Buyurtma #' + orderId + ' yig\'ishni boshlashni xohlaysizmi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            updateOrderStatus(orderId, 'picking');
            displayOrders();
            if (typeof showSuccess !== 'undefined') {
                showSuccess('Yig\'ish boshlandi');
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            updateOrderStatus(orderId, 'picking');
            displayOrders();
        }
    }
}

// Закрыть заказ после сборки
function closeAfterPicking(orderId) {
    var confirmMessage = 'Buyurtma #' + orderId + ' yig\'ishdan keyin yopishni xohlaysizmi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            updateOrderStatus(orderId, 'ready');
            displayOrders();
            if (typeof showSuccess !== 'undefined') {
                showSuccess('Buyurtma tayyor');
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            updateOrderStatus(orderId, 'ready');
            displayOrders();
        }
    }
}

// Отменить заказ
function cancelOrder(orderId) {
    var confirmMessage = 'Buyurtma #' + orderId + ' bekor qilishni xohlaysizmi?';
    if (typeof showConfirm !== 'undefined') {
        showConfirm(confirmMessage, function() {
            updateOrderStatus(orderId, 'cancelled');
            displayOrders();
            if (typeof showSuccess !== 'undefined') {
                showSuccess('Buyurtma bekor qilindi');
            }
        });
    } else {
        if (confirm(confirmMessage)) {
            updateOrderStatus(orderId, 'cancelled');
            displayOrders();
        }
    }
}

// Отображение заказов
function displayOrders() {
    var incomingOrdersList = document.getElementById('incoming-orders');
    var readyOrdersList = document.getElementById('ready-orders');

    if (!incomingOrdersList || !readyOrdersList) {
        return;
    }

    incomingOrdersList.innerHTML = '';
    readyOrdersList.innerHTML = '';

    var allOrders = getAllOrders();
    
    // Новые заказы и заказы в сборке
    var incomingOrders = [];
    for (var i = 0; i < allOrders.length; i++) {
        if (allOrders[i].status === 'new' || allOrders[i].status === 'picking') {
            incomingOrders.push(allOrders[i]);
        }
    }

    // Готовые заказы
    var readyOrders = [];
    for (var j = 0; j < allOrders.length; j++) {
        if (allOrders[j].status === 'ready') {
            readyOrders.push(allOrders[j]);
        }
    }

    // Сортировка по дате (новые сначала)
    incomingOrders.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    readyOrders.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Отображение поступающих заказов
    if (incomingOrders.length === 0) {
        incomingOrdersList.innerHTML = '<p class="empty-message">Kelayotgan buyurtmalar yo\'q</p>';
    } else {
        for (var k = 0; k < incomingOrders.length; k++) {
            var card = createManagerOrderCard(incomingOrders[k]);
            incomingOrdersList.appendChild(card);
        }
    }

    // Отображение готовых заказов
    if (readyOrders.length === 0) {
        readyOrdersList.innerHTML = '<p class="empty-message">Tayyor buyurtmalar yo\'q</p>';
    } else {
        for (var l = 0; l < readyOrders.length; l++) {
            var readyCard = createManagerOrderCard(readyOrders[l]);
            readyOrdersList.appendChild(readyCard);
        }
    }
}

// Инициализация панели менеджера
function initManagerPanel() {
    displayOrders();

    // Обновление заказов каждые 30 секунд
    setInterval(function() {
        displayOrders();
    }, 30000);
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManagerPanel);
} else {
    initManagerPanel();
}

