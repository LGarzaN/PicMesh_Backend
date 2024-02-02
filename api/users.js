const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.status(200).json({
        message: "users"
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