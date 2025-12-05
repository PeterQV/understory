var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
require('dotenv').config();

// Routes
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var chatRouter = require('./routes/deepseek');
var app = express();

// Trust proxy for nginx
app.set('trust proxy', 1);

// Basic middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Simple session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 30 * 60 * 1000
  }
}));

// Static files - PUBLIC mappen (uden login)
app.use(express.static(path.join(__dirname, 'MinDisApp2025', 'public')));

// Root route
app.get('/', (req, res) => {
  if (req.session.user) {
    // Hvis bruger er logget ind, redirect til beskyttet forside
    return res.redirect('/forside');
  }
  // Hvis ikke logget ind, vis index.html (login side)
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'public', 'index.html'));
});

// Login route
app.get('/login', (req, res) => {
  if (req.session.user) {
    // Hvis allerede logget ind, redirect til forside
    return res.redirect('/forside');
  }
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'public', 'login.html'));
});

// 🔴 BESKYTTET: Forside (kræver login)
app.get('/forside', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'protected', 'forside.html'));
});

// 🔴 BESKYTTET: Forside.html (alternativ URL)
app.get('/forside.html', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'protected', 'forside.html'));
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
app.use('/users', usersRouter);

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