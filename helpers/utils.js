const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : "";
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;
    } catch (err) {
        return false;
    }
    return req.user;
};

module.exports = {
    verifyToken
};