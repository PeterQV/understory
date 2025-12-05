var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

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

// Simple session - uden Redis (for nu)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Sæt til true når du har HTTPS
    maxAge: 30 * 60 * 1000
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'MinDisApp2025', 'public')));

// Basic routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'public', 'index.html'));
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