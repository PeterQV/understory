var express = require('express');
var router = express.Router();

/* simpel middleware der tjekker om cookie eksisterer */
const middleware = async (req, res, next) => {
    if (req.cookies.myCookie == 'cookieValue') {
        next();
    } else {
        res.json({ message: 'No middleware route access!' });
    }
}

/* middleware der tjekker om cookie eksisterer */
/* husk GET /cookie/set for at sætte cookie først */
router.get('/', middleware, async (req, res) => {
    res.json({ message: 'Cookie found!', cookies: req.cookies.myCookie });
});

// Simple session-guard middleware til at beskytte /users endpoints
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ success: false, message: 'Ikke logget ind' });
};

module.exports = router;