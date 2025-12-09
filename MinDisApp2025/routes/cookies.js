/*var express = require('express');
var router = express.Router();


router.get('/set', async (req, res) => {
    res.cookie('myCookie', 'cookieValue');
    res.json({ message: 'Cookie set!' });
});


router.get('/get', async (req, res) => {
    const cookieValue = req.cookies.myCookie || 'No cookie set!';
    res.json({ message: cookieValue });
});


router.get('/set-session', async (req, res) => {
    req.session.myCookie = 'cookieSessionValue';
    res.json({ message: 'Session cookie set!' });
});


router.get('/get-session', async (req, res) => {
    res.json({ message: req.session.myCookie || 'No cookie set!' });
});

module.exports = router;*/