// Модуль истории заказов пользователя
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

// Создание карточки заказа для пользователя
function createUserOrderCard(order) {
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

// Отображение заказов пользователя
function displayUserOrders() {
    var ordersList = document.getElementById('user-orders-list');
    var ordersEmpty = document.getElementById('orders-empty');
    
    if (!ordersList) {
        return;
    }

    // Получить текущего пользователя (если авторизован)
    var currentUser = null;
    if (typeof getCurrentUser !== 'undefined') {
        currentUser = getCurrentUser();
    } else if (typeof window.getCurrentUser !== 'undefined') {
        currentUser = window.getCurrentUser();
    }
    
    // Получить все заказы
    var allOrders = [];
    if (typeof getAllOrders !== 'undefined') {
        allOrders = getAllOrders();
    } else if (typeof window.getAllOrders !== 'undefined') {
        allOrders = window.getAllOrders();
    }
    
    // Фильтровать заказы
    var userOrders = [];
    
    if (currentUser) {
        // Если пользователь авторизован - показать его заказы по userId
        for (var i = 0; i < allOrders.length; i++) {
            if (allOrders[i].userId === currentUser.id) {
                userOrders.push(allOrders[i]);
            }
        }
    } else {
        // Если пользователь не авторизован - показать сообщение о необходимости авторизации
        // или можно показать заказы по телефону (если есть сохраненный телефон в localStorage)
        var savedPhone = localStorage.getItem('lastOrderPhone');
        if (savedPhone) {
            // Показать заказы по последнему использованному телефону
            for (var j = 0; j < allOrders.length; j++) {
                if (allOrders[j].customerPhone === savedPhone) {
                    userOrders.push(allOrders[j]);
                }
            }
        }
    }
    
    // Сортировать по дате (новые первыми)
    userOrders.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    if (userOrders.length === 0) {
        if (ordersEmpty) {
            ordersEmpty.style.display = 'flex';
        }
        ordersList.style.display = 'none';
        return;
    }
    
    if (ordersEmpty) {
        ordersEmpty.style.display = 'none';
    }
    ordersList.style.display = 'block';
    ordersList.innerHTML = '';
    
    for (var j = 0; j < userOrders.length; j++) {
        var card = createUserOrderCard(userOrders[j]);
        ordersList.appendChild(card);
    }
}

// Инициализация страницы
function initUserOrders() {
    displayUserOrders();
}

// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserOrders);
} else {
    initUserOrders();
}

