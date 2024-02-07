const express = require("express");
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get("/:phone", (req, res, next) => {
    let sql = 'SELECT * FROM Users WHERE Phone = ' + req.params.phone;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            return res.status(500).json({
                error: error.message
            })
        }
        if (results.length < 1) {
            return res.status(404).json({
                message: "No user found"
            })
        }
        res.status(200).json({
            user: results,
        })
    });
});

router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        } else{
            const user = {
                email: req.body.email,
                password: hash,
                username: req.body.username,
                phone: req.body.phone,
            };
            let sql1 = `Select * from Users where Phone = "${user.phone}"`;
            connection.query(sql1, (error, results) => {
                if (error) {
                    res.status(500).json({
                        error: error.message
                    });
                } else if (results.length > 0) {
                    return res.status(409).json({
                        message: "User already exists"
                    });
                } else {
                    let sql = `INSERT INTO Users (Email, Password, UserName, Phone, ProfilePicture) VALUES ("${user.email}", "${user.password}", "${user.username}", "${user.phone}", "")`;
                    connection.query(sql, (error, results) => {
                        if (error) {
                            res.status(500).json({
                                error: error.message
                            });
                        } else {
                            res.status(201).json({
                                message: "User created successfully",
                                createdUser: user
                            });
                        }
                    });
                }
            }
            );

        }
    });
});

router.post("/login", (req, res, next) => {
    let sql = `Select * from Users where Phone = "${req.body.phone}"`;
    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({
                error: error.message
            });
        } else if (results.length < 1) {
            return res.status(401).json({
                message: "No User found"
            });
        } else {
            bcrypt.compare(req.body.password, results[0].Password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Incorrect password"
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        phone: results[0].Phone,
                        userId: results[0].UserId
                    }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    });
                    return res.status(200).json({
                        message: "Auth successful",
                        token: token
                    });
                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        }
    });
});

module.exports = router;