var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
// Support både connect-redis v9 (default export) og ældre der returnerer en factory
const connectRedis = require('connect-redis');
const { createClient } = require('redis');
// i app.js eller bin/www
require('dotenv').config();


// Routes
//var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var chatRouter = require('./routes/deepseek');
var app = express();

// Redis client til delete sessions på tværs af PM2 cluster workers
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  }
});

redisClient.on('error', (err) => console.error('Redis client error', err));
redisClient.connect().catch((err) => console.error('Redis connect error', err));

// Fallback så vi kan køre både ny og gammel connect-redis
let RedisStore;
if (connectRedis && typeof connectRedis === 'function' && !connectRedis.default) {
  // Ældre version: require('connect-redis')(session)
  RedisStore = connectRedis(session);
} else if (connectRedis && typeof connectRedis.default === 'function') {
  // Nyere version CommonJS import med default export
  RedisStore = connectRedis.default;
} else if (connectRedis && typeof connectRedis.RedisStore === 'function') {
  // Eventuel named export
  RedisStore = connectRedis.RedisStore;
} else {
  throw new Error('connect-redis: kunne ikke finde en gyldig RedisStore constructor');
}

// Trust proxy for nginx
app.set('trust proxy', 1);

// Basic middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(session({
  store: new RedisStore({
    client: redisClient,
    prefix: process.env.REDIS_PREFIX || 'sess:'
  }),
  secret: process.env.SESSION_SECRET || 'default-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge: 30 * 60 * 1000
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/auth/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 🔴 BESKYTTEDE ROUTES
app.get('/forside.html', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'protected', 'forside.html'));
});

app.get('/forside', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'protected', 'forside.html'));
});

// 🔴 ROUTE FOR RODEN (/)
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/forside');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    server: 'understory.ninja',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Use routers
app.use('/auth', authRouter);
app.use('/api', chatRouter);
//app.use('/users', usersRouter);
//app.use('/middleware', require('./routes/middleware'));

// 404 handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message,
    status: err.status || 500
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;