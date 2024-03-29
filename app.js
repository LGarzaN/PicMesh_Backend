const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");

const usersRoute = require("./api/users");
const photosRoute = require("./api/photos");
const eventsRoute = require("./api/events");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Headers', 'PUT, POST, GET, DELETE');
        return res.status(200).json({});
    }
    next();
})

app.use('/users', usersRoute);
app.use('/photos', photosRoute);
app.use('/events', eventsRoute);


app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message || "Internal Server Error"
        }
    });
});

module.exports = app;