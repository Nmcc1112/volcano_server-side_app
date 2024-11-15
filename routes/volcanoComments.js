var express = require('express');
var router = express.Router();
var { verifyToken } = require("../helpers/utils");

/* POST Comments on Sepecific Volcano */
router.post('/:id', function (req, res, next) {
    const volcano_id = req.params.id;
    const comment = req.body.comment;
    const token = req.header("Authorization");

    if (!comment) {
        res.status(400).json({ error: true, message: "Request body incomplete: comment is required. " });
        return;
    }

    if (!token) {
        res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
        return;
    }

    const authToken = verifyToken(req);
    if (!authToken) {
        res.status(403).json({ error: true, message: "Forbidden" });
        return;
    }

    const findVolcano = req.db.from("data").select("*").where("id", "=", volcano_id);
    findVolcano.then((data) => {
        if (data.length === 0) {
            res.status(404).json({ error: true, message: `Volcano with ID: ${volcano_id} not found.` });
            return;
        }

        const user_email = authToken.email;
        console.log('user email: ', user_email);
        const sendComment = req.db.from("volcano_comments").insert({ volcano_id: volcano_id, comments: comment, user_email: user_email, datetime: new Date() });
        sendComment.then(() => {
            res.status(200).json({ message: "Comment is posted successfully." });
            return
        })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ error: true, message: "Internal Server Error." });
            });
    });
});

/* GET Volcano Comments by Given ID */
router.get('/:id', function (req, res, next) {
    const volcano_id = req.params.id;
    const token = req.header("Authorization");

    if (!token) {
        res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
        return;
    }

    const authToken = verifyToken(req);
    if (!authToken) {
        res.status(403).json({ error: true, message: "Forbidden" });
        return;
    }

    const findVolcano = req.db.from("data").select("*").where("id", "=", volcano_id);
    findVolcano.then((data) => {
        if (data.length === 0) {
            res.status(404).json({ error: true, message: `Volcano with ID: ${volcano_id} not found.` });
            return;
        }

        const commentQuery = req.db.from("volcano_comments").select("*").where("volcano_id", "=", volcano_id);
        commentQuery.then((comments) => {
            res.status(200).json(comments);
        })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ error: true, message: "Internal Server Error." });
            })
    })

})

module.exports = router;