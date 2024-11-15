var express = require('express');
var router = express.Router();
var { verifyToken } = require("../helpers/utils");

/* GET the Specific Volcano Details */
router.get('/:id', function (req, res, next) {
  const token = req.header("Authorization");
  const volcano_id = req.params.id;
  if (token && !token.startsWith('Bearer ')){
    res.status(401).json({ error: true, message: "Authorization header is malformed" });
    return;
  }

  const tokenAuth = verifyToken(req);
  if (token && tokenAuth == false) {
    res.status(401).json({ error: true, message: "Invalid JWT token" });
    return;
  }

  const parsed_id = parseInt(volcano_id);
  if (isNaN(parsed_id) || !(parsed_id.toString() === volcano_id.toString())) {
    res.status(400).json({ error: true, message: "Invalid query parameters. Query parameters are not permitted." });
    return;
  }

  const findVolcano = req.db.from("data").select("*").where("id", "=", volcano_id);
  findVolcano.then((data) => {
    if (data.length === 0) {
      res.status(404).json({ error: true, message: `Volcano with ID: ${volcano_id} not found.` });
      return;
    }
    if (token && tokenAuth) {
      res.status(200).json(data[0]);
    }
    if (!token) {
      const volcanoQuery = req.db.from("data").select("id", "name", "country", "region", "subregion", "last_eruption", "summit", "elevation", "latitude", "longitude").where("id", "=", volcano_id);
      volcanoQuery.then((details) => {
        res.status(200).json(details[0]);
      })
    }
  })
});

module.exports = router;