const { string } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema;

const Campground = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    location: String,
    Status: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});


module.exports = mongoose.model('Form', Campground)