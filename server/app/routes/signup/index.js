'use strict';
const router = require('express').Router();
const busboy = require('connect-busboy');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Athlete = mongoose.model('Athlete');
const Sport = mongoose.model('Sport');
module.exports = router;

router.use(busboy());

// refactor into promises if have time
router.post('/profile-image', function(req, res, next) {
    let fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        filename = filename + Date.now();
        // store image temporarily
        fstream = fs.createWriteStream(path.join(__dirname, '../../../temp-assets/' + filename));
        file.pipe(fstream);
        fstream.on('close', function () {
             //aws credentials
             const key = require(path.join(__dirname, '../../../env')).AMAZON_S3_KEY;
             const secret = require(path.join(__dirname, '../../../env')).AMAZON_S3_SECRET;
             AWS.config = new AWS.Config();
             AWS.config.accessKeyId = require(path.join(__dirname, '../../../env')).AMAZON_S3_KEY;
             AWS.config.secretAccessKey = require(path.join(__dirname, '../../../env')).AMAZON_S3_SECRET;
             AWS.config.apiVersions = { "s3": "2006-03-01" };
             const s3 = new AWS.S3();
             const bodystream = fs.createReadStream(path.join(__dirname, '../../../temp-assets/' + filename));

             const params = {
                'Bucket': 'et-opensponsorship',
                'Key': 'uploads/athlete-photos/' + filename,
                'Body': bodystream,
                'ContentEncoding': 'base64', 
                'ContentType ': 'image/jpeg',
                'ACL':'public-read-write'
             };

             // upload to amazon s3
             s3.upload(params, function(err, data) {
                const imageUrl = data.Location;
                // delete temp image
                fs.unlink(path.join(__dirname, '../../../temp-assets/' + filename), (err) => {
                    if (err) return console.error(err);
                    res.json({ 'imageUrl': imageUrl });
                });
             });
        });
    });
});

router.get('/sport', (req, res, next) => {
    Sport.find({})
    .then(sports => { 
        res.json(sports);
    })
    .catch(err => next(err));
});




