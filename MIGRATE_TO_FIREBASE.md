# 📦 Миграция данных в Firebase перед деплоем

## ✅ Что уже сделано

Код обновлен для работы с Firebase:
- ✅ Демо данные создаются только локально (localhost)
- ✅ В продакшене данные загружаются из Firebase
- ✅ Автоматическое переключение на Firebase режим при деплое

## 🎯 Что нужно сделать

### Вариант 1: Добавить данные через админ-панель (рекомендуется)

После деплоя:
1. Зайдите на сайт
2. Войдите как admin (admin / admin123)
3. Добавьте товары, категории через админ-панель
4. Данные автоматически сохранятся в Firebase

### Вариант 2: Миграция существующих данных

Если у вас уже есть данные в localStorage, можно мигрировать их в Firebase:

#### Шаг 1: Откройте консоль браузера на локальном сайте

```bash
python3 -m http.server 8000
```

Откройте `http://localhost:8000`

#### Шаг 2: Выполните миграцию

В консоли браузера (F12) выполните:

```javascript
// 1. Инициализировать Firebase
initFirebase();

// 2. Переключить на Firebase режим
setAPIMode('firebase');

// 3. Мигрировать товары
var products = getAllProducts();
for (var i = 0; i < products.length; i++) {
    ProductsAPI.create(products[i]).then(function(result) {
        console.log('Товар добавлен:', result);
    });
}

// 4. Мигрировать категории
var categories = getAllCategories();
for (var categoryId in categories) {
    if (categories.hasOwnProperty(categoryId)) {
        var category = categories[categoryId];
        category.id = categoryId;
        // Используем Firestore напрямую
        var db = getFirestore();
        db.collection('categories').doc(categoryId).set(category);
    }
}
```

#### Шаг 3: Проверка

1. Откройте Firebase Console
2. Перейдите в Firestore Database
3. Убедитесь, что данные появились

## 📋 Структура данных в Firebase

### Коллекция: products

```javascript
{
  id: "auto-generated",
  name: "Pomidor cherri",
  category: "vegetables",
  weight: "250 g",
  unit: "упак",
  price: 18900,
  badge: "Hit",
  image: "url или путь",
  createdAt: timestamp
}
```

### Коллекция: categories

```javascript
{
  id: "vegetables", // ID документа
  name: "Sabzavotlar",
  image: "url или null",
  icon: "vegetables"
}
```

### Коллекция: users

```javascript
{
  id: "auto-generated",
  login: "admin",
  name: "Super-admin",
  role: "super-admin",
  email: "admin@delivery.uz"
  // Пароль НЕ хранится здесь! Используйте Firebase Auth
}
```

## ⚠️ Важно про пользователей

**Пользователи должны быть в Firebase Authentication, а не в Firestore!**

Для создания пользователей в Firebase Auth:

1. Откройте Firebase Console
2. Перейдите в **Authentication** > **Users**
3. Нажмите **Add user** (Добавить пользователя)
4. Создайте пользователей:
   - admin@delivery.uz / admin123
   - manager@delivery.uz / manager123
   - и т.д.

5. Затем создайте документы в Firestore collection `users` с дополнительной информацией:
   - role (super-admin, manager, etc.)
   - name
   - и т.д.

## 🔧 Автоматическая миграция (скрипт)

Создайте файл `migrate.html` для миграции:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Миграция данных</title>
</head>
<body>
    <h1>Миграция данных в Firebase</h1>
    <button onclick="migrate()">Начать миграцию</button>
    <div id="status"></div>
    
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <script src="js/firebase-config.js"></script>
    <script src="js/products.js"></script>
    <script src="js/categories.js"></script>
    
    <script>
        function migrate() {
            initFirebase();
            setAPIMode('firebase');
            
            // Миграция товаров
            var products = getAllProducts();
            var status = document.getElementById('status');
            status.innerHTML = 'Миграция товаров...';
            
            var promises = [];
            for (var i = 0; i < products.length; i++) {
                promises.push(ProductsAPI.create(products[i]));
            }
            
            Promise.all(promises).then(function() {
                status.innerHTML += '<br>Товары мигрированы!';
                
                // Миграция категорий
                var categories = getAllCategories();
                var db = getFirestore();
                var batch = db.batch();
                
                for (var catId in categories) {
                    if (categories.hasOwnProperty(catId)) {
                        var category = categories[catId];
                        category.id = catId;
                        var docRef = db.collection('categories').doc(catId);
                        batch.set(docRef, category);
                    }
                }
                
                batch.commit().then(function() {
                    status.innerHTML += '<br>Категории мигрированы!';
                    status.innerHTML += '<br><strong>Миграция завершена!</strong>';
                });
            });
        }
    </script>
</body>
</html>
```

## ✅ Чеклист перед деплоем

- [ ] Firebase проект создан
- [ ] Firestore Database настроена
- [ ] Правила безопасности установлены
- [ ] Данные мигрированы в Firebase (или будут добавлены через админ-панель)
- [ ] Пользователи созданы в Firebase Authentication
- [ ] Код обновлен (демо данные только локально)
- [ ] API_MODE=firebase будет установлен в Vercel

## 🎉 Готово!

После миграции данных сайт готов к деплою на Vercel!

