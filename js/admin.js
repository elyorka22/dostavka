// Модуль для панели супер-админа
// Простая реализация без использования сложных техник

// Обновление статистики
function updateStatistics() {
    var stats = getOrdersStatistics();

    // Обновить общую статистику
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-today').textContent = stats.todayOrders;
    document.getElementById('stat-revenue').textContent = formatPrice(stats.totalRevenue);
    document.getElementById('stat-today-revenue').textContent = formatPrice(stats.todayRevenue);

    // Обновить статистику по статусам
    document.getElementById('status-new').textContent = stats.byStatus.new || 0;
    document.getElementById('status-picking').textContent = stats.byStatus.picking || 0;
    document.getElementById('status-ready').textContent = stats.byStatus.ready || 0;
    document.getElementById('status-delivering').textContent = stats.byStatus.delivering || 0;
    document.getElementById('status-completed').textContent = stats.byStatus.completed || 0;
    document.getElementById('status-cancelled').textContent = stats.byStatus.cancelled || 0;
}

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
        'picking': 'Yig\'ilmoqda',
        'ready': 'Tayyor',
        'delivering': 'Yetkazilmoqda',
        'completed': 'Yakunlangan',
        'cancelled': 'Bekor qilingan'
    };
    return statusNames[status] || status;
}

// Получение класса статуса
function getStatusClass(status) {
    var statusClasses = {
        'new': 'order-status--new',
        'picking': 'order-status--picking',
        'ready': 'order-status--ready',
        'delivering': 'order-status--delivering',
        'completed': 'order-status--completed',
        'cancelled': 'order-status--cancelled'
    };
    return statusClasses[status] || '';
}

// Создание карточки заказа
function createOrderCard(order) {
    var card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = 
        '<div class="order-card__header">' +
            '<div class="order-card__info">' +
                '<h3 class="order-card__title">Buyurtma #' + order.id + '</h3>' +
                '<span class="order-status ' + getStatusClass(order.status) + '">' + getStatusName(order.status) + '</span>' +
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
            '</div>' +
        '</div>';

    return card;
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

// Отображение всех заказов
function displayAllOrders() {
    var ordersList = document.getElementById('orders-list');
    if (!ordersList) {
        return;
    }

    ordersList.innerHTML = '';

    var orders = getAllOrders();
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="empty-message">Hozircha buyurtmalar yo\'q</p>';
        return;
    }

    // Сортировка заказов по дате (новые сначала)
    orders.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    for (var i = 0; i < orders.length; i++) {
        var card = createOrderCard(orders[i]);
        ordersList.appendChild(card);
    }
}

// Инициализация панели админа
function initAdminPanel() {
    updateStatistics();
    displayAllOrders();

    // Обновление статистики каждые 30 секунд
    setInterval(function() {
        updateStatistics();
        displayAllOrders();
    }, 30000);
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    initAdminPanel();
}

