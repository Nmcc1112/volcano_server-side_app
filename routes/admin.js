var express = require('express');
var router = express.Router();

/* GET My Student Information */
router.get('/', function (req, res, next) {
    res.status(200).json({ name: "Nmcc1112", student_number: "xxxxxxxxx" });
});

module.exports = router;