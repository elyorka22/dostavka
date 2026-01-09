// Простой Node.js сервер для регистрации и входа
// Для деплоя на Railway

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // PostgreSQL

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL (Railway автоматически предоставляет DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Создание таблицы пользователей при первом запуске
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                role VARCHAR(50) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('База данных инициализирована');
    } catch (error) {
        console.error('Ошибка инициализации БД:', error);
    }
}

// Инициализация при запуске
initDatabase();

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Валидация
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Имя, email и пароль обязательны' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Пароль должен содержать минимум 6 символов' 
            });
        }

        // Проверка, существует ли пользователь
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Пользователь с таким email уже существует' 
            });
        }

        // Хеширование пароля
        const passwordHash = await bcrypt.hash(password, 10);

        // Создание пользователя
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name, phone, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, email, name, phone, role, created_at`,
            [email, passwordHash, name, phone || null, 'customer']
        );

        const user = result.rows[0];

        // Создание JWT токена
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role
            },
            token: token
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера при регистрации' 
        });
    }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email и пароль обязательны' 
            });
        }

        // Поиск пользователя
        const result = await pool.query(
            'SELECT id, email, password_hash, name, phone, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Неверный email или пароль' 
            });
        }

        const user = result.rows[0];

        // Проверка пароля
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ 
                error: 'Неверный email или пароль' 
            });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role
            },
            token: token
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера при входе' 
        });
    }
});

// Получение текущего пользователя
app.get('/api/users/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                error: 'Токен не предоставлен' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(
            'SELECT id, email, name, phone, role FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Пользователь не найден' 
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(401).json({ 
            error: 'Неверный токен' 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

