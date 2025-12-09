/*var express = require('express');
var router = express.Router();


const middleware = async (req, res, next) => {
    if (req.cookies['connect.sid']) {
        next();
    } else {
        res.json({ message: 'No session cookie!' });
    }
}


router.get('/', middleware, async (req, res) => {
    res.json({ message: 'Cookie found!', cookies: req.cookies.myCookie });
});


module.exports = router;*/