const express = require("express");
const router = express.Router();

const connection = require('../database');

const multer = require("multer");
const multerS3 = require("multer-s3");

const AWS = require('aws-sdk');

const { S3 } = require("@aws-sdk/client-s3");

//AWS S3 connection config
AWS.config.update({
 accessKeyId: process.env.AWS_S3_ACCESS_KEY,
 secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
 region: process.env.AWS_REGION,
});

const s3 = new S3({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },

    region: process.env.AWS_REGION,
});

//Multer S3 storage config
const s3Storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
        cb(null, {fieldname: file.fieldname})
    },
    key: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.fieldname + "_" + file.originalname);
    }
});

const upload = multer({storage: s3Storage});


router.post('/', upload.single('image'), (req, res, next) => {
    //Check if the request contains a file
    if (!req.file) {
        return res.status(400).json({message: "No file uploaded"});
    }

    // The URL of the uploaded file on S3
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${req.file.key}`;

    // Save the imageUrl in MySQL DB
    let date = new Date();
    let formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    
    let sql = `INSERT INTO Photos (URL, Likes, PosterId, EventId, DatePosted) VALUES ("${imageUrl}", 0, 1, 1, "${formattedDate}")`;    
    connection.query(sql, (error, results) => {
        if (error) {
            console.log(error);
        };
    });

    res.status(201).json({
        message: "File added",
        imageUrl: imageUrl
    });
}, (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(500).json({message: err.message});
    } else if (err) {
        return res.status(500).json({message: err.message});
    }
});

module.exports = router;

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// }