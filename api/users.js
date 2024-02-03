const express = require("express");
const router = express.Router();
const connection = require('../database');

router.get("/", (req, res, next) => {
    let sql = 'SELECT * FROM Users';
    connection.query(sql, (error, results, fields) => {
        if (error) {
            res.status(500).json({
                error: error.message
            })
        };
        res.status(200).json({
            message: results,
            fields: fields
        })
    });
});

router.post("/", (req, res, next) => {
    const user = {
        name: req.body.name,
        price: req.body.price
    };
    res.status(201).json({
        message: "users",
        createdUser: user
    });
});

module.exports = router;