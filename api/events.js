const express = require("express");
const router = express.Router();
const connection = require('../database');

router.post("/", (req, res, next) => {
    try {
        if (!req.body.name || !req.body.creator || !req.body.startDate || !req.body.endDate || !req.body.storageLimit || !req.body.allowCameraRoll) {
            throw new Error("Invalid input. Please fill in all fields.");
        }

        const event = {
            name: req.body.name,
            creator: req.body.creator,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            storageLimit: req.body.storageLimit,
            allowCameraRoll: req.body.allowCameraRoll,
        };

        let sql = `INSERT INTO Events (Name, Creator, StartDate, EndDate, StorageLimit, AllowCameraRoll, NumPhotos, UniquePosters, CurrentStorage) VALUES ("${event.name}", "${event.creator}", "${event.startDate}", "${event.endDate}", ${event.storageLimit}, ${event.allowCameraRoll}, 0, 0, 0)`;
        connection.query(sql, (error, results) => {
            if (error) {
                throw new Error(error.message);
            };
        });
        res.status(201).json({
            message: "Event created succesfully!",
            createdUser: event
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        });
    }

    /*
        Prueba
        {
            "name": "PruebaFest",
            "creator": 1,
            "startDate": "2024-02-17 20:30:00",
            "endDate": "2024-02-17 20:30:00",
            "storageLimit": 2000,
            "allowCameraRoll": 1
        }
    */ 

}); 

router.get("/user/:id", (req, res, next) => {
    let sql = 'SELECT E.* FROM Events E INNER JOIN Joined J ON E.EventId = J.EventId WHERE J.UserId = ' + req.params.id;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            res.status(500).json({
                error: error.message
            })
        };
        res.status(200).json({
            events: results,
        })
    });
});

router.get("/:id", (req, res, next) => {
    let sql = 'SELECT * FROM Events where EventId = ' + req.params.id;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            return res.status(500).json({
                error: error.message
            })
        };
        res.status(200).json({
            events: results,
        })
    });
});



module.exports = router;