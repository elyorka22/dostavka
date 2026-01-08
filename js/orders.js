// Модуль управления заказами
// Простая реализация без использования сложных техник

// Хранилище заказов (в реальном приложении это будет сервер)
var ordersStorage = {
    orders: [],
    nextId: 1
};

// Статусы заказов
var orderStatuses = {
    NEW: 'new',
    PICKING: 'picking',
    READY: 'ready',
    DELIVERING: 'delivering',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

// Инициализация данных заказов из localStorage
function initOrdersStorage() {
    if (typeof safeLocalStorageGet !== 'undefined') {
        var result = safeLocalStorageGet('orders');
        if (result.success && result.data) {
            ordersStorage.orders = result.data.orders || [];
            ordersStorage.nextId = result.data.nextId || 1;
        } else if (result.error && typeof logError !== 'undefined') {
            logError('Buyurtmalarni yuklashda xatolik', result.error);
        }
    } else {
        // Fallback на старый способ
        var savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            try {
                var parsed = JSON.parse(savedOrders);
                ordersStorage.orders = parsed.orders || [];
                ordersStorage.nextId = parsed.nextId || 1;
            } catch (e) {
                if (typeof logError !== 'undefined') {
                    logError('Buyurtmalarni yuklashda xatolik', e);
                }
            }
        }
    }
}

// Сохранение заказов в localStorage
function saveOrders() {
    var ordersData = {
        orders: ordersStorage.orders,
        nextId: ordersStorage.nextId
    };
    
    if (typeof safeLocalStorageSet !== 'undefined') {
        var result = safeLocalStorageSet('orders', ordersData);
        if (!result.success && typeof logError !== 'undefined') {
            logError('Buyurtmalarni saqlashda xatolik', result.error);
        }
    } else {
        // Fallback на старый способ
        try {
            localStorage.setItem('orders', JSON.stringify(ordersData));
        } catch (e) {
            if (typeof logError !== 'undefined') {
                logError('Buyurtmalarni saqlashda xatolik', e);
            }
        }
    }
}

// Создание нового заказа
function createOrder(orderData) {
    // Получить текущего пользователя (если авторизован)
    var currentUser = null;
    if (typeof getCurrentUser !== 'undefined') {
        currentUser = getCurrentUser();
    } else if (typeof window.getCurrentUser !== 'undefined') {
        currentUser = window.getCurrentUser();
    }
    
    var order = {
        id: ordersStorage.nextId++,
        customerName: orderData.customerName || 'Mijoz',
        customerPhone: orderData.customerPhone || '',
        customerAddress: orderData.customerAddress || '',
        items: orderData.items || [],
        total: orderData.total || 0,
        status: orderStatuses.NEW,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser ? currentUser.id : null, // ID пользователя, если авторизован
        isGuest: !currentUser // Флаг гостевого заказа
    };
    
    // Добавить дополнительные данные из формы, если есть
    if (orderData.deliveryTime) {
        order.deliveryTime = orderData.deliveryTime;
    }
    if (orderData.comment) {
        order.comment = orderData.comment;
    }

    ordersStorage.orders.push(order);
    saveOrders();
    return order;
}

// Получение всех заказов
function getAllOrders() {
    return ordersStorage.orders;
}

// Получение заказа по ID
function getOrderById(orderId) {
    for (var i = 0; i < ordersStorage.orders.length; i++) {
        if (ordersStorage.orders[i].id === orderId) {
            return ordersStorage.orders[i];
        }
    }
    return null;
}

// Обновление статуса заказа
function updateOrderStatus(orderId, newStatus) {
    var order = getOrderById(orderId);
    if (!order) {
        return false;
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    saveOrders();
    return true;
}

// Получение заказов по статусу
function getOrdersByStatus(status) {
    var result = [];
    for (var i = 0; i < ordersStorage.orders.length; i++) {
        if (ordersStorage.orders[i].status === status) {
            result.push(ordersStorage.orders[i]);
        }
    }
    return result;
}

// Получение статистики заказов
function getOrdersStatistics() {
    var stats = {
        total: ordersStorage.orders.length,
        byStatus: {},
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0
    };

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var i = 0; i < ordersStorage.orders.length; i++) {
        var order = ordersStorage.orders[i];
        
        // Статистика по статусам
        if (!stats.byStatus[order.status]) {
            stats.byStatus[order.status] = 0;
        }
        stats.byStatus[order.status]++;

        // Общая выручка
        if (order.status === orderStatuses.COMPLETED) {
            stats.totalRevenue += order.total;
        }

        // Заказы за сегодня
        var orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        if (orderDate.getTime() === today.getTime()) {
            stats.todayOrders++;
            if (order.status === orderStatuses.COMPLETED) {
                stats.todayRevenue += order.total;
            }
        }
    }

    return stats;
}

// Инициализация при загрузке
initOrdersStorage();

// Создание тестовых заказов, если их нет
if (ordersStorage.orders.length === 0) {
    createOrder({
        customerName: 'Иван Иванов',
        customerPhone: '+7 (999) 123-45-67',
        customerAddress: 'Москва, ул. Ленина, д. 10, кв. 5',
        items: [
            { name: 'Помидоры черри', quantity: 2, price: 189 },
            { name: 'Бананы', quantity: 1, price: 89 }
        ],
        total: 467
    });

    createOrder({
        customerName: 'Мария Петрова',
        customerPhone: '+7 (999) 234-56-78',
        customerAddress: 'Москва, ул. Пушкина, д. 20, кв. 12',
        items: [
            { name: 'Куриная грудка', quantity: 1, price: 299 },
            { name: 'Сок апельсиновый', quantity: 2, price: 149 }
        ],
        total: 597
    });

    updateOrderStatus(1, orderStatuses.READY);
}

