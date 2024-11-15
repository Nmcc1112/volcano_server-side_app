var express = require('express');
var router = express.Router();

/* GET All Volcano Data in Specific Country */
router.get('/', function (req, res, next) {
  const allowedParams = ['country', 'populatedWithin'];
  const country = req.query.country;
  const distance = req.query.populatedWithin;
  let populatedWithin = "";
  let query = null;

  const unwantedParams = Object.keys(req.query).filter(param => !allowedParams.includes(param));
  if (unwantedParams.length > 0) {
    res.status(400).json({ error: true, message: "Invalid query parameters. Query parameters are not permitted." });
    return;
  }

  // Handle Concerned Field Name
  if (distance) {
    switch (distance) {
      case "5km":
        populatedWithin = "population_5km";
        break;
      case "10km":
        populatedWithin = "population_10km";
        break;
      case "30km":
        populatedWithin = "population_30km";
        break;
      case "100km":
        populatedWithin = "population_100km";
        break;
      default:
        if (distance) {
          res.status(400).json({ error: true, message: "Invalid query parameters. Query parameters are not permitted." });
          return;
        }
    }  
  }

  if (!country) {
    res.status(400).json({ error: true, message: "Country is a required query parameter." });
    return;
  }

  if (populatedWithin) {
    query = req.db.from("data").select("*").where("country", "=", country).andWhere(populatedWithin, ">", 0);
  } else {
    query = req.db.from("data").select("*").where("country", "=", country);
  }

  query.then((data) => {
    res.status(200).json(data);
  });
});

module.exports = router;
