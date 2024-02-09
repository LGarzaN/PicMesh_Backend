const AWS = require('aws-sdk')

function generateUrl(imageUrl) {
    const s3 = new AWS.S3()
    AWS.config.update({accessKeyId: process.env.AWS_S3_ACCESS_KEY, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY, region: process.env.AWS_REGION})

    const myBucket = process.env.AWS_S3_BUCKET_NAME
    const myKey = imageUrl
    //never expires
    const signedUrlExpireSeconds = 60 * 60 * 24 * 7

    const url = s3.getSignedUrl('getObject', {
        Bucket: myBucket,
        Key: myKey,
        Expires: signedUrlExpireSeconds
    })
    return url;
}

module.exports = generateUrl;