const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const reviewSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    body: String,
    rating: Number,

});

module.exports = mongoose.model("Review", reviewSchema);