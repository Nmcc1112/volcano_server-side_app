var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var { verifyToken } = require("../helpers/utils");
dotenv.config();

/* POST user registration */
router.post('/register', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    return;
  }

  const findUser = req.db.from("users").select("*").where("email", "=", email);
  findUser.then((data) => {
    if (data.length > 0) {
      res.status(409).json({ error: true, message: "User already exists" });
      return;
    }

    const saltRounds = 10;
    const hash_password = bcrypt.hashSync(password, saltRounds);
    return req.db.from("users").insert({ email: email, password: hash_password });
  })
    .then(() => {
      res.status(201).json({ message: "User created" });
    })
});

/* POST User Login */
router.post('/login', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    return;
  }

  req.db.from("users").select("*").where("email", "=", email)
    .then((data) => {
      if (data.length === 0) {
        res.status(401).json({ error: true, message: "Incorrect email or password" });
        return null;
      }
      return bcrypt.compare(password, data[0].password);
    })
    .then((match) => {
      if (match === null) return; 

      if (!match) {
        res.status(401).json({ error: true, message: "Incorrect email or password" });
        return;
      }

      const expire_time = 86400;
      const exp = Math.floor(Date.now() / 1000) + expire_time;
      const token = jwt.sign({ exp, email }, process.env.TOKEN_SECRET);
      res.status(200).json({ token: token, token_type: "Bearer", expires_in: expire_time });
    })
});

/* GET User Profile */
router.get('/:email/profile', async (req, res, next) => {
  try {
    const email = req.params.email;
    const token = req.header("Authorization");
    var tokenAuth;

    if (token) {
      tokenAuth = verifyToken(req);
      if (tokenAuth && tokenAuth.exp <= Math.floor(Date.now() / 1000)) {
        return res.status(401).json({ error: true, message: "JWT token has expired" });
      }
    }

    const profileQuery = req.db.from("users").select("*").where("email", email);
    profileQuery.then((data) => {
      if (data.length === 0) {
        return res.status(404).json({ error: true, message: "User not found" });
      }

      const profile = data[0];

      if (tokenAuth && tokenAuth.email === email) {
        return res.status(200).json({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          dob: profile.dob,
          address: profile.address,
        });
      } else {
        return res.status(200).json({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
      }
    })
  } catch (error) {
    next(error);
  }
});

/* Update User Profile */
router.put('/:email/profile', function(req, res, next) {
  const email = req.params.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const dob = req.body.dob;
  const address = req.body.address;
  const token = req.header("Authorization");
  
  if (!firstName || !lastName || !dob || !address) {
    res.status(400).json({ error: true, message: "Request body incomplete: firstName, lastName, dob and address are required." });
    return;
  }

  if (typeof firstName != "string" || typeof lastName != "string" || typeof dob != "string" || typeof address != "string") {
    console.log('type of firstName: ', typeof firstName);
    res.status(400).json({ error: true, message: "Request body invalid: firstName, lastName and address must be strings only." });
    return;
  }

  if (!token) {
    res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
    return;
  }

  const authToken = verifyToken(req);
  if (authToken && authToken.email != email) {
    res.status(403).json({ error: true, message: "Forbidden" });
    return;
  }

  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  const isDobValid = dateFormat.test(dob);
  if (!isDobValid) {
    res.status(400).json({ error: true, message: "Invalid input: dob must be a real date in format YYYY-MM-DD." });
    return;
  }

  if (isDobValid && authToken && authToken.email === email) {
    const dateObject = new Date(dob);
    if (isNaN(dateObject.getTime()) || dob !== dateObject.toISOString().split('T')[0]) {
      res.status(400).json({ error: true, message: "Invalid input: dob must be a real date in format YYYY-MM-DD." });
      return;
    } 
    if (new Date() < new Date(dob)) {
      res.status(400).json({ error: true, message: "Invalid input: dob must be a date in the past." });
      return;
    }

    const updateProfile = req.db.from("users").where("email", "=", email).update({ email, firstName, lastName, dob, address });
    updateProfile.then(() => {
      res.status(200).json({ email, firstName, lastName, dob, address});
      return;
    })
  }
})

module.exports = router;
