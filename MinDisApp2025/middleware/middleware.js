
// middleware/middleware.js
module.exports = function requireAuth(req, res, next) {
  console.log('🔍 Middleware kører for:', req.method, req.path);
  console.log('Session user:', req.session?.user);
  
  if (req.session && req.session.user) {
    console.log('✅ Bruger autentificeret');
    return next();
  }
  
  console.log('❌ Bruger ikke autentificeret');
  return res.status(401).json({ success: false, message: 'Ikke logget ind' });
};