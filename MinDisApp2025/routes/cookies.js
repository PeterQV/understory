var express = require('express');
var router = express.Router();

/* sætter cookie */
router.get('/set', async (req, res) => {
    res.cookie('myCookie', 'cookieValue');
    res.json({ message: 'Cookie set!' });
});

/* læser cookie */
router.get('/get', async (req, res) => {
    const cookieValue = req.cookies.myCookie || 'No cookie set!';
    res.json({ message: cookieValue });
});

/* sætter cookie med express-session */
router.get('/set-session', async (req, res) => {
    req.session.myCookie = 'cookieSessionValue';
    res.json({ message: 'Session cookie set!' });
});

/* læser cookie med express-session */
router.get('/get-session', async (req, res) => {
    res.json({ message: req.session.myCookie || 'No cookie set!' });
});

module.exports = router;