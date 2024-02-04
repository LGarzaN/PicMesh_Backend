const express = require("express");
const router = express.Router();

const connection = require('../database');

const multer = require("multer");
const multerS3 = require("multer-s3");

const AWS = require('aws-sdk');

const { S3 } = require("@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

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

//Post image to S3 and DB
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

//Get all the photos for a specific event
router.get('/event/:id', (req, res) => {
    let sql = `SELECT URL, Likes, PosterId, DatePosted FROM Photos WHERE EventId = ${req.params.id} AND IsDeleted = 0`;
    connection.query(sql, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.status(200).json(results);
        }
    });
});

//Get all the photos a specific user has uploaded and have not been deleted
router.get('/user/:id', (req, res) => {
    let sql = `SELECT URL, Likes, PosterId, DatePosted, EventId FROM Photos WHERE PosterId = ${req.params.id} AND IsDeleted = 0`;
    connection.query(sql, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.status(200).json(results);
        }
    });
});

//Like photo
router.patch('/like/:id', (req, res) => {
    let sql = `UPDATE Photos SET Likes = Likes + 1 WHERE PhotoId = ${req.params.id}`;
    connection.query(sql, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.status(200).json({message: "Like added"});
        }
    });
});

router.delete('/:id', async (req, res) => {
    // Get the ID of the photo from the URL parameters
    const id = req.params.id;

    // Fetch the photo from the database
    connection.query('SELECT * FROM Photos WHERE Photoid = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({message: error.message});
        }

        if (results.length === 0) {
            return res.status(404).json({message: 'Photo not found'});
        }

        const photo = results[0];

        // Extract the key from the URL of the photo
        const url = new URL(photo.URL);
        const key = decodeURIComponent(url.pathname.substr(1));

        // Delete the photo from S3
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });

        s3.send(command).then(() => {
            // Update IsDeleted column in database
            connection.query('UPDATE Photos SET IsDeleted = 1 WHERE PhotoId = ?', [id], (error, results) => {
                if (error) {
                    return res.status(500).json({message: error.message});
                }

                res.status(200).json({message: 'Photo deleted successfully'});
            });
        }).catch((error) => {
            console.error(`Error deleting ${key}:`, error);
            res.status(500).json({message: 'Failed to delete photo'});
        });
    });
});

module.exports = router;

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// }