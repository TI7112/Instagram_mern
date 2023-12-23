const mongoose = require('mongoose');

const commentScema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    comment: String,
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]

}, {
    timestamps: true
})

exports.Comment = mongoose.model("comment", commentScema);