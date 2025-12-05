var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var rateLimit = require('express-rate-limit');

// Routes
var usersRouter = require('./routes/users');
var session = require('express-session');
var authRouter = require('./routes/auth');
var chatRouter = require('./routes/deepseek');
var app = express();

// Trust proxy for HTTPS og load balancer
app.set('trust proxy', 1);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Rate limiting
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 100, // Limit hver IP til 100 requests per windowMs
  message: {
    error: 'For mange forespørgsler. Vent venligst 15 minutter.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Session middleware - SIMPLIFICERET VERSION
app.use(session({
  secret: process.env.SESSION_SECRET || 'din-hemmelige-nøgle-her-som-skal-være-lang',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Brug secure cookies i production
    maxAge: 30 * 60 * 1000, // 30 minutter
    sameSite: 'lax' // For bedre sikkerhed
  },
  // Brug MemoryStore til test, eller Redis hvis det er konfigureret
  store: (function() {
    try {
      // Prøv at bruge Redis hvis det er tilgængeligt
      const RedisStore = require('connect-redis').default;
      const { createClient } = require('redis');
      
      let redisClient;
      
      if (process.env.REDIS_URL) {
        redisClient = createClient({ url: process.env.REDIS_URL });
      } else {
        redisClient = createClient({
          socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379
          },
          password: process.env.REDIS_PASSWORD || undefined
        });
      }
      
      redisClient.connect().catch(err => {
        console.warn('Redis connection failed, using memory store:', err.message);
        return null;
      });
      
      return new RedisStore({ client: redisClient });
    } catch (error) {
      console.warn('Redis not available, using memory store for sessions');
      return new session.MemoryStore(); // Fallback til memory store
    }
  })()
}));

// 🔴 RETTET: Static file serving - korrekt sti
app.use(express.static(path.join(__dirname, 'MinDisApp2025', 'public')));

// Brug rate limiting på chat API
app.use('/api/chat', chatLimiter);

// 🔴 BESKYTTEDE ROUTES - korrekte stier
app.get('/forside.html', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'forside.html'));
});

app.get('/forside', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'forside.html'));
});

// 🔴 ROUTE FOR RODEN (/) - korrekt sti
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/forside');
  }
  res.sendFile(path.join(__dirname, 'MinDisApp2025', 'public', 'index.html'));
});

// Brug routers
app.use('/auth', authRouter);
app.use('/api', chatRouter);
app.use('/users', usersRouter);

// Tilføj en health check endpoint for load balancer
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err);
  
  res.status(err.status || 500);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Fejl ${err.status || 500}</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #d32f2f; }
            a { color: #1976d2; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>${err.message}</h1>
        <h2>Status kode: ${err.status || 500}</h2>
        ${req.app.get('env') === 'development' ? `<pre>${err.stack}</pre>` : ''}
        <br><br>
        <a href="/">&#8592; Tilbage til forsiden</a>
    </body>
    </html>
  `);
});

// Tilføj process signal håndtering for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server kører på port ${server.address().port}`);
});

module.exports = app;