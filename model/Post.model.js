const mongoose = require('mongoose');

const postScema = new mongoose.Schema({
    caption: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    image: String,
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    comment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        },
    ],
}, {
    timestamps: true
})

exports.Post = mongoose.model("post", postScema);