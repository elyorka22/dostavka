// Конфигурация Firebase
// Простая реализация без использования сложных техник

// Firebase конфигурация
// Получает значения из переменных окружения или использует значения по умолчанию
function getFirebaseConfig() {
    // Попытка получить из переменных окружения (для Vercel)
    if (typeof process !== 'undefined' && process.env) {
        return {
            apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
            projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
            appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
        };
    }
    
    // Попытка получить из window (для браузера)
    if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
        return window.__FIREBASE_CONFIG__;
    }
    
    // Значения по умолчанию (замените на свои)
    return {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
}

var firebaseConfig = getFirebaseConfig();

// Инициализация Firebase (будет выполнена после загрузки Firebase SDK)
var firebaseApp = null;
var firebaseAuth = null;
var firebaseFirestore = null;
var firebaseStorage = null;

// Инициализация Firebase при загрузке
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK не загружен. Убедитесь, что подключены скрипты Firebase.');
        return false;
    }

    try {
        // Инициализация приложения
        firebaseApp = firebase.initializeApp(firebaseConfig);
        
        // Инициализация сервисов
        firebaseAuth = firebase.auth();
        firebaseFirestore = firebase.firestore();
        firebaseStorage = firebase.storage();
        
        return true;
    } catch (error) {
        if (typeof logError !== 'undefined') {
            logError('Ошибка инициализации Firebase', error);
        }
        return false;
    }
}

// Проверка инициализации Firebase
function isFirebaseInitialized() {
    return firebaseApp !== null && firebaseAuth !== null && firebaseFirestore !== null;
}

// Получение экземпляра Firestore
function getFirestore() {
    if (!isFirebaseInitialized()) {
        initFirebase();
    }
    return firebaseFirestore;
}

// Получение экземпляра Auth
function getAuth() {
    if (!isFirebaseInitialized()) {
        initFirebase();
    }
    return firebaseAuth;
}

// Получение экземпляра Storage
function getStorage() {
    if (!isFirebaseInitialized()) {
        initFirebase();
    }
    return firebaseStorage;
}

// Экспорт для глобального доступа
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.initFirebase = initFirebase;
    window.isFirebaseInitialized = isFirebaseInitialized;
    window.getFirestore = getFirestore;
    window.getAuth = getAuth;
    window.getStorage = getStorage;
}

