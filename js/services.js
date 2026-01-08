// Модуль управления сервисами доставки
// Простая реализация без использования сложных техник

// Конфигурация сервисов
var servicesConfig = {
    products: {
        name: 'Mahsulotlar',
        searchPlaceholder: 'Mahsulotlarni qidirish...'
    }
    // В будущем здесь можно добавить:
    // food: { name: 'Еда', searchPlaceholder: 'Поиск ресторанов...' },
    // pharmacy: { name: 'Аптека', searchPlaceholder: 'Поиск лекарств...' }
};

// Текущий активный сервис
var currentService = 'products';

// Функция для переключения сервиса
function switchService(serviceId) {
    if (!servicesConfig[serviceId]) {
        if (typeof logError !== 'undefined') {
            logError('Servis topilmadi', { serviceId: serviceId });
        }
        return;
    }

    // Скрыть все сервисы
    var allServices = document.querySelectorAll('.service-content');
    for (var i = 0; i < allServices.length; i++) {
        allServices[i].classList.add('service-hidden');
    }

    // Показать выбранный сервис
    var selectedService = document.getElementById('service-' + serviceId);
    if (selectedService) {
        selectedService.classList.remove('service-hidden');
        currentService = serviceId;
    }

    // Обновить активное состояние в навигации
    var navItems = document.querySelectorAll('.bottom-nav__item');
    for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove('bottom-nav__item--active');
    }

    var activeNavItem = document.querySelector('.bottom-nav__item[data-service="' + serviceId + '"]');
    if (activeNavItem) {
        activeNavItem.classList.add('bottom-nav__item--active');
    }

    // Обновить placeholder поиска
    var searchInput = document.getElementById('search-input');
    if (searchInput && servicesConfig[serviceId].searchPlaceholder) {
        searchInput.placeholder = servicesConfig[serviceId].searchPlaceholder;
    }
}

// Инициализация при загрузке страницы
function initServices() {
    // Установить начальный сервис
    switchService('products');

    // Добавить обработчики кликов на навигацию
    var navItems = document.querySelectorAll('.bottom-nav__item[data-service]');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function(event) {
            event.preventDefault();
            var serviceId = this.getAttribute('data-service');
            switchService(serviceId);
        });
    }
}

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServices);
} else {
    initServices();
}

