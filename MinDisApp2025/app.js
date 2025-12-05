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

// 🔴 VIGTIGT: Definer PUBLIC mappe KORREKT
const publicDir = path.join(__dirname, 'MinDisApp2025', 'public');
console.log(`Serving static files from: ${publicDir}`);

// Static files
app.use(express.static(publicDir));

// Root route - index.html
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/forside');
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Login route - login.html
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/forside');
  }
  res.sendFile(path.join(publicDir, 'login.html'));
});

// 🔴 BESKYTTET: Forside (kræver login)
app.get('/forside', (req, res) => {
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
  // Hvis det er en HTML fil, prøv at sende den som fil
  if (req.path.endsWith('.html')) {
    const possiblePaths = [
      path.join(publicDir, req.path),
      path.join(publicDir, req.path.replace(/^\//, '')),
      path.join(__dirname, 'MinDisApp2025', 'public', req.path),
      path.join(__dirname, 'MinDisApp2025', 'public', req.path.replace(/^\//, ''))
    ];
    
    for (const filePath of possiblePaths) {
      try {
        if (require('fs').existsSync(filePath)) {
          return res.sendFile(filePath);
        }
      } catch (err) {
        continue;
      }
    }
  }
  
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  console.error('Error:', err.message);
  console.error('Path:', req.path);
  
  // Hvis 404, redirect til login eller send besked
  if (err.status === 404) {
    if (req.path === '/forside') {
      return res.redirect('/login');
    }
    return res.status(404).send('Side ikke fundet: ' + req.path);
  }
  
  res.status(err.status || 500).json({
    error: err.message,
    status: err.status || 500
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Public directory: ${publicDir}`);
  console.log(`Protected directory: ${path.join(__dirname, 'MinDisApp2025', 'protected')}`);
});

module.exports = app;