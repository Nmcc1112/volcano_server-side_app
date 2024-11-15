var express = require('express');
var router = express.Router();

/* GET Country List */
router.get('/', function (req, res, next) {
    req.db
        .from('data')
        .distinct('country')
        .orderBy('country', 'asc')
        .then((data) => {
            const countries = data.map(row => row.country);
            res.status(200).json(countries);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ error: true, message: "Invalid query parameters. Query parameters are not permitted." });
        })
});

router.get('/count', function (req, res, next) {
    req.db
        .select('country')
        .from('data')
        .count('* as total')
        .groupBy('country')
        .orderBy('country')
        .then((data) => {
            console.log('count data: ', data);
            res.status(200).json(data);
            return;
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ error: true, message: "Invalid query parameters. Query parameters are not permitted." });
        })
        
});

module.exports = router;