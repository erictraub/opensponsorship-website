'use strict';
const router = require('express').Router();
const mongoose = require('mongoose');
const Athlete = mongoose.model('Athlete');
module.exports = router;

router.post('/', function(req, res, next) {
    req.checkBody("firstName", "'First name' is required.").notEmpty();
    req.checkBody("lastName", "'Last name' is required.").notEmpty();
    req.checkBody("gender", "'Gender' is required.").notEmpty();
    req.checkBody("dateOfBirth", "'Date of Birth' is required.").notEmpty();
    const errors = req.validationErrors();
    if (errors) return res.json(errors);
    Athlete.create(req.body)
    .then(newAthlete => {
        res.json(newAthlete);
    })
    .catch(err => next(err));
});

router.get('/', (req, res, next) => {
    Athlete.find({})
    .then(athletes => { 
        res.json(athletes);
    })
    .catch(err => next(err));
});

router.put('/:athleteId', (req, res, next) => {
    Athlete.findByIdAndUpdate(req.params.athleteId, req.body, {new: true})
    .then(function(updatedAthlete){
        res.status(200).send(updatedAthlete);
    })
    .catch(next);
});

