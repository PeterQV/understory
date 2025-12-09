var express = require('express');
var router = express.Router();

/* simpel middleware der tjekker om cookie eksisterer */
const middleware = async (req, res, next) => {
    if (req.cookies['connect.sid']) {
        next();
    } else {
        res.json({ message: 'No session cookie!' });
    }
}

/* middleware der tjekker om cookie eksisterer */
/* husk GET /cookie/set for at sætte cookie først */
router.get('/', middleware, async (req, res) => {
    res.json({ message: 'Cookie found!', cookies: req.cookies.myCookie });
});


module.exports = router;